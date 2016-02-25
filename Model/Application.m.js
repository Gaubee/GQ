module.exports = [{
	identity: 'application',
	schema: true,
	connection: 'disk',
	types: {
		system_app_name: function(app_name) {
			return [ // 系统级需要用到的关键字
					"web",
					"sys",
					"system",
					"dev",
					"doc",
					"api",
					"admin",
					"user",
					"blog",
				]
				// 小写化
				.indexOf(this.app_name = app_name.toLowerCase()) !== -1
		}
	},
	attributes: {
		/* 基础信息 */
		app_name: {
			title: "管理员帐号名",
			type: "string",
			system_app_name: true,
			unique: true, //唯一
			required: true,
		},
		owner: {
			model: "user",
			required: true,
		},
		developers: {
			collection: "user"
		}
	}
}];