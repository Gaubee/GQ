var tasks = require("./router-register.r.js").tasks;

exports.install = install;

function install(socket, http_app, waterline_instance) {

	// 接受任务返回数据
	return co.wrap(function(data, done) {
		console.flag("SERVER:return-task", data);

		var task_id = data.info.task_id;
		var ctx = tasks.get(task_id);
		if (!ctx) {
			Throw("ref", `找不到“${task_id}”所对应的 应用上下文（context）`);
			return;
		}
		var time_tasks = ctx.time_tasks;
		var req = ctx.request;
		var res = ctx.response;

		var return_data = data.info.return_data;

		//------------ status
		if (return_data.status) {
			ctx.status = return_data.status;
		}
		//------------ cookies
		if (Array.isArray(return_data.set_cookies)) {
			return_data.set_cookies.forEach(set_cookie_args =>
				ctx.cookies.set.apply(ctx.cookies, set_cookie_args))
		}
		//------------ response_type
		if (return_data.response_type) {
			res.type = return_data.response_type;
		}
		//------------ body
		if (return_data.body) {
			// console.log("ctx.body",ctx.body,typeof ctx.body)
			if (!ctx.body) {
				ctx.body = return_data.body
			} else if (Buffer.isBuffer(ctx.body)) {
				ctx.body = Buffer.concat(ctx.body, return_data.body);
			} else {
				ctx.body += return_data.body
			}
		}
		//------------ session
		if (return_data.session) {
			for (var key in return_data.session) {
				ctx.session[key] = return_data.session[key]
			}
		}

		if (!data.info.stop_end_send) {
			// 销毁ctx
			ctx.destory();
			socket.msgSuccess("return-task", {
				task_id: task_id
			});
		}

		done();
	}, (err, data, done) => {
		socket.msgError("return-task", {
			task_id: task_id,
		}, err);
		done();
	});

};