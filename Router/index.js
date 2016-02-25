const http_app = exports.http_app = require("./init-http");
const tcp_server = exports.tcp_server = require("./init-tcp");
exports.install = co.wrap(function*(waterline_instance) {
	function bridge_http_tcp(done) {
		tcp_server.bridgeHttp(http_app.app, waterline_instance, done);
	}
	yield [bridge_http_tcp, http_app.install];
});