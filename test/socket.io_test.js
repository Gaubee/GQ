setTimeout(function() {
	process.exit()
}, 1500);
var server = require('socket.io')('');
server.on('connection',function (socket) {
	console.log(socket.id)
});
var client = require('socket.io-client')();