setTimeout(function() {
	process.exit()
}, 2000);
var net = require("net");
var server = net.createServer(function(socket) {
	socket.on("data", function(data) {
		console.log(socket.bufferSize, data.length)
	});
});

// grab a random port.
server.listen({
	host: "0.0.0.0",
	port: "233"
}, function() {
	var address = server.address();
	var client = net.connect(address, function() {
		console.log('connected to server!');

		var data = "QAQ";
		var big_data = Array(1000000).join("QAQ");
		client.write(data);
		setTimeout(function() {
			client.write(big_data);
		}, 10)
	});
});