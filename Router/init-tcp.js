/*
 * 提供给外部的基于TCP协议的注册功能
 */
var co = require("co");
var tcp = require("../lib/tcp");
var Router = require("koa-router");
var server = tcp.createServer({
	host: "0.0.0.0",
	port: 4001
}, function() {
	console.flag("init", "TCP桥接服务已经启动", server.address());
});
var connPool = new Set();

exports.bridgeHttp = bridgeHttp;

function bridgeHttp(http_app, waterline_instance) {
	// API Router
	var api_router = Router();
	api_router.get("/api/all", function*(next) {
		var res = [];
		connPool.forEach(co.wrap(function*(socoon) {
			console.log(socoon.router_init)
			res.push({
				base_info: waterline_instance.collections.router_init.findOne(socoon.router_init.id).populate("info"),
				apis: waterline_instance.collections.router_register.find({
					owner: socoon.router_init.id
				}).populate("doc")
			});
		}));
		this.body = {
			type: "json",
			info: yield res
		};
	});
	http_app.use(api_router.routes());


	server.on("connection", function(socket) {
		connPool.add(socket);
		socket.on("close", function() {
			connPool.delete(socket)
		});

		require("./tcp-handles/router-init").install(socket, http_app, waterline_instance);

	});
	console.flag("init", "HTTP-TCP桥接完成");
};