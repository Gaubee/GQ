//加载全局拓展
console.log("START!!")
require("./lib/global");
//安装Model层
require("./Model").install(function(waterline_instance) {
	//初始化路由层
	require("./Router").install(waterline_instance);

	setTimeout(function() {
		console.log("\n-------------------------");
		console.flag("TEST", "运行测试代码");
		//运行测试
		require("./test/test_app").run();
	}, 500);

	// setTimeout(function() {
	// 	process.exit()
	// }, 1500);
});