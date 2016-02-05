require("GQ-core")
co(function*() {
	var waterline_instance = yield require("../Model").install;
	var collections = waterline_instance.collections;
	var me = yield collections.user.findOrCreate({
		user_name: "Gaubee",
	}, {
		user_name: "Gaubee",
		password: "123456",
	});
	// console.log(me);

	var my_app = yield collections.application.findOrCreate({
		app_name: "QAQ"
	}, {
		app_name: "QAQ",
		owner: me
	});

	// console.log(my_app);

	var she = yield collections.user.findOrCreate({
		user_name: "Bangeel",
	}, {
		user_name: "Bangeel",
		password: "123456",
	});
	// console.log(she);

	// my_app.developers.add(she);

	// yield my_app.save()

	var app = yield collections.application.findOne({
		app_name:"QAQ",
	}).populate("developers");
	console.log(app)
}).catch(e => {
	console.log(e.stack);
	next();
});