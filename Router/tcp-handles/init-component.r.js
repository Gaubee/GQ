exports.install = install;

function install(socket, http_app, waterline_instance) {
	return function(data, done) {
		return co(function*() {
			var info = data.info;
			var task_id = String.asString(info.task_id);
			if (task_id) {
				Throw("type", "task_id mush be Unique-String.")
			}
			var app_name = String.asString(info.app_name);
			if (app_name) {
				var app = yield waterline_instance.collections.application.findOneByApp_name(app_name);
			} else {
				app = socket.using_app;
			}
			if (!app) {
				Throw("ref", "unknown Application references.")
			}
			var com_name = String.asString(info.com_name);
			if (!com_name) {
				Throw("type", "com_name mush be String.")
			}
			var Com = yield waterline_instance.collections.component.findOne({
				uid: app.id + "|" + name
			});
		}).catch(err => {
			console.flag("init-component:error", err);
			socket.msgError("init-component", data.info, err.message);
			done();
		});
	}
};