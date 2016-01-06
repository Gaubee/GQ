var co = require("co");
var register_info = require("./router_register_test").register_info;

exports.run = install_and_run_test;

function install_and_run_test(socket, next) {
	// var done
	socket.onMsgInfo("emit-task", function(data, done) {
		console.flag("CLIENT:emit-task", data);
		// 发送任务所需的数据
		task_handle(socket, data);
		done();
	});
	socket.onMsgSuccess("return-task", function(data, done) {
		console.log("路由触发成功");
		done();
		process.nextTick(function() {
			next(socket);
		});
	});
	socket.onMsgError("return-task", function(data, done) {
		console.error("路由触发失败", data.info);
		done();
	});
	run_test();
};

exports.run_test = run_test;

function run_test(cb) {
	FiberRun(function() {
		var _url = "http://127.0.0.1:4100" + register_info.path;
		var res = curl(_url);
		console.flag("curl", res, "\n\t\t----> " + _url);
		cb && cb(null, res);
	});
};


exports.task_handle_config = {
	time_out: 0
};

exports.task_handle = task_handle;

function task_handle(socket, data) {
	var task_handle_config = exports.task_handle_config;
	setTimeout(function() {
		socket.msgInfo("return-task", {
			task_id: data.info.task_id,
			return_data: { // 这里遵循HTTP协议的规则
				status: 200,
				set_cookies: [
					["type", "ninja"],
					["language", "javascript"]
				],
				response_type: "text/html;utf-8",
				body: "**String**"
			}
		});
	}, task_handle_config.time_out)

};