exports.install = install;
var IdSocketMap = require("./use-app.r.js").id_socket_map;

function install(socket, http_app, waterline_instance) {

	return co.wrap(function*(data, done) {
		console.log(info)
		var info = data.info || {};
		var task_id = String.asString(info.task_id);

		// 校验Task_id
		if (!task_id) {
			Throw("type", "task_id must be Unique-String.")
		}

		var task_com = socket.com_task_and_safe_task_map.get(task_id);
		if (!task_com) {
			Throw("ref", "task_id has not reference to component instance.")
		}
		var com_socket = IdSocketMap.get(task_com.com_socket_id);

		info.task_id = task_com.safe_task_id;

		var destroy_info = yield com_socket.callDestroyComponent(info);
		destroy_info.task_id = task_id;

		socket.msgSuccess("destroy-component", destroy_info);

		// 不管应用层响应如何，服务层这边都直接销毁这个连接。
		// 否则让应用层控制服务层的销毁进度，本末倒置，会影响服务层的性能
		IdSocketMap.delete(task_com.com_socket_id);
		socket.com_task_and_safe_task_map.delete(task_id);

		done();
	}, err => {
		console.flag("destroy-component", err)
		socket.msgError("destroy-component", {
			task_id: task_id,
		}, err);
		done();
	});
};