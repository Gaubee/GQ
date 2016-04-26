/*console.group = console.groupEnd = function noop() {}
const co = require("co");*/
require("gq-core")
const EventEmitter = require('events');
const event = new EventEmitter();

function sleep(t) {
	return done => setTimeout(done, t);
};

var run_task = co.wrap(function*() {
	console.log("start")
	yield sleep(1000 * Math.random())
	console.log("end")
});

event.on("run-task", function() {
	co(function*() {
		var _g = console.group("task-1")
		yield run_task();
		console.groupEnd(_g, "task-1")
	})
});
event.on("run-task", function() {
	co(function*() {
		var _g = console.group("task-2")
		yield run_task();
		console.groupEnd(_g, "task-2")
	})
});

event.emit("run-task");