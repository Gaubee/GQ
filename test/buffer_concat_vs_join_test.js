var b1 = new Buffer("Gaubee")
var b2 = new Buffer(" ")
var b3 = new Buffer("Bangeel")
var bufs = [b1, b2, b3];

console.time("concat");
for (var i = 0; i < 100000; i += 1) {
	var res = Buffer.concat(bufs).toString()
}
console.log(res);
console.timeEnd("concat");

console.time("join");
for (var i = 0; i < 100000; i += 1) {
	var res = bufs.join("")
}
console.log(res);
console.timeEnd("join");