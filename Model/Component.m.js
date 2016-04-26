var Waterline = require('waterline');
module.exports = [{
	identity: '_component_doc',
	connection: 'memory',
	attributes: {
		des: "string",
		doc: {
			// collection: "_component_doc_item"
			type: "json"
		},
	}
}, {
	identity: 'component',
	connection: 'memory',
	types: {},
	attributes: {
		doc: {
			model: "_component_doc"
		},
		name: {
			title: "组件名",
			type: "string",
			required: true,
			minLength: 1,
		},
		init_protos: {
			title: "构造属性",
			type: "json",
			defaultsTo: [],
		},
		methods: {
			title: "方法",
			type: "json",
			defaultsTo: [],
		},
		prototypes: {
			title: "属性",
			type: "json",
			defaultsTo: [],
		},
		app: {
			model: "application",
			required: true,
		},
		uid: {
			type: "string",
			unique: true
		},
		socket_id:{
			type: "string",
			required: true	
		}
	}
}, ];