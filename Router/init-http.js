const koa = require('koa');
const Session = require('koa-session');
const app = koa();
// 时间统计
app.use(function*(next) {
	const _start_time = new Date;
	const _g = console.group(_start_time.format("mm-dd HH:MM:SS"))
	yield next;
	const _end_time = new Date;
	console.groupEnd(_g, _end_time - _start_time, "ms")
});
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