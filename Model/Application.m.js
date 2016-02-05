module.exports = [{
	identity: 'application',
	schema: true,
	connection: 'disk',
	attributes: {
		/* 基础信息 */
		app_name: {
			title: "管理员帐号名",
			type: "string",
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