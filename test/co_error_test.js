var co = require("co");

fun1 = co.wrap(function*() {
	throw "error"
});

fun2 = co.wrap(function*() {
	function _(done) {
		setTimeout(done, 1000)
	};
	yield _;
	yield fun1();
});

fun3 = co(function*() {
	yield fun2()
}).catch(e => console.error("EOOER:", e))