require("GQ-core");
var tcp = require("GQ-core/tcp");
co(function*() {
	var waterline_instance = yield require("../Model").install;
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

	console.log(my_app);

	var my_component = yield collections.component.create({
		name: "zz",
		app: my_app
	});
	console.log(yield collections.component.findByName("zz").populate("app"));

}).catch(e => {
	console.error(e.message, "\n", e.stack);
});