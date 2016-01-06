var co = require("co");
var emit_task_test = require("./emit_task_test.js");
var router_register_test = require("./router_register_test.js");

var task_timeout_config = exports.task_timeout_config = {
	extended_timeout: 0
};

exports.run = run_test;

function run_test(socket, next) {
	//延迟请求时长
	socket.onMsgInfo("task-timeout", function(data, done) {
		console.flag("CLIENT", data);
		if (data.info.passed_time > router_register_test.register_info.time_out) {
			done();
			return
		}
		//发送延迟操作的的请求
		socket.msgInfo("task-extended-timeout", {
			task_id: data.info.task_id,
			extended_timeout: task_timeout_config.extended_timeout
		});
		done();
	});

	console.log("请求的最大响应时长为：", router_register_test.register_info.time_out);
	console.log("增加响应时长：", task_timeout_config.extended_timeout = router_register_test.register_info.time_out * 2 / 3);
	co(function*() {

		console.time("测试1， 延迟请求后，在正确时间内的时候发送")
		emit_task_test.task_handle_config.time_out = router_register_test.register_info.time_out + task_timeout_config.extended_timeout - 1e3;
		console.log("应用响应在：", emit_task_test.task_handle_config.time_out, "ms 后响应");
		yield emit_task_test.run_test;
		console.timeEnd("测试1， 延迟请求后，在正确时间内的时候发送");

		console.time("测试2， 延迟请求后，在错误时间内的时候发送");
		task_timeout_config.extended_timeout = 0;
		emit_task_test.task_handle_config.time_out = router_register_test.register_info.time_out + task_timeout_config.extended_timeout + 1e3;
		var res = yield emit_task_test.run_test;
		console.timeEnd("测试2， 延迟请求后，在错误时间内的时候发送");

		function _with_error_log(done) {
			setTimeout(done, 2e3 + 100);
		};

		yield _with_error_log;
		if (res == "Request Timeout") {
			console.log("测试2 成功")
		} else {
			console.log("测试2 失败")
		}

		next(socket);
	});

	// 测试2
};