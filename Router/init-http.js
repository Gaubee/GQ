var koa = require('koa');
var Session = require('koa-session');
var app = koa();
// Session
app.keys = ['QAQ'];
app.use(Session(app));
require('koa-qs')(app, 'extended');
app.use(function*(next) {

	this.set("Access-Control-Allow-Credentials", true);
	this.set("Access-Control-Allow-Origin", this.header.origin);
	this.set("Access-Control-Allow-Methods", "POST,GET,PUT,DELETE,OPTIONS,HEADE");
	this.set("Access-Control-Allow-Headers", "X-PINGOTHER, Set-Cookie, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

	yield next;
})

app.listen(4100, function() {
	console.flag("init", "HTTP基础服务已经启动", app)
});
module.exports = app;