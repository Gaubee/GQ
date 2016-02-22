exports.install = install;
var IdSocketMap = require("./use-app.r.js").id_socket_map;

function install(socket, http_app, waterline_instance) {

	return co.wrap(function*(data, done) {
		var info = data.info || {};
		var task_id = String.asString(info.task_id);
		var order_id = String.asString(info.order_id);

		// 校验Task_id
		if (!task_id) {
			Throw("type", "task_id must be Unique-String.")
		}
		// 校验Order_id
		if (!order_id) {
			Throw("type", "order_id must be Unique-String.")
		}

		var safe_order_id = $$.uuid("SAFE-ORDER-ID@");

		var task_com = socket.com_task_and_safe_task_map.get(task_id);
		if (!task_com) {
			Throw("ref", "task_id has not reference to component instance.")
		}
		var com_socket = IdSocketMap.get(task_com.com_socket_id);

		info.task_id = task_com.safe_task_id;
		info.order_id = safe_order_id;
		var order_res = yield com_socket.callOrderComponent(info);

		socket.msgSuccess("order-component", {
			task_id: task_id,
			order_id: order_id,
			returns: order_res
		});

		done();
	}, err => {
		console.flag("order-component:error", err);
		socket.msgError("order-component", {
			task_id: task_id,
			order_id: order_id,
		}, Error.isError(err) ? err.message : err);
		done();
	});
};