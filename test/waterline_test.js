var Waterline = require('waterline');
var sailsMemoryAdapter = require('sails-memory');

var User = Waterline.Collection.extend({

	identity: 'user',
	connection: 'default',

	attributes: {

		username: {
			type: 'string',
			required: true
		},

		password: {
			type: 'string',
			minLength: 6,
			required: true,
			columnName: 'encrypted_password'
		}

	},

	// Lifecycle Callbacks
	beforeCreate: function(values, next) {
		values.password = "QAQ" + values.password;
		next();
	}
});


// Create the waterline instance.
var waterline = new Waterline();

// Add the models to the waterline instance.
waterline.loadCollection(User);
// Set up the storage configuration for waterline.
var config = {
	adapters: {
		'memory': sailsMemoryAdapter
	},

	connections: {
		default: {
			adapter: 'memory'
		}
	}
};

waterline.initialize(config, function(err, ontology) {
	if (err) {
		return console.error(err);
	}

	// Tease out fully initialised models.
	var User = ontology.collections.user;
	User.create({
		username: "Gaubee",
		password: "123456"
	}).then(user => {
		console.log(user)
	})
});