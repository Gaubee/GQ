# QG-CORE

## TODOLIST

[ ] v1.0.0 ~ v2.0.0 接口的注册与协作
  - [ ] v1.1.0 将Model与Controller分为System级别和Application两个级别，并考虑组件化（Component）的Application建设
  - [ ] v1.2.0 实现管理员对象，可接管System级别的对象
  - [ ] v1.3.0 实现管理员创建Application对象
  - [ ] v1.4.0 实现开发者对象，以及对应的审核流程。
  - [ ] v1.5.0 实现MAC-ID的校验流程，使得服务可以安全地挂载到平台上，MAC-ID可以多次使用，从而实现负载均衡。
  - [ ] v1.6.0 实现负载均衡的算法
  - [ ] v1.7.0 实现接口权重分配，从而实现本地替代线上接口、线上接口暂停使用等功能。
  - [ ] v1.8.0 实现Component
  - [ ] v1.9.0 实现Model


## 1. Application

应用单元，可由管理员创建，并添加协作的开发者。
应用根据MAC-ID来进行注册。
在应用第一次启动的时候，提交MAC-ID后，开发者需要到平台上查看MAC-ID，并手动通过校验。

## 2. Component

组件，属于Application的一部分。
QG-CORE的定位在于提供后台接口。而对于每一个Application，出于安全性考虑都有需要配置DOMAIN/URL-PATH白名单或黑名单。
如果不配置，那么这个Application就可以被任意的DOMAIN/URL-PATH所访问，成为开放组件。

## 3 Router

路由，是一个Application对外的接口。
路由之间没法像Component那样进行安全交互。毕竟是暴露到外部HTTP/TCP接口上的。所以如果是Application之间的通讯依然是要用Component的。但是如果是业务流程上的配合，Component之间缺少Router的功能。

比如验证码与登录的配合。
图形验证码的接口是`http://domain.com/vcode?session_to=login`。那么访问验证码后，验证码的正确值会写入到Session的login这个key中，那么执行登录的时候，登录Router去Session中取login的值进行校验即可。
而这样验证码模块，依旧可以给其它模块配合使用，只要传递不同的session_to参数即可。

## 4 Model

数据库层，比如Redis、MySQL、Mongodb等。
其中Redis作为key-value这种特殊的数据库，是独立来提供接口，其中key层面都会自动加上Application-Name对应的namespace，确保程序之间的独立运作。
而想MySql、Mongodb这类的数据库，就使用waterline进行操作。因为waterline有一个好处就是接口可以和CO库进行配合。所以在封装后，开发者只需要阅读waterline的文档即可进行Model层的开发。数据库名也是自动分配。