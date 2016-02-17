exports.run = run_test;

function run_test(socket, next) {
	return co(function*() {
		var com_instance = exports.com_instance = yield socket.initComponent("c1", ["Gaubee"]);
		console.log("run [say] res:", yield com_instance.say("Hi!"));
		// 消息的传输时单线程的，是阻塞的，这里调用了Setter，虽然无法得到一个Promise，但是如果后续的程序继续调用这个Socket，并且正常运行，这个Promise是能确保已经发送。
		com_instance.name = "Bangeel";
		// 如果不传入指令，返回的将会是Promise-Array，开发者可以使用这个特性，发送多条指令后，再使用这个方法得到一个yieldable对象。
		console.log(com_instance());

		console.log(yield com_instance.name)

		console.log(com_instance())

		console.log("run [say] res:", yield com_instance.say("Hi!"));

		console.log("run [say] res:", yield com_instance._die("Hi!"));

		next();
	}).catch(e => {
		console.flag("run component error", e);
		next();
	});
};