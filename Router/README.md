# 路由转发层

这是一个统一的路由转发器。和Controller一样可以被动态注册。

这个路由转发器统一注册了WS、HTTP、TCP协议，毕竟HTTP底层就是TCP、所以统一了类HTTP行为。其中对Cookie操作做了特定的包装。

## 用法

### 1. 初始化应用信息
```js
// Client -> Server
{
	type: "router-init",
	info:{
		info:{
			author: "Gaubee",
			version: "1.0.0"
		},
		address:{
			host: "0.0.0.0",
			port: 1234
		},
		initKey:"**HASH**"
	}
}
// Server -> Client
{
	type: "router-init",
	info: "success"
}
```

info为任意内容，在查看自动生成的文档时方便了解相关信息。
info中版version是有固定格式的，分为大、中、小三个版本标识，大版本代表一些核心架构上的变迁、小版本代表bug修复。这两个版本标识都不会触发特殊操作（大版本的变迁可能更多需要手动的重启操作等），而中版本标识，代表着Router的新增与删除，Server会删除原本所有的接口，然后将新的接口全部重新注册一遍。

address指的是当前应用在反向通讯的时候所对应的TCP连接信息，当应用TCP-client出现问题，Router-Server想要主动建立连接的时候会使用这个address。一般来说这个address注册的是一个与当前应用独立开来的服务，可以用来控制应用或者查看应用日志。比如说当Router-Server重启的时候，连接断开了，等重启完成，Router-Server会使用这个address通知应用重新进行连接。

initKey代表着应用身份。这个身份key按需颁发，并且在多个连接Router-Server的应用中只能有一个应用使用。无需确保这个key没有公开。

### 注册路由
```js
// Client -> Server
{
	type: "router-register",
	info: {
		doc:{ // 这个路由的描述
			des: "**描述description**",
			params: [{
				type: "String",
				name: "param_1",
				des: "参数1"
			},{
				type: "Number",
				name: "param_2",
				des: "参数2"
			}],
			returns:[{
				type: "Object",
				des: "返回值"
			}]
		},
		method: "GET",
		path: "/blogs/list",
		emit_with: ["query", "params"] // 可空，这里显示默认值（这两种值的对象不会有big-Object，所以直接返回会比较简单）
		time_out: 30*1000 // 同上
	}
}
```
如果返回成功：
```js
//Server -> Client
{
	type: "success",
	from: "router-reigster",
	info: router_reigster_data
}
```
则说明这个Path将会路由到你的应用上。

### 响应路由
接下来应用要做的就是响应路由：
```js
//Server -> Client
{
	type: "emit-task",
	info:{
		path: "/blogs/list",
		method: "GET",
		task_id: "**HASH**",
		time_out: 30*1000, // 单位是毫秒
		emit_with: [{num:10}]
	}
}
```
在应用中接受到响应路由的指令后，通过path、method判断出要使用哪一个方法进行处理。处理完成后根据这个task_id进行返回或者取params、query、body等操作。如果认为这一步是多余的，可以在emit_with中加入想要直接取到的数据。避免TCP数据传输所带来的多余的损耗。
```js
// Client -> Server
{
	type: "get-task-data",
	info:{
		require_id: "**HASH**", //因为可能会同时存在多个get-task-data请求，所以需要带上一个require_id来做请求区分
		task_id: "**HASH**",
		data_list: ["query.num"]
	}
}
//Server -> Client
{
	type: "return-task-data",
	info:{
		require_id: "**HASH**",
		task_id: "**HASH**",
		data_list: [10]
	}
}
```
在应用处理完数据，则返回结果
```js
// Client -> Server
{
	type:"return-task",
	info:{
		task_id: "**HASH**",
		return_data:{ // 这里遵循HTTP协议的规则
			status: 200,
			set_cookies: ["type=ninja", "language=javascript"],
			response_type: "text/html;utf-8",
			body: "**String**"
		}
	}
}
```
这里body是String类型，如果你的返回值需要涉及到多次（大文件）发送或者是特殊类型（buffer）：
```js
// Client -> Server
{
	type:"return-task",
	info:{
		task_id: "**HASH**",
		return_data:{ // 这里遵循HTTP协议的规则
			status: 200,
			set_cookies: ["type=ninja", "language=javascript"],
			response_type: "text/html;utf-8",
			body: Buffer("12") //{ type: 'Buffer', data: [ 49, 50 ] }
		},
		stop_end_send: true //说明这次发送不要执行 .end，等一下还有数据要写入
	}
}
// 如果response发送完成
// Server -> Client
{
	type: "success",
	from: "return-task",
	info: {
		task_id: "**HASH**"
	}
}
// 如果response发送失败，或者没有收到相应超时返回
// Server -> Client
{
	type: "error",
	from: "return-task",
	info: {
		task_id: "**HASH**",
		error:{
			details: "String"
		}
	}
}
```
另外time_out代表着超时的时间数量，这里只是一个简单的数据提示，如果应用在30s-10s后还没有返回，Server端会发来提醒：
```js
//Server -> Client
{
	type: "task-timeout",
	info:{
		task_id: "**HASH**",
		passed_time: 20*1000//已经等待了多久
	}
}
```
如果恐怕这次请求的时间要超过30s，请在剩余的10s内发送延迟请求：
```js
// Client -> Server
{
	type: "task-extended-timeout",
	info:{
		task_id: "**HASH**",
		extended_timeout: 12*1000 //再拖延12秒
	}
}
```
那么在42s-10s后服务器会继续发来将要超时的提醒。

## 功能

路由层会统计数据的流入流出流量、客户端的标识等等。程序会提供一个基于Web的控制面板来了解、统计数据。