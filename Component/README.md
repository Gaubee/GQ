# 沙盒化的Component

组件的工作原理，和沙盒类似。在GQ-CORE提供的接口中，组件可以和数据库交互，组件也可以和组件交互，最终为Application提供服务。

## Why No Controller?

为什么不将控制器的概念引入到框架中？原因很简单，每一种语音都有自己原生的Class定义方式，为了不扭曲原生的写法，从而放弃让开发者强行使用GQ-Class的概念，尽可能保持原生架构的写法。

## What Can Component Do?

组件是一个具有生命周期的控件。就像一个看不到的DOM节点。使用者可以操作这个组件的计算属性以及方法（注意：这些方法都是异步的），组件的生命周期由使用者管理，尽管销毁函数是由组件内部自己实现，但是除非到某一边的client断开使得QG像注销Router一样把所有连接组件的任务断开。否则必须让组件使用者自行结束其使用周期。

组件所访问的数据库，有两种，一种是**所属者Application**的数据库。还有一种拓展，是**调用者Application**的数据库。
意味着，如果组件只为当前应用服务，那么这二者指向的是同一个人。而如果是开放组件，那么就有区别了，开放组件，更多的是使用调用者数据库。

## 1. 注册组件

* 协议:
```js
// Client -> Server
{
	type: "component-register",
	info: {
		doc: { // 这个路由的描述
			des: "**描述description**",
			init_protos: [{ // 初始化组件所需要的参数
				type: "String",
				name: "proto_1",
				des: "属性1",
			}, {
				type: "Number",
				name: "proto_2",
				des: "属性2",
				can_null: true,
			}],
			methods: [{
				name: "method_name_1",
				des: "zz",
				params: [{
					type: "String",
					name: "method_param_1",
					des: "参数1"
				}]
			}]
		},
		name: "**Component Name**",
	}
}
// Server -> Client
{
	type: "success",
	from: "component-register",
	info: router_component_data
}
```
> 关于同名问题。在一个Application中，同名的组件并不会当作重载来对待，而是作为用来作为负载均衡的目的，或者说可以用来做A/B测试。
不论如何，在一个Application开发中，开发者之间应该自己协同好这些组件的命名。

## 2. 组件初始化

* 协议:
```js
// Client1 -> Server -> Client2
{
	type: "init-component",
	info: {
		task_id: "**HASH**",
		app_name: "**Application Name**",
		com_name: "**Component Name**",
		protos: {
			proto_1: "str",
			proto_2: 10
		}
	}
}
// Client2 -> Server -> Client1
{
	type: "success",
	from: "init-component"
	info: {
		task_id: "**HASH**",
		protos: { /**Component Prototypes**/ }
	}
}
```

> 注意：DOC对象与实际返回的接口是互不相干的两部分，DOC可以自动生成也可以滞空，实现不同语言版本`GQ-core`的开发者需要自己去规范接口。
这种带生命周期的组件并不是要将一种语言的类对象完全兼容，而仅仅是提供一种和其它应用进行交互的一种方案。
比如在nodejs版本的`GQ-core`中，尽管是提供了`class`，`Function`，`Object`三种对象的组件化方案，但是也无法面面俱到。

> 关于task_id的唯一性：要注意的是，Client1发送的`task_id`和Client2接收的`task_id`并不是一样的。
`task_id`是相对于Client1唯一的id。
Server层面上是手动生成一个`safe_task_id`来替代`task_id`，
确保`task_id`在Client2上的安全性以及独立性，
在Client2返回后再将`safe_task_id`替换成Client1认识的`task_id`。
总之，Server就是在中间协调，确保二者数据交互的安全性。
二者只需要对Server负责，也只有Server知道是到底谁在调用谁。

## 3. 指令化的组件

GQ对于组件的运行，没有做任何限制，所以只要开发者愿意，是可以在此基础上实现各种模式的交流。
注意，GQ在这里面是不做任何数据处理的，只负责数据转发。
但为了减少不同语言使用者的协调代价，所以我们做了一定程序的限制：遵循**指令化**。

在这种协定下，使用者发送指令以及指令对应的数据。程序接受到指令后做出处理，返回数据，就像运行一个函数并返回值一样简单。

* 协议
```js
// Client1 -> Server -> Client2
{
	type: "order-component",
	info: {
		task_id: "**HASH**",
		order_id: "**HASH**",
		order: "string",
		data: { /**/ }
	}
}
// Client2 -> Server -> Client1
{
	type: "success",
	from: "order-component",
	info:{
		task_id: "**HASH**",
		order_id: "**HASH**",
		returns:{/**/}
	}
}
```

这里要理解为什么要在task_id的基础上增设order_id：这是为了满足并发执行多个指令的情况。尽管开发者可以设定一种指令来处理并发，但是在框架层面协定解决这种问题是必要的。

## 4. 销毁组件

组件的注册和路由的注册的原理一样，所以组件的销毁，对应的就是路由请求实例的`abort`，使用者可以手动中断来释放内存，也可以长时间驻留直到应用程序和框架的连接断开，框架就会自动断开应用所挂接的所有组件连接。

* 协议
```js
// Client1 -> Server -> Client2
{
	type: "abort-component",
	info:{
		task_id: "**HASH**",
	}
}
```

> 关于销毁组件，这是开发者自己要实现的指令了。生死平衡才能长青，开发者在常规情况下务必要考虑这点。
尽管在框架层面实现了所谓的“销毁”，但那仅仅局限于销毁连接实例。
而应用程序的对内存的管理，依旧需要开发者自己来处理。
