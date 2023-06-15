# DZMTtci

基于 [tt-ide-cli](https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/developer-instrument/development-assistance/ide-order-instrument) 封装的抖音小程序自动化发包脚本，常用于一份代码对应多个项目(包)的场景！

- 使用步骤

  1、`$ npm install`

  2、修改小程序存放工程存放路径

  3、`package.json` 中 `scripts` 发包命令可以按现有的添加，也可以通过脚本动态更换 `APPID、版本` 相关信息，怎么方便怎么来。

  4、执行脚本需要登录抖音开发平台账号，暂时只支持手机号登录，官方支持手机、邮箱登录，可以查看文档

  5、登录完成后，本地会记录，然后进入发包环节，配合自动化脚本批量发包
