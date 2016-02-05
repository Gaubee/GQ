exports.install = install;

function install(socket, http_app, waterline_instance) {
	return co.wrap(function*(data, done) {
		console.log("data", data)
		try {
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
			socket.msgSuccess("use-app", app);
			done();
		} catch (e) {
			console.flag("use-app", e.messagem, "\n", e.stack);
			socket.msgError("use-app", data.info, e.message);
			done();
		}
	});
};