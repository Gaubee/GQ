var Waterline = require('waterline');
module.exports = [
	Waterline.Collection.extend({
		identity: '_router_register_doc',
		connection: 'default',
		attributes: {
			des: "string",
			doc: {
				// collection: "_router_register_doc_item"
				type: "json"
			}
		}
	}),
	Waterline.Collection.extend({
		identity: 'router_register',
		connection: 'default',
		types: {
			http_method: function(method) {
				return ["get", "post", "delete", "put"].indexOf(this.method = method.toLowerCase()) !== -1
			},
			emit_with_data: function(emit_with) {
				var full_emit_with = ["query", "params", "body"];
				this.emit_with = emit_with.filter(function(emit_with_item) {
					returnfull_emit_with.indexOf(emit_with_item.toLowerCase()) !== -1
				});
				return true;
			}
		},
		attributes: {
			doc: {
				model: "_router_register_doc"
			},
			method: {
				type: "string",
				http_method: true,
				required: true
			},
			path: {
				type: "string",
				required: true
			},
			emit_with: {
				type: "array",
				defaultsTo: ["query", "params"],
			},
			time_out: {
				type: "integer",
				defaultsTo: 30 * 1000,
			},
		}
	})
];