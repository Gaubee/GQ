exports.install = install;

function install(socket, http_app, waterline_instance) {
	// 如果关闭了,socket注册的Component要全部注销掉
	socket.on("close", co.wrap(function*() {
		if (socket.using_app) {
			var _flag = console.flagHead("SOCKET CLOSE");
			console.group(_flag, "注销应用 " + socket.using_app.app_name + " 组件");
			var components = yield waterline_instance.collections.component.destroy({
				app: socket.using_app.id
			});
			console.log(components.map(com => com.name).join("\n"))
			console.groupEnd(_flag, "注销应用 " + socket.using_app.app_name + " 组件");
		}
	}));

	return function(data, done) {
		return co(function*() {
			if (!socket.using_app) {
				Throw("ref", "please use app before register component!");
			}
			data.info.app = socket.using_app.id;
			data.info.uid = socket._id + "|" + data.info.app + "|" + data.info.name;
			var component_info = yield waterline_instance.collections.component.create(data.info);

			/*RETURN*/
			var full_component_info = yield waterline_instance.collections.component.findOne(component_info.id).populateAll();

			console.flag("SERVER:component-register", "\n",
				socket.using_app.app_name, ":", component_info.name +
				"(" + (Array.isArray(full_component_info.doc.init_protos) ? full_component_info.doc.init_protos : [])
				.map(init_proto => init_proto.name).join(", ") + ")");
			socket.msgSuccess("component-register", full_component_info);
			done();

		}).catch(err => {
			console.flag("component-register:error", err);
			socket.msgError("component-register", data.info, err.message);
			done();
		});
	};
}