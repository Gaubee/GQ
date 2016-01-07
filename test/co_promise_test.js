var co = require("co");
co(function*() {
	var v = yield new Promise(function(resolve, reject) {
		var v = Math.random();
		if (v > 0.5) {
			resolve(v)
		} else {
			reject(new Error(v))
		}
	});
	console.log(v)
}).catch(e => {
	console.error("ERROR:", e.stack)
});