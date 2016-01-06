var path = require("path");

var events = {};
fs.lsAll(__dirname).forEach(file_path => {
	var _ext = ".r.js";
	if (file_path.endWith(_ext)) {
		var eventName = path.basename(file_path).replace(_ext, "");
		events[eventName] = require(file_path);
	}
});

exports.install = install;

function install(socket, http_app, waterline_instance) {
	//注册初始化
	socket.onMsgInfo("router-init", function(data, done) {
		waterline_instance.collections.router_init.create(data.info).then(router_init => {
			//TODO:根据info.author.version版本号更新注册悉信息
			socket.router_init = router_init;

			//初始化完成后，可以开始注册路由
			Object.keys(events).forEach(key => {
				console.group(console.flagHead("router-install"));
				console.log("安装", key, "完成")
				socket.onMsgInfo(key, events[key].install(socket, http_app, waterline_instance));
				console.groupEnd(console.flagHead("router-install"));
			});
			console.flag("success router-init", "[路由] 申请 初始化成功");

			//返回完成
			socket.msgSuccess("router-init", "success");
			done();
		}).catch(err => {
			socket.msgError("router-init", err, "[路由] 申请 初始化失败");
			done();
		});
	});
};