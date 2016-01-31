# 沙盒化的Component

组件的工作原理，和沙盒类似。在GQ-CORE提供的接口中，组件可以和数据库交互，组件也可以和组件交互，最终为Application提供服务。


组件所访问的数据库，有两种，一种是**所属者Application**的数据库。还有一种拓展，是**调用者Application**的数据库。
意味着，如果组件只为当前应用服务，那么这二者指向的是同一个人。而如果是开放组件，那么就有区别了，开放组件，更多的是使用调用者数据库。

## 1. 注册组件

```js
// Client -> Server
{
	type: "component-register",
	info: {
		doc: { // 这个路由的描述
			des: "**描述description**",
			params: [{
				type: "String",
				name: "param_1",
				des: "参数1"
			}, {
				type: "Number",
				name: "param_2",
				des: "参数2"
			}],
			returns: [{
				type: "Object",
				des: "返回值"
			}]
		},
		name: "**Component Name**",
		time_out: 30 * 1000 // 同上
	}
}
// Server -> Client
{
	type: "success",
	from: "router-component",
	info: router_component_data
}
```

## 2. 组件调用

```js
// Client1 -> Server -> Client2
{
	type: "run-component",
	info: {
		task_id: "**HASH**",
		app: "**Application Name**",
		name: "**Component Name**",
		args: [ * * ARGS * * ]
	}
}
// Client2 -> Server -> Client1
{
	type: "component-return",
	info: {
		task_id: "**HASH**",
		return_data: { /**RETURN DATA**/ }
	}
}
```

## 3. 参数按需传输

一些参数，可能是要按需传递，避免过多的数据传输消耗：
```js
// Client1 -> Server -> Client2
{
	type: "get-component-data",
	info: {
		require_id: "**HASH**", //因为可能会同时存在多个get-component-data请求，所以需要带上一个require_id来做请求区分
		task_id: "**HASH**",
		params: ["params_name"]
	}
}
// Client2 -> Server -> Client1
{
	type: "return-component-data",
	info: {
		require_id: "**HASH**",
		task_id: "**HASH**",
		data_list: [params_name]
	}
}
```



## 使用DEMO：

```js
// Client2
socket.registerComponent("Interview", {
	doc: "reporter of client 2"
}, function*(question) {
	if (question == "are you ready?") {
		var age = yield this.getParams("age"); // 19
		var name;
		yield this.getParams(name = {
			firstName: "",
			lastName: ""
		}); // name == {"firstName": "FN", "lastName": "LN"}
		var parents;
		yield this.getParams(parents = ["father", "mother"]);// parents == ["FA", "MO"]
		this.res = "done";
	}else{
		this.res = "fail";
	}
});

// Client1
// 可能要传输的参数
var task = socket.runComponent("Interview", ["are you ready?"]); //{id: "**HASH**", res: <Promise Object> }
socket.hookComponentParams(task.id, {
	"age": 19,
	"firstName": "FN",
	"lastName": "LN",
	"father":"FA",
	"mother":"MO"
});
console.log(yield res); // done
```