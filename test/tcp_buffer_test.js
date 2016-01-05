var net = require("net");
var server = net.createServer(function(socket) {
	socket.on("data", function(data) {
		data = JSON.parse(data.toString())
		console.log("SERVER:", data.buffer);
	});
});

// grab a random port.
server.listen({
	host: "0.0.0.0",
	port: "233"
}, function() {
	var address = server.address();
	var client = net.connect(address,
		function() { //'connect' listener
			console.log('connected to server!');
			setTimeout(function() {
				process.exit()
			}, 1000);
		});
	client.write(JSON.stringify({
		"buffer": Buffer('12')
	}));
});