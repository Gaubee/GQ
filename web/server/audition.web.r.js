const json_data = {
	title: "WEB程序员测试",
	info: {
		url: "http://www.leninimports.com/rosa_bonheur_sheep_by_the_sea_print.jpg",
		des: "WEB前端demo"
	}
};
var tempinfo = `
<h1>{{title}}</h1>
<input type='checkbox' />点我变换 
	<div class='card'>
	<img src='{{info.url}} '/>
	<p>{{info.des}} </p >
	<p>{{info.des}} </p >
	<p>{{info.des}} </p >
</div>`;

// var res = (temp + tempinfo).replace(/\{\{([\w\.]+?)\}\}/g, function(s, key) {
// 	// console.log(key)
// 	with(json_data) {
// 		return (eval(key))
// 	}
// });
// console.log(res);

// var ss = temp + tempinfo;
// for (key in json) {
// 	var reg = new RegExp("\{\{" + key + "\}\}");
// 	if (ss.split(reg).length > 1) {
// 		ss = ss.split(reg).join(json[key]);
// 	} else {
// 		if (typeof json[key] == "object") {
// 			for (keys in json[key]) {
// 				var reg = new RegExp("\{\{" + key + "." + keys + "\}\}");
// 				if (ss.split(reg).length > 1) {
// 					ss = ss.split(reg).join(json[key][keys]);
// 				} else {
// 					ss = ss.replace(reg, json[key][keys]);
// 				};
// 			};
// 		} else {
// 			ss = ss.replace(reg, json[key]);
// 		};
// 	};
// };


module.exports = {
	prefix: "/html",
	get: {
		"/index": function*() {
			this.type = "text/html";
			this.status = 200;
			yield new Promise((resolve, reject) => {
				fs.createReadStream("E:/TEMP/2-24 面试内容.html")
					.pipe(this.res)
					.on("finish", resolve)
					.on("error", reject);
			});
			// this.body = fs.readFileSync(__dirname + "/readme.html");
		},
		"/template_json_data": function*() {
			// console.log(this.request.headers)
			this.body = {
				html_tmp: tempinfo,
				json_data: json_data
			};
		}
	}
}