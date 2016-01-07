/*
 * 提供给外部的基于TCP协议的注册功能
 */
var tcp = require("../lib/tcp");
var server = tcp.createServer({
	host: "0.0.0.0",
	port: 4001
}, function() {
	console.flag("init", "TCP桥接服务已经启动", server.address());
});
exports.bridgeHttp = bridgeHttp;

function bridgeHttp(http_app, waterline_instance) {
	server.on("connection", function(socket) {
		require("./tcp-handles/router-init").install(socket, http_app, waterline_instance);
	});
	console.flag("init", "HTTP-TCP桥接完成");
};