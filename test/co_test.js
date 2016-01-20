var co = require("co");
co(function*() {
	var result = yield Promise.resolve(true);
	return result;
}).then(function(value) {
	console.log(value);
}, function(err) {
	console.error(err.stack);
});

co(function * () {
	yield 1;
	yield 2;
	yield 3;
	console.log(4)
})