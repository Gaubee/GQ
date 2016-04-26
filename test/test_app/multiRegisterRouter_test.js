var run = co.wrap(function*(socket, next) {
	try {
		var routers = yield socket.multiRegisterRouter(__dirname + "/multiRouter", ".router.js");
		// console.log(routers.map(r=>`[${r.method}]${r.path}`).join("\n"))

		var res = yield $$.curl("http://127.0.0.1:4100/multi/1");
		res += yield $$.curl("http://127.0.0.1:4100/multi/2");
		res += yield $$.curl("http://127.0.0.1:4100/multi/3?res=QAQ");
		res += yield $$.curl("http://127.0.0.1:4100/multi/4?res=QwQ");
		if (res === "12QAQQwQ") {
			console.log("成功")
			next()
		} else {
			console.error("失败", res);
		}
	} catch (e) {
		console.error("失败", (e.message + "\n" + e.stack) || e);
	}
});

exports.run = run;