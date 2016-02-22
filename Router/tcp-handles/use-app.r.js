var path = require("path");
exports.install = install;

var events = {};
fs.lsAll(__dirname).forEach(file_path => {
	var _ext = ".r.js";
	if (file_path.endWith(_ext) && file_path !== __filename) {
		var eventName = path.basename(file_path).replace(_ext, "");
		events[eventName] = require(file_path);
	}
});

var IdSocketMap = exports.id_socket_map = new Map();
var comExtendHandle = require("GQ-core/tcp/extends-com");

function install(socket, http_app, waterline_instance) {

	socket.on("close", function() {
		console.flag("SOCKET CLOSE", "服务端与客户端连接关闭");
	});

	socket.onMsgInfo("use-app", co.wrap(function*(data, done) {
		console.log(data)

		if (socket.using_app) {
			Throw("type", "using Application<" + socket.using_app.app_name + ">, you can not use multiple Application")
		}

		// 校验用户登录
		var user_name = data.info.user_name;
		var loginer = yield waterline_instance.collections.user.findOne({
			user_name: user_name
		});
		if (!loginer) {
			Throw("ref", "can't no find user:" + user_name)
		}

		var password = data.info.password;
		if (loginer.password !== $$.md5_2(password)) {
			Throw("ref", "password error for user:" + user_name)
		}

		var app_name = data.info.app_name;
		var app = yield waterline_instance.collections.application.findOne({
			app_name: app_name
		}).populate("developers");
		if (!app) {
			Throw("ref", "can't no find app:" + app_name)
		}
		if (app.owner !== loginer.id && !app.developers.some(dever => dever.id === loginer.id)) {
			Throw("ref", user_name + " does not have permission to use the <" + app_name + "> application");
		}

		//TODO:根据info.author.version版本号更新注册悉信息
		socket.using_app = app;
		// 注册服务端接口
		socket.loginer = loginer;
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

		// 返回
		socket.msgSuccess("use-app", app);
		done();
	}, err => {
		console.flag("use-app", err.messagem, "\n", err.stack);
		socket.msgError("use-app", data.info, err.message);
		done();
	}));
};