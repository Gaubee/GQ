exports.install = install;

function install(socket, http_app, waterline_instance) {
	// 如果关闭了,socket注册的Component要全部注销掉
	const _close_flag = console.flagHead("SOCKET CLOSE");
	socket.on("close", co.wrap(function*() {
		if (socket.using_app) {
			// socket.using_app对象在后面马上就要执行的Socket析构函数中马上就要被释放掉，所以这里需要缓存app_name和id对象确保这里的异步析构能正常运作
			const _flag_content = `注销 [${socket.using_app.app_name}](${socket._id}) 注册的${"组件".inverse}`;

			const _g = console.group(_close_flag, "开始" + _flag_content);
			const components = yield waterline_instance.collections.component.destroy({
				socket_id: socket._id
			});
			console.log(components.map(com => com.name).join("\n"))
			console.groupEnd(_g, _close_flag, "完成" + _flag_content);
		}
	}, err => {
		console.groupEnd(_close_flag, err);
	}));

	return co.wrap(function*(data, done) {
		const base_component_info = data.info;
		if (!Object.isObject(base_component_info)) {
			console.log(new TypeError("component_info is null."));
			return done();
		}

		if (!socket.using_app) {
			Throw("ref", "please use app before register component!");
		}
		base_component_info.app = socket.using_app.id;
		base_component_info.socket_id = socket._id;
		base_component_info.uid = socket._id + "|" + base_component_info.app + "|" + base_component_info.name;


		const component_info = yield waterline_instance.collections.component.create(base_component_info);

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