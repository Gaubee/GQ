var run_test = function(socket, next) {
	co(function*() {
		console.group("启动Redis通用服务");
		console.log(yield socket.redisServer({},["redis://192.168.99.100:32774"]));
		console.groupEnd("Redis组件已注册");

		console.group("运行Redis组件");

		var redisClient = yield socket.redisClient();
		
		const random_v = Math.random();
		console.log(random_v, yield redisClient.SET("COM_REDIS_TEST_DATA", random_v));
		console.log(yield redisClient.GET("COM_REDIS_TEST_DATA"));
		console.groupEnd("运行Redis组件");

		console.group("结束Redis组件");
		console.log(yield redisClient.destroy());
		try {
			yield redisClient.GET("COM_REDIS_TEST_DATA")
			Throw("test error");
		} catch (e) {
			if (e && e.message === "test error") {
				Throw(e);
			} else {
				console.log("已经注销的组件无法正常工作。");
				console.groupEnd("结束Redis组件");
				next();
			}
		}
	}, err => {
		console.flag("redis test error", "\n", err);
		next();
	});
};
exports.run = run_test;