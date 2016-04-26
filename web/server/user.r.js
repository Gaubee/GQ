exports.install = install;

function install(waterline_instance) {

	return {
		prefix: "/user",
		get: {
			"/loginer": function*() {
				const login_user_id = this.session.login_user_id;
			}
		}
	}
}