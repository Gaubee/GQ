var with_until_time_out_FACTORY = require("./router-register.r.js").with_until_time_out_FACTORY;

exports.install = install;

function install(socket, http_app, waterline_instance) {
	return function(data, done) {
		console.flag("SERVER:task-extended-timeout", data);
		const tasks = socket.http_tasks;

		const task_id = data.info.task_id;
		const ctx = tasks.get(task_id);
		if (!ctx) {
			socket.msgError("return-task", {
				task_id: task_id,
			}, `[task-extended-timeout] Error: 找不到“${task_id}”所对应的 应用上下文（context）`);
			done();
			return;
		}

		if (Number.isFinite(data.info.extended_timeout) && data.info.extended_timeout > 0) {
			// 把延迟时长加入配置中
			ctx.router_register.extended_timeout += data.info.extended_timeout;

			// 重新注册计时器
			with_until_time_out_FACTORY(ctx)();
		} else {
			socket.msgError("task-extended-timeout", {
				task_id: task_id,
			}, `extended_timeout 参数有误，必须为大于0的毫秒数`);
		}
		done();

	}
};