# 前端开发自动化构建demo
一个小demo, 自带表跨域转发，实时刷新的静态服务器，并使用gulp实现压缩，hash, cdn, 发布到服务器流程处理。

# 依赖

- gulp

- no-server

## 功能

- sass 编译

- html 压缩

- 三方库引入，打包合并

- js,css 合并

- ga 注入

- 文件hash

- cdn(qiniu或者rsync到服务器)

- 上传服务器(rsync或scp)

- 开发时文件改变浏览器实时刷新

## gulp 主要任务

- gulp init    // 初始化打包三方库及css预编译

- gulp         // 开发，启动文件监听及本地静态服务器

## 规范

- 代码要分离，css, html, js, 尽量不写行内样式

- 由于构建原因，js中的图片或者资源路径使用完全路径方式,如"../img/**/*.png" 不要使用"+"操作, 如"../img" + "/**/*.png",防止cdn规换时错过替换
