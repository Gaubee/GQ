var m = new Map;
m.set("a", 1);
m.set("b", 2);
m.set("c", 3);
m.set("d", 4);
m.set("e", 5);

console.log(m)
m.forEach((v, k) => {
	console.log(v, k);
	m.delete(k)
	m.delete("d")
});
console.log(m)