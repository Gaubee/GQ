const path = require("path");

function read_file(file_path) {
	return new Promise(function(resolve, reject) {
		fs.stat(file_path, err => {
			err ? reject(err) : resolve(fs.createReadStream(file_path))
		})
	})
};

var static_server_config = {
	default: "index.html",
	file_404: "404.html",
	root: path.normalize(__dirname + "/../static/client/")
};
module.exports = {
	prefix: "/web",
	get: {
		"/*": function*(next) {
			// this.body = this.params;
			const file_path = path.normalize(static_server_config.root + (this.params[0] || static_server_config.default));

			const send_file = (file_stream, flag) => {
				console.flag(flag || "send-file", file_path);
				// 使用箭头函数，所以this指向的依旧是上层的this
				file_stream.pipe(this.res);
				return new Promise(resolve => this.res.on("finish", resolve))
			};

			this.status = 200;

			yield read_file(file_path)
				.then(send_file)
				.catch(err => {
					this.status = 404;
					return read_file(static_server_config.root + static_server_config.file_404)
						.then(file_stream => send_file(file_stream, "404-file"))
						.catch(err => {
							console.flag("404-data", "No Found");
							this.body = "<h1>404</h1>"
						})
				});
		},
	}
}