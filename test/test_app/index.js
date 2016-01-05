var tasks = [
	require("./router_init_test.js"),
	require("./router_register_test.js")
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

function run_tasks(i) {
	w.then(function() {
		i || (i = 0);
		if (i < tasks.length) {

			tasks[i].run(client, function() {
				run_tasks(i + 1)
			});
		} else {
			console.flag("test success", "所有测试运行完成");
		}
	});
};
module.exports.run = run_tasks;