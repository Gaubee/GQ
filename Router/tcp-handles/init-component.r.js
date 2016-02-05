exports.install = install;
var comInstanceWeakMap = exports.com_instance_weakmap = new WeakMap();

var IdSocketMap = require("./use-app.r.js").id_socket_map;

function install(socket, http_app, waterline_instance) {

	return function(data, done) {
		return co(function*() {
			var info = data.info;
			// 校验Task_id
			var task_id = String.asString(info.task_id);
			if (!task_id) {
				Throw("type", "task_id mush be Unique-String.")
			}
			// 根据app和com信息来获取组件服务商
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
			var coms = yield waterline_instance.collections.component.find({
				name: com_name,
				app: app.id,
			});
			if (coms.length === 0) {
				Throw("ref", "Component " + com_name + " not found");
			}

			// TODO，根据负载均衡来判定
			var com = coms[0];
			var com_socket_id = com.uid.split("|")[0];
			var com_socket = IdSocketMap.get(com_socket_id);
			if (!com_socket) {
				Throw("ref", "Can not find the Reference-Socket by Socket-ID.");
			}

			// 连接ID，用来指向组件服务商的一个上下文，以及组件使用者的连接对象。
			var safe_task_id = $$.uuid("TASK-ID@");
			info.task_id = safe_task_id;

			var com_instance = yield com_socket.callInitComponent(safe_task_id, com_name, info);

			com_instance.task_id = task_id;
			console.flag("return to client component",com_instance)

			socket.msgSuccess("init-component", com_instance);

			done();
		}).catch(err => {
			console.flag("init-component:error", err.message, "\n", err.stack);
			socket.msgError("init-component", data.info, err.message);
			done();
		});
	}
};