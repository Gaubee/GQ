exports.install = install;

function install(socket, http_app, waterline_instance) {
	// 如果关闭了,socket注册的Component要全部注销掉
	const _close_flag = console.flagHead("SOCKET CLOSE");
	socket.on("close", co.wrap(function*() {
		if (socket.using_app) {
			// socket.using_app对象在后面马上就要执行的Socket析构函数中马上就要被释放掉，所以这里需要缓存app_name和id对象确保这里的异步析构能正常运作
			const app_name = socket.using_app.app_name;
			const app_id = socket.using_app.id;
			const _flag_name = "组件".inverse;

			const _g = console.group(_close_flag, "开始注销应用 " + app_name + " 注册的" + _flag_name);
			const components = yield waterline_instance.collections.component.destroy({
				app: app_id
			});
			console.log(components.map(com => com.name).join("\n"))
			console.groupEnd(_g, _close_flag, "完成注销应用 " + app_name + " 注册的" + _flag_name);
		}
	}, err => {
		console.groupEnd(_close_flag, err);
	}));

	return co.wrap(function*(data, done) {
		if (!socket.using_app) {
			Throw("ref", "please use app before register component!");
		}
		data.info.app = socket.using_app.id;
		data.info.uid = socket._id + "|" + data.info.app + "|" + data.info.name;
		const component_info = yield waterline_instance.collections.component.create(data.info);

		/*RETURN*/
		const full_component_info = yield waterline_instance.collections.component.findOne(component_info.id).populateAll();

		console.flag("SERVER:component-register", "\n",
			socket.using_app.app_name, ":", component_info.name +
			"(" + (Array.isArray(full_component_info.doc.init_protos) ? full_component_info.doc.init_protos : [])
			.map(init_proto => init_proto.name).join(", ") + ")");
		socket.msgSuccess("component-register", full_component_info);
		done();
	}, (err, data, done) => {
		// console.flag("component-register:error", err);
		socket.msgError("component-register", data.info, err.message);
		done();
	});
}