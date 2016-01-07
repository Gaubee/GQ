var http_app = exports.http_app = require("./init-http");
var tcp_server = exports.tcp_server = require("./init-tcp");
exports.install = function(waterline_instance) {
	tcp_server.bridgeHttp(http_app, waterline_instance);
};