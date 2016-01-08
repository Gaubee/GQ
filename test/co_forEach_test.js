var co = require("co");
var s = new Set();
s.add("Gaubee");
s.add("Bangeel");
co(function*() {
	function _handle(data, time) {
		return function(done) {
			setTimeout(function() {
				done(null, data + " QAQ")
			}, time || 1000)
		}
	}
	var res = [];
	s.forEach(co.wrap(function*(item) {
		res.push({
			z: {
				a: _handle(item, Math.random() * 2000)
			}
		})
	}));
	console.log("res", yield res);
	console.log("OK")
})