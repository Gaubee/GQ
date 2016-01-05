//加载全局拓展
var Fiber = require("fibers");
Fiber(function() {
	console.log("START!!")
	require("./lib/global");
	//安装Model层
	require("./Model").install(function(waterline_instance) {
		//初始化路由层
		require("./Router").install(waterline_instance);

		//运行测试
		require("./test/test_app").run();
		setTimeout(function() {
			process.exit()
		}, 1500);
	});
}).run();