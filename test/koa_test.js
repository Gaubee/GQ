require("../lib/global/$.Fiber");
var koa = require("koa");
var app = koa();

app.use(function*(next) {
	var start = new Date;
	yield next;
	var ms = new Date - start;
	console.log('%s %s - %s', this.method, this.url, ms);
});

// app.use(function*() {
// 	var self = this;
// 	var res = yield [function(next) {
// 		console.log(next.toString())
// 		setTimeout(function() {
// 			next(null, self.status = 408)
// 		}, 1000);
// 	}, function(next) {
// 		console.log(next.toString())
// 		setTimeout(function() {
// 			next(null, "408")
// 		}, 500);
// 	}];
// 	console.log(res)
// });

app.use(function*(next) {
	var self = this;
	var p = new Promise(function(resolve) {
		setTimeout(function() {
			resolve(self.status = 408);
		}, 1000);
	});
	console.log(yield p);
	yield next;
});
app.use(function*(next) {
	this.body = this.status + "~~QAQ";
	yield next;
});

app.listen(1231, function() {
	FiberRun(function() {
		console.log("RES:", curl("http://127.0.0.1:1231"));
	});

	setTimeout(function() {
		process.exit()
	}, 1500);
});