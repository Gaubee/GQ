var net = require("net");
var i = 0;
var address = {
	host: "192.168.31.225",
	port: 8081
}
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
	i += 1;
	// console.log("CLIENT:", data.toString());
	client.write("QAQ");
});