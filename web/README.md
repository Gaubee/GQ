## SPA路由

由于是**模拟静态文件夹路由模式的单页应用**，所以对于路由的规则如下：

index.html是访问的默认返回文件
@door.html文件是路由入口文件，是路由的基础

### 例子1

比如说，访问`http://domain.com`这个网址的路由流程如下：

1. 查找`/index.html`
2. 当然肯定找不到，因为我们把所有的页面文件放到`/app-pages/html`这个目录下了（PS：也可以强行写一个`index.html`来打破原有的SPA路由规则）
3. 因为找不到`/index.html`，文件服务器怀疑是要走SPA路由规则，那么路由会将`/app-pages/html/@door.html`这个文件的内容返回（找不到也是走404路由）。
4. 页面得到`/app-pages/html/@door.html`的文件内容，然后前端方面，JS通过浏览器`localtion`信息去下载`/app-pages/html/index.html`这个文件内容，并渲染到指定节点上（指定哪一个节点就是`@door.html`要做的事情）

### 例子2

来个复杂点的例子，访问`http://domain.com/admin/users/list.html`：
>和上面那个例子重复的部分就不详细说了

1. 找不到`/admin/users/list.html`，返回`/app-pages/html/@door.html`（SPA路由始终返回这个文件）。
2. 前端`@door.html`内的JS根据`localtion`，下载了`/app-pages/html/admin/@door.html`文件，让其接手管理路由，并渲染到指定节点。
3. `admin/@door.html`内部的JS接受路由触发后，下载`/app-pages/html/admin/users/@door.html`，让其接手管理路由，并渲染到指定节点。
4. `admin/users/@door.html`内部的JS接受路由触发后，下载`/app-pages/html/admin/users/list.html`文件并渲染到指定节点

### 总结

所以从以上例子可以看出来，这个SPA路由的规则就是根据文件夹的层级来一层层渲染。整个页面最后反应的内容也是和文件夹一样嵌套的，如图：
![image](https://cloud.githubusercontent.com/assets/2151644/14232919/6ed88f7a-f9eb-11e5-8dfb-647e06c91201.png)

值得注意的是，这里的路由都是前端的第一个`@door.html`来决定的，所以只要开发者需要，可以灵活运用提供的JS-API来进行自定义的更为灵活的路由。这里只是提供了一些简单的接口来处理这些规则。

### 补充

默认情况下`/app-pages/html/*.html`文件的下载时，会顺便调用`/app-pages/js/*.js`文件。如果没有这个JS文件不会造成影响，依旧会渲染html，如果开发者有一些和页面上需要的数据或者处理，可以写在这个js文件中。
`@door`文件除外


### 附件：
通用[@door.html](./lib/@door.md)文件写法