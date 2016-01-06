var tasks = [
	require("./router_init_test.js"),
	require("./router_register_test.js"),
	require("./emit_task_test.js"),
	require("./task_timeout_test.js"),
];
var w = new $$.When(1);

var tcp = require("../../lib/tcp");

var client = tcp.createClient({
	address: '0.0.0.0',
	family: 'IPv4',
	port: 4001
}, function() {
	w.ok(0);
});

var _runed_tasks_map = {};

function run_tasks(i) {
	// 运行锁，所有测试只运行一次
	if (_runed_tasks_map[i]) {
		return
	}
	_runed_tasks_map[i] = true;

	w.then(function() {
		i || (i = 0);
		if (i < tasks.length) {
			console.log("\n--------------------------")
			console.flag("run test", i + 1, "↓\n--------------------------");
			tasks[i].run(client, function() {
				setTimeout(function() {
					run_tasks(i + 1);
				}, 300);
			});
		} else {
			console.flag("test success", "所有测试运行完成");
		}
	});
};
module.exports.run = run_tasks;