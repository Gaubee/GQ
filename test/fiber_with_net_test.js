setTimeout(function() {
	process.exit()
}, 2000);
var Fiber = require("fibers");
Fiber(function() {

	function run(generatorFunction) {
		var generatorItr = generatorFunction(resume);

		function resume(callbackValue) {
			generatorItr.next(callbackValue);
		}
		generatorItr.next()
	};

	var net = require("net");
	var server = net.createServer(function(socket) {

		socket.on("data", function(chunk) {
			run(function*(resume) {
				console.log(">>>>")
				yield socket.emit("QAQ", chunk, resume)
				console.log("<<<<")
			});
		});

		socket.on("QAQ", function(chunk, next) {
			setTimeout(function() {
				console.log("SERVER:", chunk.toString());
				next();
			},200);
		});
	});
	server.listen({
		address: "0.0.0.0",
		port: 4001
	}, function() {
		console.log("START SERVER")
	});

	var client = net.connect(server.address(), function() {
		console.log("START CLIENT")
		client.write("sss")
	});


	// function sleep(ms) {
	// 	var fiber = Fiber.current;
	// 	setTimeout(function() {
	// 		fiber.run();
	// 	}, ms || 1000);
	// 	Fiber.yield();
	// };
	// sleep();
	// console.log("?");
	// sleep();
	// console.log("?");
	// sleep();
	// console.log("?");
}).run();