require("GQ-core");

co(function*() {
	var p = {};
	p.promise = new Promise(function(reslove, reject) {
		p.reslove = reslove;
		p.reject = reject;
	}).then(function(d) {
		console.log("then", d,arguments);
		return d+"QAQ"
	});
	setTimeout(function() {
		p.reslove("ok")
	});

	console.log(yield p.promise);
});