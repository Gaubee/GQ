//定义应用的名称，在数据库中会用到
// global.APPNAME = "SJ";

require("./Console");
require("./$.Object");
require("./$.Array");
require("./$.Date");
require("./$.String");
require("./$.Function");
require("./$.JSON");
require("./$.fs");
require("./$.Fiber");
require("./$.Error");
require("./$.events");
require("./Tools");
require("./iClass");
require("./fileDB");
require("./$.generator");
console.flag("init", "加载全局拓展完毕");

// exports.init = function(cb) {

// 	console.info("数据库启动中");
// 	global.db = require("../db/index");;

// 	console.log("注册类对象中");
// 	iClass.init(__dirname + "/../class");

// 	cb && cb;
// };