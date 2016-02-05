exports.run = run_test;

function run_test(socket, next) {
	return co(function*() {
		var com_instance = yield socket.initComponent("c1", []);
		console.log(com_instance);
		next();
	});
};