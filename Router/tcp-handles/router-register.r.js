var Router = require("koa-router");
var tcp = require("../../lib/tcp");

// 任务缓存
var tasks = exports.tasks = new Map();

exports.install = install;

function install(socket, http_app, waterline_instance) {
	var router = socket.router = Router();
	var router_generation = socket.router_generation = router.routes();
	http_app.use(router_generation);
	// 如果关闭了,socket注册的Router要全部注销掉
	socket.on("close", function() {
		var _flag = console.flagHead("SOCKET CLOSE");

		console.group(_flag, "注销注册路由");
		http_app.middleware.spliceRemove(router_generation);
		router.stack.forEach(layer=>console.log(`[${layer.methods}]${layer.path}`));
		console.groupEnd(_flag, "注销注册路由");

		console.group(_flag, "关闭正在执行的请求");
		tasks.forEach((ctx, task_id) => {
			console.log(`[${ctx.method}]${ctx.path}`);
			ctx.destory(task_id);
		});
		console.groupEnd(_flag, "关闭正在执行的请求");
	});

	return function(data, done) {
		waterline_instance.collections.router_register.create(data.info).then(router_register => {
			console.flag("SERVER", router_register);
			router[router_register.method](router_register.path, function*(next) {
				var ctx = this;
				// 记录基础的路由配置
				ctx.router_register = router_register.$clone();
				// 初始化任务ID
				var task_id = $$.uuid("TASK@");
				tasks.set(task_id, ctx);
				ctx.task_id = task_id;

				ctx.router_socket = socket;

				var time_tasks = ctx.time_tasks = new Map();
				var req = ctx.request;
				var res = ctx.response;
				// 注册销毁函数
				ctx.destory = function() {
					time_tasks.forEach((value, key) => {
						console.log("clearTimeout:", key)
						clearTimeout(value);
						time_tasks.delete(key);
					});
					time_tasks.clear();
					time_tasks.done();
					time_tasks.done = $$.noop;
					tasks.delete(task_id);

					time_tasks = ctx.time_tasks = null;
					ctx.router_register = null;
					ctx.router_socket = null;
					req = null;
					res = null;
				};

				var emit_with = router_register.emit_with.map(function(emit_item) {
					console.log(ctx);
					switch (emit_item) {
						case "query":
							return req.query;
							// break;
						case "params":
							return ctx.params;
							// break;
						case "form":
							return req.body;
							// break;
					}
				});

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
		}).catch(err => {
			socket.msgError("router-register", tcp.errorWrap(err), "[路由] 注册失败");
			done();
		});
	}
};

exports.with_until_time_out_FACTORY = with_until_time_out_FACTORY;

// 超时处理 - 工厂
function with_until_time_out_FACTORY(ctx) {
	function _with_until_time_out(done) {
		var task_id = ctx.task_id;
		var time_tasks = ctx.time_tasks;

		// 清除已有的计时器，并重新开始计时
		time_tasks.forEach((value, key) => {
			console.log("clearTimeout:", key)
			clearTimeout(value);
		});

		var router_register = ctx.router_register;
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
	return _with_until_time_out;
};