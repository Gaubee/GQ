# Model层

## 用法

### 1. 定义


## Redis相关的接口
> Redis-DOC [http://redis.cn/] [https://github.com/NodeRedis/node_redis]

```js
// Client -> Server
{
	type: "redis-exec",
	info: {
		task_id: "**HASH**",
		handle: "[Redis command]"
		args:[/* Redis args. */]
	}
}
// Server -> Client
{
	type: "success",
	from: "redis-return",
	info:{
		task_id: "**HASH**",
		returns: Object
	}
}
// Or
{
	type: "error",
	from: "redis-return",
	info:{
		task_id: "**HASH**",
		returns: Error
	}
}
```
