exports.run = run_test;

function run_test(socket, next) {
	socket.msgInfo("redis-exec", {
		task_id: "RUN-REDIS-EXEC-TASK-ID-1",
		handle: "ZADD",
		args: ["test.gaubee", 1, "Gaubee", 2, "Bangeel"]
	});
	socket.msgInfo("redis-exec",{
		task_id:"RUN-REDIS-EXEC-TASK-ID-2",
		handle:"ZRANGEBYSCORE",
		args: ["test.gaubee", "-inf", "+inf"]
	});
	socket.onMsgSuccess("redis-return", function(data, done) {
		console.log(data)
		done();
	});
	socket.onMsgError("redis-return", function(data, done) {
		console.log(data);
		done();
	});
};