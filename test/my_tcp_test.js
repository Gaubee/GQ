var tcp = require("../lib/tcp");
var server = tcp.createServer({
	host: "0.0.0.0",
	port: "233"
}, function() {
	//服务器相应
	server.on("connection", function(socket) {
		socket.on("msg", function(msg) {
			socket.msg(msg + 1);
		});
	});
	//客户端相应
	var address = server.address();
	var client = tcp.createClient(address, function() {
		setTimeout(function() {
			console.log(num)
			process.exit()
		}, 1000);
	});
	var num = 0
	client.msg(num);
	client.on("msg", function(msg) {
		// console.log("CLIENT MSG:", msg)
		client.msg(num = msg);
	});
});