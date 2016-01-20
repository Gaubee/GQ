/*
 * 提供给外部的基于TCP协议的注册功能
 */
var co = require("co");
var tcp = require("../lib/tcp");
var Router = require("koa-router");
var PathObject = require('path-object')("/");
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
		console.log(connPool.size);
		var res = [];
		yield connPool.map(co.wrap(function*(socoon) {
			console.log(socoon.router_init)
			if (socoon.router_init) {
				res.push({
					base_info: yield waterline_instance.collections.router_init.findOne(socoon.router_init.id).populate("info"),
					apis: yield waterline_instance.collections.router_register.find({
						owner: socoon.router_init.id
					}).populate("doc")
				});
			}
		}));
		this.body = {
			type: "json",
			info: res
		};
	});
	api_router.get("/api/to_json", function*(socoon) {
		var jsonp = this.query.jsonp;
		console.log(this.req)
		var host = this.query.host || this.protocol + "://" + this.get("host") || "${%HOST%}";
		var prefix = jsonp ? $$.uuid() : host

		var res = new PathObject();

		yield connPool.map(co.wrap(function*(socoon) {
			if (!socoon.router_init) {
				return;
			}
			var apis = yield waterline_instance.collections.router_register.find({
				owner: socoon.router_init.id
			});
			apis.forEach(function(api) {
				var path_fragments = api.path.split("/");
				var path_for_object_s_key = api.path.replace(/:/g, "$");
				var formatable_path = prefix + api.path.replace(/:([^:\/]+)/g, "${$1}");
				res.set(path_for_object_s_key, formatable_path);
			});
		}));

		var res_str = JSON.stringify(res);

		if (jsonp) {
			this.type = "application/javascript"
			res_str = jsonp + "(function(h){return " + res_str.replaceAll('"' + prefix, 'h+"') + "}(" + JSON.stringify(host) + "));";
		} else {
			this.type = "application/json"
		}
		this.body = res_str;
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