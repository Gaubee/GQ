# Application

一个TCP连接只能对应一个Application。
Application由创建者用户管理，可由多个开发者共同开发。

Application默认的路由映射是`127.0.0.1/<app-name>/~`，如果绑定了域名，则会将域名转发到对应的URL上。
关于域名绑定，可以设定域名白名单。
Application-Name是平台唯一不可变动

## 创建

应用的创建必须开发者到平台上手动创建。

## Router与Application的连接

应用创建者有审核路由集的权利，在连接的对话中，应用管理员审核开发者发送的MAC-ID，如果通过，那么这个MAC-ID以后都能直接连接到这个应用中而不需要审核。
```
// Client -> Server
{
	type: "app-bridge-init",
	info: {
		MAC_ID: "**MAC_ID**"
	}
}
```