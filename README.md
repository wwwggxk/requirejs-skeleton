# 前端开发自动化构建demo
一个小demo, 自带表跨域转发，实时刷新的静态服务器，并使用gulp实现压缩，hash, cdn,
发布到服务器流程处理。

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

- 上线前alpha测试(依靠no-server代理功能)
