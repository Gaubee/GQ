const path = require("path");
exports.install = install;

// 记录ID对应的Socket对象
const IdSocketMap = exports.id_socket_map = new Map();

const events = {};
fs.lsAll(__dirname).forEach(file_path => {
	var _ext = ".r.js";
	if (file_path.endWith(_ext) && file_path !== __filename) {
		var eventName = path.basename(file_path).replace(_ext, "");
		events[eventName] = require(file_path);
	}
});

const socket_app_wm = new WeakMap();
const socket_loginer_wm = new WeakMap();
const comExtendHandle = require("GQ-core/tcp/extends-com");

function install(socket, http_app, waterline_instance) {

	// socket对象的析构函数
	function _close_socket() {
		console.flag("SOCKET CLOSE", "服务端与客户端连接关闭");

		/*
		 * 释放内存
		 */
		IdSocketMap.delete(socket._id);

		socket_app_wm.delete(socket);

		socket_loginer_wm.delete(socket);

		socket.com_task_and_safe_task_map.clear();
		socket.com_task_and_safe_task_map = null;
	};

	socket.onMsgInfo("use-app", co.wrap(function*(data, done) {

		if (socket.using_app) {
			Throw("type", "using Application<" + socket.using_app.app_name + ">, you can not use multiple Application")
		}

		/*
		 * TODO，在网络平台上通过开发者手动查看MAC-ID来进行认证，用户名密码会导致开发源码的危险
		 */
		// 校验用户登录
		const user_name = data.info.user_name;
		const loginer = yield waterline_instance.collections.user.findOne({
			user_name: user_name
		});
		if (!loginer) {
			Throw("ref", "can't no find user:" + user_name)
		}
		// 校验密码
		const password = data.info.password;
		if (loginer.password !== $$.md5_2(password)) {
			Throw("ref", "password error for user:" + user_name)
		}

		const app_name = data.info.app_name;
		const app = yield waterline_instance.collections.application.findOne({
			app_name: app_name
		}).populate("developers");
		if (!app) {
			Throw("ref", "can't no find app:" + app_name)
		}
		if (app.owner !== loginer.id && !app.developers.some(dever => dever.id === loginer.id)) {
			Throw("ref", user_name + " does not have permission to use the <" + app_name + "> application");
		}

		// TODO:根据info.author.version版本号更新注册悉信息
		// socket.using_app = app;
		Object.definePropertyFromWeakMap(socket, socket_app_wm, "using_app", {
			"initValue": app
		});

		// 注册服务端接口
		// socket.loginer = loginer;
		Object.definePropertyFromWeakMap(socket, socket_loginer_wm, "loginer", {
			"initValue": loginer
		});
		comExtendHandle.initComponent(socket, true);
		comExtendHandle.orderComponent(socket, true);
		comExtendHandle.destroyComponent(socket, true);

		socket.com_task_and_safe_task_map = new Map(); // client1 => server => {safe_task_idm, com_socket_id}

		//应用初始化连接完成后，可以开始进行其它指令操作
		Object.keys(events).forEach(key => {
			console.group(console.flagHead("app-install"));
			console.log("安装", key, "完成")
			socket.onMsgInfo(key, events[key].install(socket, http_app, waterline_instance));
			console.groupEnd(console.flagHead("app-install"));
		});
		console.flag("success app-init", "[应用] 初始化连接成功");

		// 记录连接对象
		IdSocketMap.set(socket._id, socket);

		// 最后再注册这个close处理函数，先确保其它注册close的模块可以先释放内存
		socket.on("close", _close_socket);

		// 初始化完成后，把指令拦截器换掉
		socket.removeListener("msg", before_use_app);
		socket.on("msg", after_use_app);

		// 返回
		socket.msgSuccess("use-app", app);
		done();
	}, err => {
		console.flag("use-app", err.messagem, "\n", err.stack);
		socket.msgError("use-app", data.info, err.message);
		done();
	}));

	function before_use_app(data) {
		if (data && data.type !== "use-app") {
			socket.msgError(data.type, data.info, "You must be sent command>'use-app' before command>'" + data.type + "' send.");
		}
	};

	function after_use_app(data) {
		if (data && data.type && !socket._events["msg:" + data.type + (data.from ? ":" + data.from : "")]) {
			console.log(data, Object.keys(socket._events));
			socket.msgError(data.type, data.info, "Can not find command " + data.type + ".");
		}
	};
	// 判断发来的请求是否有在指令列表中
	socket.on("msg", before_use_app);
};