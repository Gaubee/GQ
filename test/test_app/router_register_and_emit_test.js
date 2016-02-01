var register_and_emit = co.wrap(function*(socket, next) {
	try {
		var register_info = yield socket.registerRouter("get", "/test_2", {
			emit_with: ["query"]
		}, function*() {
			this.no_wrap_body = true;
			this.body = this.query.name
		});
		console.log("register_info", register_info)

		var res = yield $$.curl("http://127.0.0.1:4100/test_2?name=QAQ");
		if (res === "QAQ") {
			console.log("成功")
			next()
		} else {
			console.error("失败", res);
		}
	} catch (e) {
		console.error("失败", e.stack || e);
	}
});

exports.run = register_and_emit;