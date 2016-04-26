exports.run = run_test;

function run_test(socket, next) {
	return co(function*() {
		/*
		在GQ项目根目录下运行：

		var waterline_instance = yield require("../../Model").install;
		var collections = waterline_instance.collections;
		var me = yield collections.user.findOrCreate({
			user_name: "Gaubee",
		}, {
			user_name: "Gaubee",
			password: "123456",
			id: 1
		});
		console.log(me);

		var my_app = yield collections.application.findOrCreate({
			app_name: "QAQ"
		}, {
			app_name: "QAQ",
			owner: me
		});

		console.log(my_app);*/

		var app = yield socket.useApp("Gaubee", "123456", "qaq");
		console.log(app);
		next();
	}).catch(e => {
		console.flag("use application error", "\n", e);
		next();
	});
};