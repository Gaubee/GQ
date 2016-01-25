var Waterline = require('waterline');
module.exports = [
	Waterline.Collection.extend({
		identity: '_router_init__info',
		connection: 'memory',
		attributes: {
			author: "string",
			version: "string"
		}
	}),

	Waterline.Collection.extend({
		identity: '_router_init__ip_address',
		connection: 'memory',
		attributes: {
			host: {
				type: "string",
				// ip: true,
				defaultsTo: "0.0.0.0"
			},
			port: {
				type: "integer",
				// required: true
			}
		}
	}),

	Waterline.Collection.extend({
		identity: 'router_init',
		connection: 'memory',
		attributes: {
			// type: {
			// 	type: "string",
			// 	required: true
			// },
			info: {
				model: "_router_init__info",
				required: true
			},
			address: {
				model: "_router_init__ip_address",
				required: true
			},
			initKey: {
				type: "string",
				required: true
			}
		}
	})
]