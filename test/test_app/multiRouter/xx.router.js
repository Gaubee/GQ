exports.install = function(socket) {
	return {
		prefix: "/multi",
		get: {
			"/4": [{
				emit_with: ["query"]
			}, function*() {
				console.log("4")
				this.no_wrap_body = true;
				this.body = this.query.res;
			}]
		}
	}
}