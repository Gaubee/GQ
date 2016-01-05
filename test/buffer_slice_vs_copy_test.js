var buf = new Buffer(Array(10000).join("QAQ"));
console.time("slice");
for (var i = 0; i < 100000; i += 1) {
	var b1 = buf.slice(2);
}
console.timeEnd("slice");

console.time("copy");
for (var i = 0; i < 100000; i += 1) {
	var b2 = new Buffer(buf.length - 2);
	buf.copy(b2, 2, 0);
}
console.timeEnd("copy");