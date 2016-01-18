var Waterline = require('waterline');
var sailsMemoryAdapter = require('sails-memory');

// Create the waterline instance.
var waterline = new Waterline();

// Set up the storage configuration for waterline.
var config = {
	adapters: {
		'memory': sailsMemoryAdapter,
	},

	connections: {
		'memory': {
			adapter: 'memory'
		}
	}
};

var install_w = new $$.When(1);
waterline.install = function(cb) {
	install_w.then(function(args) {
		cb(args[0])
	});
	waterline.install = function(cb) {
		install_w.then(function(args) {
			cb(args[0])
		});
	};

	console.group(console.flagHead("model-install"))
	fs.lsAll(__dirname).forEach(function(file_path) {
		if (file_path.endWith(".m.js")) {
			// Add the models to the waterline instance.
			try {
				var _collections = require(file_path);
				if (Array.isArray(_collections)) {
					_collections.forEach(_collection => waterline.loadCollection(_collection));
				} else {
					waterline.loadCollection(_collections);
				}
				console.log("安装", file_path.replace(__dirname, ""), "成功")
			} catch (e) {
				console.error(file_path);
				console.error(e);
			}
		}
	});
	console.groupEnd(console.flagHead("model-install"));

	waterline.initialize(config, function(err, ontology) {
		if (err) {
			console.error(err);
			return;
		}
		install_w.ok(0, ontology)
	});
};

module.exports = waterline;