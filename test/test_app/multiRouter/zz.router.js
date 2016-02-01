module.exports = {
	prefix: "/multi",
	get: {
		"/1": function*() {
			console.log("1")
			this.no_wrap_body = true;
			this.body = "1"
		},
		"/2": [function*() {
			console.log("2")
			this.no_wrap_body = true;
			this.body = "2"
		}],
		"/3": [{
			emit_with: ["query"]
		}, function() {
			console.log("3")
			this.no_wrap_body = true;
			this.body = this.query.res;
		}]
	}
}