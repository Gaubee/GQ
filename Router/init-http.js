var koa = require('koa');
var app = koa();
app.listen(4100, function() {
	console.flag("init", "HTTP基础服务已经启动", app)
});
module.exports = app;