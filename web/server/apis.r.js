exports.install = install;

function install(waterline_instance, r) {
	const connPool = r.tcp.connPool;

	return {
		prefix: "/apis",
		get: {
			"/all": function*(next) {
				console.log(connPool.size);
				var res = [];
				yield connPool.map(co.wrap(function*(socoon) {
					if (socoon.using_app) {
						res.push({
							app: yield waterline_instance.collections.application.findOne(socoon.using_app.id).populateAll(),
							apis: yield waterline_instance.collections.router_register.find({
								owner: socoon.using_app.id
							}).populate("doc")
						});
					}
				}));
				this.body = {
					type: "json",
					info: res
				};
			},
			"/all.json": function*(next) {
				var jsonp = this.query.jsonp;
				// console.log(this.req)
				var host = this.query.host || this.protocol + "://" + this.get("host") || "${%HOST%}";
				var prefix = jsonp ? $$.uuid() : host

				var res = new PathObject();

				yield connPool.map(co.wrap(function*(socoon) {
					if (!socoon.using_app) {
						return;
					}
					var apis = yield waterline_instance.collections.router_register.find({
						owner: socoon.using_app.id
					});
					apis.forEach(function(api) {
						var path_fragments = api.path.split("/");
						var path_for_object_s_key = api.path.replace(/:/g, "$");
						var formatable_path = prefix + api.path.replace(/:([^:\/]+)/g, "${$1}");
						res.set(path_for_object_s_key, formatable_path);
					});
				}));

				var res_str = JSON.stringify(res);

				if (jsonp) {
					this.type = "application/javascript"
					res_str = jsonp + "(function(h){return " + res_str.replaceAll('"' + prefix, 'h+"') + "}(" + JSON.stringify(host) + "));";
				} else {
					this.type = "application/json"
				}
				this.body = res_str;
			},
		}
	};
}