//加载全局拓展
require("gq-core");

exports.run = run;

function run() {
	return co(function*() {
		//安装Model层
		var waterline_instance = yield require("./Model").install;
		//初始化路由层
		var r = yield require("./Router").install(waterline_instance);
		//安装GUI
		require("./web").install(r);

		if (process.argv.indexOf("--test") !== -1) {
			setTimeout(function() {
				//运行测试
				require("./test/test_app").run(r);
			}, 500);
		}

		return r;
	}, e => {
		console.error(e);
	});
};

if (module == require.main) {
	run();
}