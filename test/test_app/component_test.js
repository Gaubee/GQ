exports.run = run_test;

function run_test(socket, next) {
	"use strict"
	return co(function*() {
		/*C1*/
		class C1 {
			constructor(name, age) {
				this.name = name;
				this.age = age;
				// console.log(this);
			}
			[socket.destroy_symbol]() {
				console.log("RUN DESTROY");
				return ["QAQ"]
			}

			say(word) {
				return this.name + ": " + word;
			}
		}
		console.log("socket.destroy_symbol:",socket.destroy_symbol,typeof C1.prototype[socket.destroy_symbol]);
		C1.prototype.nextYear = function() {
			return this.age += 1;
		}.noAsComProto();
		C1.prototype._die = function(in_year) {
			Throw("range", "DIE!")
			return this.age = in_year;
		}.asComProto({
			des: "die in year",
			params: ["in_year|Number"]
		});
		var c1 = yield socket.registerComponent("c1", {
			des: "C1 Com",
			properties: ["name", "age"]
		}, C1);
		// console.log(JSON.stringify(c1.doc, null, "    "), c1.uid);
		console.log("组件:c1注册完成", c1.doc);

		/*C2*/
		var c2 = yield socket.registerComponent("c2", {
			des: "C2 Com"
		}, function C2(init_protos) {
			var res = {};
			res.say = function(word) {
				return init_protos.name + ": " + word
			}
		});
		// console.log(JSON.stringify(c2.doc, null, "    "), c2.uid);
		console.log("组件:c2注册完成", c2.uid);

		/*C3*/
		var c3 = yield socket.registerComponent("c3", {
			des: "C3 Com",
			prototypes: ["word|Number:zzz"],
			methods: ["_cry:zzzzZ"],
		}, {
			// _cry:function () {
			// 	return this.name+" is crying";
			// },
			say: function(word) {
				return this.name + ": " + word;
			},
			word: "QAQ",
			__no_as_com_proto__: [],
			__as_com_proto__: []
		});
		// console.log(JSON.stringify(c3.doc, null, "    "), c3.uid);
		console.log("组件:c3注册完成", c3.uid);

		// /*C4*/
		// var c4 = yield socket.registerComponent("c1", {
		// 	des: "C4 Com",
		// }, [])
		// // console.log(JSON.stringify(c4.doc, null, "    "), c4.uid);
		// console.log("组件:c4注册完成",c4.uid);

		next();
	}).catch(e => {
		console.flag("component error", "\n", e.message, e.stack);
		next();
	});
};