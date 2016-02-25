require("GQ-core");
console.log("\n-------------------------");
console.flag("TEST", "运行测试代码");

var tasks = [
	require("./application_test.js"),
	// require("./router_register_test.js"),
	// require("./emit_task_test.js"),
	// require("./task_timeout_test.js"),
	require("./redis_exec_test.js"),
	// require("./router_register_and_emit_test.js"),
	// require("./multiRegisterRouter_test.js"),
	// require("./component_test.js"),
	// require("./component_run_test.js"),
	// require("./component_destroy_test.js"),
];
var w = new $$.When(1);

var tcp = require("GQ-core/tcp");

var client = tcp.createClient({
	address: '0.0.0.0',
	family: 'IPv4',
	port: 4001
}, function() {
	w.ok(0);
});

var _runed_tasks_map = {};

function run_tasks(i) {
	i || (i = 0);
	// 运行锁，所有测试只运行一次
	if (_runed_tasks_map[i]) {
		return
	}
	_runed_tasks_map[i] = true;

	w.then(function() {
		if (i < tasks.length) {
			console.log("\n--------------------------")
			console.flag("run test", i + 1, "↓\n--------------------------");
			try {
				tasks[i].run(client, function() {
					setTimeout(function() {
						run_tasks(i + 1);
					}, 300);
				});
			} catch (e) {
				console.error(console.flagHead("test uncatch error"), e.stack);
			}
		} else {
			console.log("\n--------------------------")
			console.flag("test success", "所有测试运行完成");
			console.log("--------------------------")
			process.exit(0)
		}
	});
};
module.exports.run = run_tasks;
if (module === require.main) {
	run_tasks(0)
}