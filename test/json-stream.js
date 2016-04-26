const http = require("http");
const JSONStream = require('JSONStream');
const request = require('request');
const es = require('event-stream');
var Worker = require('webworker-threads').Worker;

var json = JSON.stringify({
	a: "1",
	b: 2,
	h: "123".repeat(100),
	c: [1, 2, 3, 4, {
		d: false,
		e: null
	}, 6],
	g: "123".repeat(900)
});
var json_arr = Array.from({
	length: 20
});
var len = json_arr.length;
var per = Math.ceil(json.length / len);
json_arr.forEach((v, i) => {
	json_arr[i] = json.substr(i * per, per)
});

setTimeout(() => {
	process.exit(0)
}, 2000);



http.createServer((req, res) => {
	var _data = json_arr.slice();
	var _ti = setInterval(function() {
		res.write(_data.shift());
		if (_data.length <= 0) {
			clearInterval(_ti);
			res.end()
		}
	}, 99)
}).listen(911);


// http.get("http://localhost:911", function(res) {
// 	res.on("data", function(chunk) {
// 		console.log(chunk)
// 	});
// });
var s = request({
	url: "http://localhost:911"
});
// s.pipe(es.map(data=>{
// 	console.log(data)
// }))
s
	.pipe(JSONStream.parse('b'))
	.pipe(es.map(function(data, cb) {
		console.log(data)
		cb(null, data)
	}));
s
	.pipe(JSONStream.parse('c.*.$*'))
	.pipe(es.map(function(data, cb) {
		console.log("data:", data)
		cb(null, data)
	}));


var worker = new Worker(function() {
	console.log(Object.keys(this))
	console.log(Object.keys(native_fs_))
	postMessage("I'm working before postMessage('ali')."+typeof console);
	this.onmessage = function(event) {
		postMessage('Hi ' + event.data);
		self.close();
	};
});
worker.onmessage = function(event) {
	console.log("Worker said : " + event.data);
};
worker.postMessage('ali');
// var request = require('request'),
// 	JSONStream = require('JSONStream'),
// 	es = require('event-stream')

// request({
// 		url: 'http://isaacs.couchone.com/registry/_all_docs'
// 	})
// 	.pipe(JSONStream.parse('rows.*'))
// 	.pipe(es.mapSync(function(data) {
// 		console.error(data)
// 		return data
// 	}))