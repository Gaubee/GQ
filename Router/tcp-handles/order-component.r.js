exports.install = install;
const IdSocketMap = require("./use-app.r.js").id_socket_map;

function install(socket, http_app, waterline_instance) {

	return co.wrap(function*(data, done) {
		const info = data.info || {};
		const task_id = String.asString(info.task_id);
		const order_id = String.asString(info.order_id);

		// // 校验Task_id
		// if (!task_id) {
		// 	Throw("type", "task_id must be Unique-String.")
		// }
		// // 校验Order_id
		// if (!order_id) {
		// 	Throw("type", "order_id must be Unique-String.")
		// }

		if (!(order_id && task_id)) {
			console.error(`task_id: ${task_id} | order_id: ${order_id}`);
			console.log(new TypeError("task_id and order_id must be Unique-String."))
			return done();
		}

		const safe_order_id = $$.uuid("SAFE-ORDER-ID@");

		const task_com = socket.com_task_and_safe_task_map.get(task_id);
		if (!task_com) {
			Throw("ref", "task_id has not reference to component instance.")
		}
		const com_socket = IdSocketMap.get(task_com.com_socket_id);

		info.task_id = task_com.safe_task_id;
		info.order_id = safe_order_id;
		const order_res = yield com_socket.callOrderComponent(info);

		socket.msgSuccess("order-component", {
			task_id: task_id,
			order_id: order_id,
			returns: order_res
		});

		done();
	}, (err, data, done) => {
		socket.msgError("order-component", {
			task_id: data.info.task_id,
			order_id: data.info.order_id,
		}, err);
		done();
	});
};