var koa = require('koa');
var Session = require('koa-session');
var app = koa();
app.keys = ['QAQ'];
app.use(Session(app));
app.listen(4100, function() {
	console.flag("init", "HTTP基础服务已经启动", app)
});
module.exports = app;