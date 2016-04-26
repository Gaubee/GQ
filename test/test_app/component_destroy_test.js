exports.run = run_test;

function run_test(socket, next) {
	return co(function*() {
		var com_instance = require("./component_run_test").com_instance;
		console.log(yield com_instance.destroy());
		next();
	}).catch(e => {
		console.flag("destroy component error", e);
		next();
	});
};