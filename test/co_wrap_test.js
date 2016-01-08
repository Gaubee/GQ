var co = require("co");
var fun = co.wrap(function*() {
	console.log(this,arguments);
	var p_proxy = new Promise(function(resolve, reject) {
		setTimeout(function() {
			var v = Math.random();
			if (v > 0.5) {
				resolve(v)
			} else {
				reject(v)
			}
		}, 1000)
	});
	var p = {
		then: p_proxy.then.bind(p_proxy),
		catch: p_proxy.catch.bind(p_proxy),
	};
	console.log("QAQ");
	try {
		var v = yield p;
		console.log(v)
	} catch (e) {
		console.error("ERR:", e)
	}
});
fun.call({a:"QAQ"},1, 2, 3)