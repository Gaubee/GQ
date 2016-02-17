exports.install = install;
var IdSocketMap = exports.id_socket_map = new Map();
var comExtendHandle = require("GQ-core/tcp/extends-com");

function install(socket, http_app, waterline_instance) {
	return function(data, done) {
		return co(function*() {
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

			socket.loginer = loginer;
			socket.using_app = app;
			comExtendHandle.initComponent(socket, true);
			comExtendHandle.orderComponent(socket, true);
			comExtendHandle.destroyComponent(socket, true);
			socket.com_task_and_safe_task_map = new Map();// client1 => server => {safe_task_idm, com_socket_id}

			IdSocketMap.set(socket._id, socket);
			socket.msgSuccess("use-app", app);
			done();
		}).catch(err => {
			console.flag("use-app", err.messagem, "\n", err.stack);
			socket.msgError("use-app", data.info, err.message);
			done();
		});
	}
};