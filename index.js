//加载全局拓展
require("GQ-core");

exports.run = run;

function run() {
	return co(function*(argument) {
		//安装Model层
		var waterline_instance = yield require("./Model").install;
		//初始化路由层
		var r = require("./Router").install(waterline_instance);

		if (process.argv.indexOf("--test") !== -1) {
			setTimeout(function() {
				//运行测试
				require("./test/test_app").run();
			}, 500);
		}

		return r;
	}).catch(e => {
		console.error(e.message, "\n", e.stack);
	});
};

if (module == require.main) {
	run();
}