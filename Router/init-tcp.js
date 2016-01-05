/*
 * 提供给外部的基于TCP协议的注册功能
 */
var tcp = require("../lib/tcp");
var router = require("koa-route");
var server = tcp.createServer({
	host: "0.0.0.0",
	port: 4001
}, function() {
	console.flag("init", "TCP桥接服务已经启动", server.address());
});
exports.bridgeHttp = bridgeHttp;

function bridgeHttp(http_app, waterline_instance) {
	server.on("connection", function(socket) {
		var events = {
			"router-register": function(data, done) {
				waterline_instance.collections.router_register.create(data.info).then(router_register => {
					console.log(router_register.populate("doc"))
					console.log(router_register.toObject.toString())
					http_app.use(router[router_register.method](router_register.path, function() {
						socket.msg()
					}));
					//返回完成
					socket.msgSuccess("router-register", "success");
					done();
				}).catch(err => {
					socket.msgError("router-register", tcp.errorWrap(err), "[路由] 注册失败");
					done();
				});
			}
		};
		//注册初始化
		socket.onMsgInfo("router-init", function(data, done) {
			waterline_instance.collections.router_init.create(data.info).then(router_init => {
				//TODO:根据info.author.version版本号更新注册悉信息
				socket.router_init = router_init;

				//初始化完成后，可以开始注册路由
				Object.keys(events).forEach(key => socket.onMsgInfo(key, events[key]));
				console.flag("success router-init", "[路由] 申请 初始化成功");

				//返回完成
				socket.msgSuccess("router-init", "success");
				done();
			}).catch(err => {
				socket.msgError("router-init", err, "[路由] 申请 初始化失败");
				done();
			});
		});
	});
	console.flag("init", "HTTP-TCP桥接完成");
};