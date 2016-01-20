var co = require("co");
var run_test = co.wrap(function*(socket, next) {
	try {
		var res = yield socket.redisExec("ZADD", ["test.gaubee", 1, "Gaubee", 2, "Bangeel"]);
		console.log("ZADD", res);
		var res = yield socket.redisExec("ZRANGEBYSCORE", ["test.gaubee", "-inf", "+inf"]);
		console.log("ZRANGEBYSCORE", res);
	} catch (e) {
		console.error(e)
	}
});
exports.run = run_test;