var net = require("net");
var _uid = 0
var server = net.createServer(function(socket) {
	var id = ++_uid;
	socket.on("data", function(data) {
		console.log(id)
	});
});

// grab a random port.
server.listen({
	host: "0.0.0.0",
	port: "233"
}, function() {
	setTimeout(function() {
		process.exit()
	}, 2000);
	var address = server.address();
	var client_1 = net.connect(address, function() {
		console.log('1: connected to server!');
	});
	var client_2 = net.connect(address, function() {
		console.log('1: connected to server!');
	});
	var big_data_1 = Array(1000000).join("1");
	var big_data_2 = Array(1000000).join("2");
	client_1.write("1");
	client_2.write("2");
	client_1.write("1");
	client_2.write("2");
	client_1.write(big_data_1);
	client_2.write(big_data_2);
	client_1.write(big_data_1);
	client_2.write(big_data_2);
});