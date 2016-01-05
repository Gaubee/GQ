exports.run = run_test;

function run_test(socket, next) {
	socket.msgInfo("router-register", {
		doc: { // 这个路由的描述
			des: "测试",
			parameters: [{
				type: "Number",
				name: "query.num",
				des: "分页，每页数量"
			}, {
				type: "Number",
				name: "query.page",
				des: "分页，页号"
			}],
			returns: [{
				type: "Array",
				des: "返回值"
			}]
		},
		method: "GET",
		path: "/test",
	});
	socket.onMsgSuccess("router-register", function(data, done) {
		console.log("路由注册成功");
		next(socket);
		done();
	});
	socket.onMsgError("router-register", function(data, done) {
		console.log("路由注册失败", data.info);
		next(socket);
		done();
	});
};