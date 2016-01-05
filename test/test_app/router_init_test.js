exports.run = run_test;

function run_test(socket, next) {
	socket.msgInfo("router-init", {
		info: {
			author: "Gaubee",
			version: "1.0.0"
		},
		address: {
			host: "0.0.0.0",
			port: 1234
		},
		initKey: "GAUBEE-INIT-KEY-HASH"
	});
	socket.onMsgSuccess("router-init", function(data, done) {
		console.log("路由初始化成功");
		next(socket);
		done();
	});
	socket.onMsgError("router-init", function(data, done) {
		console.log("路由初始化失败");
		done();
	});
};