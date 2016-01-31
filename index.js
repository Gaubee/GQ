//加载全局拓展
require("./lib/global");

exports.run = run;

function run() {
	return new Promise(function(resolve) {
		//安装Model层

		require("./Model").install(function(waterline_instance) {
				//初始化路由层
			var r = require("./Router").install(waterline_instance);

			resolve(r)

			if (process.argv.indexOf("--test") !== -1) {
				setTimeout(function() {
					//运行测试
					require("./test/test_app").run();
				}, 500);
			}

		});
	}).catch(e => console.error(e.stack))
};

if (module == require.main) {
	run();
}