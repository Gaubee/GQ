const http_app = require("../Router").http_app;
const Router = require("koa-router");
const router_register = exports.router = Router();
// 运行平台网站
exports.install = co.wrap(function*() {
	console.group("开始安装Web层服务");

	http_app.app.use(function*(next) {
		var _g = console.group(Console.COLOR.green, this.path);
		var _t = Date.now();
		try {
			yield next;
		} catch (e) {
			console.flag("UN CATCH", e);
			this.status = 502;
			this.body = Error.isError(e) ? e.message : e;
		}
		console.groupEnd(_g, this.path, "━━┫", Date.now() - _t, "ms");
	});

	http_app.app.use(router_register.routes());
	http_app.app.use(router_register.allowedMethods());

	const extname = ".r.js"
	console.group(console.flagHead("router-install"));
	fs.lsAll(__dirname + "/server").forEach(file_path => {
		if (file_path.endWith(extname)) {
			var routers = require(file_path);
			if (routers) {
				if (Function.isFunction(routers.install)) {
					routers = routers.install(router_register);
				}
				if (Object.isObject(routers)) {

					var prefix = routers.prefix || "";
					console.group(prefix);
					Object.keys(routers).forEach(method => {
						if (["get", "post", "put", "delete"].indexOf(method.toLowerCase()) === -1) {
							return
						}
						var router = routers[method];
						Object.keys(router).forEach(path => {
							console.flag(method.toUpperCase(), path);
							router_register[method](prefix + path, router[path]);
						});
					});
					console.groupEnd(prefix);
				} else {
					console.error(console.flagHead("RouterModule"), file_path, "wrong routers-object")
				}
			} else {
				console.error(console.flagHead("RouterModule"), file_path, "wrong routers-object")
			}
		}
	});
	console.groupEnd(console.flagHead("router-install"));
	console.groupEnd("Web成服务安装完成");
}, err => {
	console.log(err)
});