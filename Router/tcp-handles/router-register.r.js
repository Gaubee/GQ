const Router = require("koa-router");
const CoBody = require("co-body");
const tcp = require("gq-core/tcp");

// koa请求对象的缓存属性，避免内存泄漏
const ctx_socket_wm = new WeakMap();

exports.install = install;

function install(socket, http_app, waterline_instance) {
	// 请求任务缓存
	const tasks = socket.http_tasks = new Map();

	const router = socket.router = Router();
	const router_generation = socket.router_generation = router.routes();
	const router_allowedmethods_generation = socket.router_allowedmethods_generation = router.allowedMethods();
	http_app.use(router_generation);
	http_app.use(router_allowedmethods_generation);

	// 如果关闭了,socket注册的Router要全部注销掉
	const _close_flag = console.flagHead("SOCKET CLOSE");
	socket.on("close", co.wrap(function*() {

		console.group(_close_flag, "关闭正在执行的请求");
		console.log("当前请求中的任务数：", tasks.size);
		tasks.forEach((ctx, task_id) => {
			console.log(`[${ctx.method}]${ctx.path}`);
			ctx.destory(task_id);
		});
		tasks.clear();
		socket.http_tasks = null;
		console.groupEnd(_close_flag, "关闭正在执行的请求");

		const _flag_content = `注销 [${socket.using_app.app_name}](${socket._id}) 注册的${"路由".inverse}`;

		const _g = console.group(_close_flag, "开始" + _flag_content);
		http_app.middleware.spliceRemove(router_generation);
		http_app.middleware.spliceRemove(router_allowedmethods_generation);
		router.stack.forEach(layer => console.log(`[${layer.methods}]${layer.path}`));
		yield waterline_instance.collections.router_register.destroy({
			socket_id: socket._id
		});
		socket.router = null;
		socket.router_generation = null;
		socket.router_allowedmethods_generation = null;
		console.groupEnd(_g, _close_flag, "完成" + _flag_content);

	}, err => {
		console.flag(_close_flag, err);
	}));


	return co.wrap(function*(data, done) {
		const base_router_register = data.info;
		if (!base_router_register) {
			console.log(new TypeError("router_register_info is null."));
			return done();
		}

		base_router_register.owner = socket.using_app;
		base_router_register.socket_id = socket._id;

		const router_register = yield waterline_instance.collections.router_register.create(data.info)

		console.flag("SERVER>router_register", router_register);

		// application的路由前面要自动加上app_name
		console.log("socket.using_app:", socket.using_app);
		router[router_register.method]("/" + socket.using_app.app_name + router_register.path, function*(next) {
			const ctx = this;

			// 记录基础的路由配置
			ctx.router_register = router_register.$clone();

			// 初始化任务ID
			const task_id = $$.uuid("TASK@");
			tasks.set(task_id, ctx);
			ctx.task_id = task_id;

			// ctx.router_socket = socket;
			Object.definePropertyFromWeakMap(ctx, ctx_socket_wm, "router_socket", {
				initValue: socket
			});

			// 定时器任务，有多个：超时提醒，超时返回等
			const time_tasks = ctx.time_tasks = new Map();

			// 注册销毁函数
			ctx.destory = function() {
				time_tasks.forEach((value, key) => {
					console.log("clearTimeout:", key)
					clearTimeout(value);
					time_tasks.delete(key);
				});
				time_tasks.clear();
				time_tasks.done && time_tasks.done();
				time_tasks.done = $$.noop;
				time_tasks = ctx.time_tasks = null;

				tasks.delete(task_id);

				ctx.router_register = null;

				ctx_socket_wm.delete(ctx); // ctx.router_socket = null;
			};

			// 执行路由所需的参数
			const emit_with = [];
			for (var i = 0, emit_item; emit_item = router_register.emit_with[i]; i += 1) {
				switch (emit_item) {
					case "query":
						emit_with[i] = ctx.request.query;
						break;
					case "params":
						emit_with[i] = ctx.params;
						break;
					case "form":
						emit_with[i] = yield CoBody(ctx, {
							limit: "20MB"
						});
						break;
					case "session":
						emit_with[i] = ctx.session;
						break;
				}
			}


			// 发送任务请求
			socket.msgInfo("emit-task", {
				path: router_register.path,
				method: router_register.method,
				task_id: task_id,
				time_out: router_register.time_out, // 单位是毫秒
				emit_with: emit_with
			});

			return yield with_until_time_out_FACTORY(ctx);
		});

		//返回完成
		socket.msgSuccess("router-register", router_register);
		done();
	}, (err, data, done) => {
		// console.flag("router-register:error", err);
		socket.msgError("router-register", data.info, err);
		done();
	});
};

exports.with_until_time_out_FACTORY = with_until_time_out_FACTORY;

// 超时处理 - 工厂
function with_until_time_out_FACTORY(ctx) {
	return _with_until_time_out;

	function _with_until_time_out(done) {
		const task_id = ctx.task_id;
		const time_tasks = ctx.time_tasks;
		const router_register = ctx.router_register;

		// 清除已有的计时器，并重新开始计时
		time_tasks.forEach((value, key) => {
			console.log("clearTimeout:", key)
			clearTimeout(value);
		});

		if (!time_tasks.done && done) { // 这个done指向response-yield所在的那个上下文，只赋值一次
			time_tasks.done = done;
		}
		if (!router_register.start_time) {
			router_register.start_time = Date.now();
		}
		if (!router_register.extended_timeout) {
			router_register.extended_timeout = 0;
		}
		var time_out = router_register.time_out - (Date.now() - router_register.start_time) + router_register.extended_timeout;

		// 延迟发送任务超时提醒
		var _delay_time = Math.min(10 * 10000, time_out / 3);
		if (_delay_time >= 1 * 900) { // 太急促的延迟提醒就忽略掉

			var _delay_passed_time = time_out - _delay_time;
			var _delay_ti = setTimeout(function() {
				ctx.router_socket.msgInfo("task-timeout", {
					task_id: task_id,
					passed_time: Date.now() - router_register.start_time
				});
				_delay_ti = null;
			}, _delay_passed_time);

			time_tasks.set("delay_ti", _delay_ti);
		}


		// 超时结束任务
		var _over_time_ti = setTimeout(function() {
			ctx.status = 408;
			// ctx.body = "TIME OUT";
			// 告诉应用这次请求已经发送了，因为超时没有相应
			ctx.router_socket.msgError("return-task", {
				task_id: task_id,
				error: {
					details: "request time-out",
					status_code: 408
				}
			});

			// 销毁ctx，并结束请求
			ctx.destory();

			_over_time_ti = null;
		}, time_out);
		time_tasks.set("over_time_ti", _over_time_ti);
	};
};