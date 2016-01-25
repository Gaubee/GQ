var net = require("net");
var i = 0;
setTimeout(process.exit, 1000);
var server = net.createServer(function(socket) {
	socket.on("data", function(data) {
		i += 1;
		// console.log("SERVER:", data.toString());
		socket.write(data);
	});
});

// grab a random port.
server.listen({
	host: "0.0.0.0",
	port: "233"
}, function() {
	var address = server.address();
	console.log(address)
	var client = net.connect(address,
		function() { //'connect' listener
			console.log('connected to server!');
			client.write('worldwsssssdadaddadads!\r\n');
			setTimeout(function() {
				console.log("一秒内一共进行了", i, "次TCP基础通讯");
				process.exit()
			}, 1000);
		});
	client.on("data", function(data) {
		// console.log("CLIENT:", data.toString());
		client.write(JSON.stringify({
			"data": data
		}));
	});
});