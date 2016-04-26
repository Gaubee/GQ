exports.install = install;

const IdSocketMap = require("./use-app.r.js").id_socket_map;

function install(socket, http_app, waterline_instance) {

	return co.wrap(function*(data, done) {
		const info = data.info || {};
		// 校验Task_id
		const task_id = String.asString(info.task_id);
		if (!task_id) {
			console.log(new TypeError("task_id must be Unique-String."))
			return done();
		}
		// 根据app和com信息来获取组件服务商
		const app_name = String.asString(info.app_name);
		if (app_name) {
			const app = yield waterline_instance.collections.application.findOneByApp_name(app_name);
		} else {
			app = socket.using_app;
		}

		if (!app) {
			Throw("ref", "unknown Application references.")
		}
		const com_name = String.asString(info.com_name);
		if (!com_name) {
			Throw("type", "com_name must be String.")
		}
		const coms = yield waterline_instance.collections.component.find({
			name: com_name,
			app: app.id,
		});
		if (coms.length === 0) {
			Throw("ref", "Component " + com_name + " not found");
		}

		// TODO，根据负载均衡来判定
		const com = coms[0];
		const com_socket_id = com.uid.split("|")[0];
		const com_socket = IdSocketMap.get(com_socket_id);
		if (!com_socket) {
			Throw("ref", "Can not find the Reference-Socket by Socket-ID.");
		}

		// 连接ID，用来指向组件服务商的一个上下文，以及组件使用者的连接对象。
		const safe_task_id = $$.uuid("SAFE-TASK-ID@");
		info.task_id = safe_task_id;

		const com_instance = yield com_socket.callInitComponent(safe_task_id, com_name, info.init_protos);

		com_instance.task_id = task_id;
		console.log("[APPLICATION NAME]: ".colorsHead(), app.app_name, "\n",
			"[COMPONENT NAME]: ".colorsHead(), com_name);

		socket.com_task_and_safe_task_map.set(task_id, {
			safe_task_id: safe_task_id,
			com_socket_id: com_socket_id,
		});
		socket.msgSuccess("init-component", com_instance);

		done();
	}, (err, data, done) => {
		// console.flag("init-component:error", err);
		socket.msgError("init-component", data.info, err);
		done();
	});
};