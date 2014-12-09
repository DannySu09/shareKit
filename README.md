![travis build](https://travis-ci.org/sunaiwen/shareKit.svg?branch=master)

### 使用
##### 1. 引入模块
```js
var ShareKit = require('shareKit');
```
##### 2.创建一个实例
```js
var sk = new ShareKit(options)
```
##### `options`对象的详细内容
```js
var options = {
    link: '要分享的链接',
    title: '分享的 Title',
    desc: '分享的内容',
    twitterName: '你的 Twitter 用户名',
    wbOptions: { // 新浪微博分享配置
        appkey: '在新浪开发者中心新建一个应用，会有一个 appkey',
        uid: '你的新浪帐号的 uid'
    }
};