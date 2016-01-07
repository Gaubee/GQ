require("../lib/global");
var koa = require('koa');
var router = require("koa-router")();

setTimeout(function() {
	process.exit()
}, 1500);

var app = koa();
app.listen(7001, function() {
	console.flag("init", "HTTP基础服务已经启动", app)
});
router.get("/user/:name", function*(next) {
	this.body = this.params
})
FiberRun(function() {
	console.log(curl("http://127.0.0.1:7001/user/Gaubee"));
	app.use(router.routes());
	console.log(curl("http://127.0.0.1:7001/user/Gaubee"));
});