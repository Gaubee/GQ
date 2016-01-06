var tasks = require("./router-register.r.js").tasks;

exports.install = install;

function install(socket, http_app, waterline_instance) {

	// 接受任务返回数据
	return function(data, done) {
		console.flag("SERVER:return-task", data);

		var task_id = data.info.task_id;
		var ctx = tasks.get(task_id);
		if (!ctx) {
			socket.msgError("return-task", {
				task_id: task_id,
				error: {
					details: `找不到“${task_id}”所对应的 应用上下文（context）`
				}
			});
			done();
			return;
		}
		var time_tasks = ctx.time_tasks;
		var req = ctx.req;
		var res = ctx.res;

		var return_data = data.info.return_data;
		if (return_data.status) {
			res.statusCode = return_data.status;
		}
		if (return_data.set_cookies) {
			return_data.set_cookies.forEach(set_cookie_args =>
				ctx.cookies.set.apply(ctx.cookies, set_cookie_args))
		}
		if (return_data.response_type) {
			res.type = return_data.response_type;
		}
		if (return_data.body) {
			res.write(return_data.body)
		}

		if (!data.info.stop_end_send) {
			res.end();

			// 销毁ctx
			ctx.destory();
			socket.msgSuccess("return-task", {
				task_id: task_id
			});
		}

		done();
	};

};