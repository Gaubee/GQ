exports.run = run_test;

function run_test(socket, next) {
	return co(function*() {
		var com_instance = yield socket.initComponent("c1", ["Gaubee"]);
		console.log("run [say] res:", yield com_instance.say("Hi!"));
		next();
	}).catch(e => {
		console.flag("run component error", "\n", e.message, e.stack);
		next();
	});
};