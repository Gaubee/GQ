var redis = require("redis");

var client = exports.client = redis.createClient();
exports.install = install;

function install(socket, http_app, waterline_instance) {
	return function(data, done) {
		console.flag("SERVER:redis-exec", "\n", data.info);
		if (!(client[data.info.handle] instanceof Function)) {
			socket.msgError("redis-return", {
				task_id: data.info.task_id,
			}, "Redis Command: " + data.info.handle + " no Found.");
			done();
			return;
		}
		if (!Array.isArray(data.info.args)) {
			socket.msgError("redis-return", {
				task_id: data.info.task_id,
			}, "Redis arguments(info.args) must be an array");
			done();
			return;
		}
		client[data.info.handle](data.info.args, function(err, res) {
			if (err) {
				console.error(err.stack);
				socket.msgError("redis-return", {
					task_id: data.info.task_id,
				}, err.msg);
			} else {
				socket.msgSuccess("redis-return", {
					task_id: data.info.task_id,
					returns: res
				});
			}
			done();
		});
	};

};