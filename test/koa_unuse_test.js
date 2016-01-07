require("../lib/global");
var koa = require('koa');

setTimeout(function() {
	process.exit()
}, 1500);

var app = koa();
app.listen(7001, function() {
	console.flag("init", "HTTP基础服务已经启动", app)
});
var _g = function*(next) {
	console.time("QAQ");
	yield next;
	console.timeEnd("QAQ");
};
FiberRun(function() {
	app.use(_g);
	app.use(_g);
	app.use(_g);
	curl("http://127.0.0.1:7001");
	app.middleware.spliceRemove(_g);
	curl("http://127.0.0.1:7001");
	app.middleware.spliceRemove(_g);
	curl("http://127.0.0.1:7001");
	app.middleware.spliceRemove(_g);
	curl("http://127.0.0.1:7001");
});