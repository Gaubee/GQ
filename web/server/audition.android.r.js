const CoBody = require("co-body");

function read_file(file_path) {
	return new Promise(function(resolve, reject) {
		fs.stat(file_path, (err, stat) => {
			err ? reject(err) : resolve(stat);
		});
	});
};
module.exports = {
	prefix: "/android",
	get: {
		"/vedio": function*() {
			const range = this.get("range");
			const positions = range.replace(/bytes=/, "").split("-");
			const start = parseInt(positions[0], 10) || 0;
			if (!this.session.android_logined) {
				Throw("ref", "Android设备未登录");
			}
			this.status = 206;

			const file_path = "G:/baidu player/TED/Juan Enriquez_ Your online life, permanent as a tattoo.mp4";
			yield read_file(file_path).then(stat => {
				const total = stat.size;
				const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
				const chunksize = (end - start) + 1;

				console.log(start, end, chunksize, total);
				this.set({
					"Content-Range": "bytes " + start + "-" + end + "/" + total,
					"Accept-Ranges": "bytes",
					"Content-Type": "video/mp4",
					"Content-Length": chunksize
				});

				const stream = fs.createReadStream(file_path, {
					start: start,
					end: end
				}).on("open", () => {
					stream.pipe(this.res);
				}).on("error", (err) => {
					console.log("STR Err", err);
				}).on("close", () => {
					console.log("STR Clo");
				});

				return new Promise((resolve, reject) => {
					this.res
						.on("finish", resolve)
						.on("error", (err) => {
							console.log("RES Err", err);
							reject(err)
						}).on("close", () => {
							console.log("RES Clo");
							resolve()
						});
				});
			});
		}
	},
	post: {
		"/login": function*() {
			const form = yield CoBody(this, {
				limit: "1MB"
			});
			if (form.name === "android" && form.password === "android-pwd") {
				this.session.android_logined = true;
				this.body = "http://" + this.request.headers.host + "/android/vedio";
			}else{
				this.body = "name or password error";
			}
		}
	}
}