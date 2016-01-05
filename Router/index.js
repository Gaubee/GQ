var http_app = require("./init-http");
var tcp_server = require("./init-tcp");
exports.install = function(waterline_instance) {
	tcp_server.bridgeHttp(http_app, waterline_instance);
};