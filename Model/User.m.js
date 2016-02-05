module.exports = [{
	identity: 'user',
	schema: true,
	connection: 'disk',
	attributes: {
		/* 基础信息 */
		user_name: {
			title: "用户帐号名",
			type: "string",
			unique: true, //唯一
			required: true,
		},
		password: {
			title: "登录密码",
			type: "string",
			required: true,
			minLength: 6,
			md5_2_password: function(cb) {
				if (this.password.length !== 64) {
					this.password = $$.md5_2(this.password);
				}
				cb(this.password);
			}
		},
	}
}];