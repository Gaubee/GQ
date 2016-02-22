/*
 * 提供给外部的基于TCP协议的注册功能
 */
const tcp = require("GQ-core/tcp");
const Router = require("koa-router");
const CoBody = require("co-body");
const PathObject = require('path-object')("/");
const server = tcp.createServer({
	host: "0.0.0.0",
	port: 4001
}, function() {
	console.flag("init", "TCP桥接服务已经启动", server.address());
});
const connPool = new Set();

exports.bridgeHttp = bridgeHttp;

function bridgeHttp(http_app, waterline_instance) {
	// API Router
	var api_router = Router();
	// api_router.get("/time_loop", function*(next) {
	// 	var i = Math.random();
	// 	var self = this;
	// 	// console.log(self.res)
	// 	self.res.writeHead(200, {
	// 		// 'Content-Type': "text/event-stream"
	// 		'Content-Type': "text/html"
	// 	});
	// 	var a = Array(10000);
	// 	var _ti = setInterval(function() {
	// 		i += 1;
	// 		self.res.write(a.join(i) + "s\n");
	// 		self.res.flushHeaders();
	// 		console.log(i)
	// 		if (i > 3) {
	// 			clearInterval(_ti);
	// 			self.res.end();
	// 		}
	// 	}, 1000);
	// });
	// var yield_map = new Map();
	// api_router.get("/yield_loop", function*(next) {
	// 	var yield_id = Math.random().toString(32).substr(2);
	// 	var self = this;
	// 	// console.log(self.res)
	// 	self.res.writeHead(200, {
	// 		// 'Content-Type': "text/event-stream"
	// 		'Content-Type': "text/html"
	// 	});

	// 	function run_promise(pre_value) {
	// 		new Promise(function(resolve, reject) {
	// 			var yield_data = {
	// 				handle: "prompt",
	// 				title: (pre_value ? ("你输入了：" + pre_value + ", ") : "") +
	// 					"请输入false",
	// 				default_value: "true",
	// 			};
	// 			self.res.write(JSON.stringify(yield_data) +
	// 				"[YIELD-URL](http://localhost:4100/yield/" + yield_id + ")");
	// 			console.log("set yield_id", yield_id, pre_value);
	// 			yield_map.set(yield_id, {
	// 				resolve: resolve,
	// 				reject: reject
	// 			});
	// 		}).then(function(value) {
	// 			console.log("收到数据：", value);
	// 			if (value === "false") {
	// 				self.res.end(JSON.stringify({
	// 					type: "string",
	// 					info: "END!!"
	// 				})+"GG");
	// 				return
	// 			}
	// 			run_promise(value);
	// 		}).catch(function(error) {
	// 			console.log("收到错误：", error);
	// 		})
	// 	};
	// 	run_promise();
	// });
	// api_router.post("/yield/:yield_id", function*(next) {
	// 	var yield_id = this.params.yield_id;
	// 	var p = yield_map.get(yield_id);
	// 	console.log("yield_id:", yield_id);
	// 	if (p) {
	// 		var form = yield CoBody(this, {
	// 			limit: "20MB"
	// 		});
	// 		if (form.type === "error") {
	// 			p.reject(form.value)
	// 		} else {
	// 			p.resolve(form.value)
	// 		}
	// 		this.body = "Success"
	// 	} else {
	// 		this.body = "Error"
	// 	}
	// });
	// api_router.get("/api/all", function*(next) {
	// 	console.log(connPool.size);
	// 	var res = [];
	// 	yield connPool.map(co.wrap(function*(socoon) {
	// 		// console.log(socoon.router_init)
	// 		if (socoon.router_init) {
	// 			res.push({
	// 				base_info: yield waterline_instance.collections.router_init.findOne(socoon.router_init.id).populate("info"),
	// 				apis: yield waterline_instance.collections.router_register.find({
	// 					owner: socoon.router_init.id
	// 				}).populate("doc")
	// 			});
	// 		}
	// 	}));
	// 	this.body = {
	// 		type: "json",
	// 		info: res
	// 	};
	// });
	// api_router.get("/api/to_json", function*(socoon) {
	// 	var jsonp = this.query.jsonp;
	// 	// console.log(this.req)
	// 	var host = this.query.host || this.protocol + "://" + this.get("host") || "${%HOST%}";
	// 	var prefix = jsonp ? $$.uuid() : host

	// 	var res = new PathObject();

	// 	yield connPool.map(co.wrap(function*(socoon) {
	// 		if (!socoon.router_init) {
	// 			return;
	// 		}
	// 		var apis = yield waterline_instance.collections.router_register.find({
	// 			owner: socoon.router_init.id
	// 		});
	// 		apis.forEach(function(api) {
	// 			var path_fragments = api.path.split("/");
	// 			var path_for_object_s_key = api.path.replace(/:/g, "$");
	// 			var formatable_path = prefix + api.path.replace(/:([^:\/]+)/g, "${$1}");
	// 			res.set(path_for_object_s_key, formatable_path);
	// 		});
	// 	}));

	// 	var res_str = JSON.stringify(res);

	// 	if (jsonp) {
	// 		this.type = "application/javascript"
	// 		res_str = jsonp + "(function(h){return " + res_str.replaceAll('"' + prefix, 'h+"') + "}(" + JSON.stringify(host) + "));";
	// 	} else {
	// 		this.type = "application/json"
	// 	}
	// 	this.body = res_str;
	// });

	http_app.use(api_router.routes());


	server.on("connection", function(socket) {
		connPool.add(socket);
		socket.on("close", function() {
			connPool.delete(socket)
		});

		require("./tcp-handles/use-app.r").install(socket, http_app, waterline_instance);

	});
	console.flag("init", "HTTP-TCP桥接完成");
};