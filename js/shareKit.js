var QRCode = require('qrcode');
var doc = window.document;
var SK = function(options){
    this.baseConf = this.setOptions(options);
    //this.isFromPC = this.detectFrom(location.href);
    this.initEle(this.baseConf.prefix);
    this.wechatFunc(this);
};
SK.prototype.initEle = function(prefix) {
    var self = this;
    this.wrapEle = doc.getElementsByClassName('js-'+prefix)[0];
    this.wbEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-weibo')[0];
    this.wxEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-wechat')[0];
    this.qzEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-qzone')[0];
    this.twEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-twitter')[0];

    //    bind event
    this.bind(this.qzEle, this.qzoneFunc);
    this.bind(this.twEle, this.twitterFunc);

    //    init weibo script
    var wbScript = doc.createElement('script');
    wbScript.src = 'http://tjs.sjs.sinajs.cn/open/api/js/wb.js';
    wbScript.charset = 'utf-8';
    doc.body.appendChild(wbScript);
    wbScript.onload = function(){
        self.weiboFunc(self);
    };
};

SK.prototype.bind = function(element, handler){
    var self = this;
    element.onclick  = function(e){
        e.preventDefault();
        handler(self);
    };
};

SK.prototype.openWin = function(options){
    // url cannot be empty
    if(options.url == null) {
        console.error('The url to open have to be passed in.');
        return;
    }
    var temp = {};
    var title = options.title || 'shareKit\'s window';
    var url = options.url;
    var windowConf='';
    for(var key in options) {
        temp[key] = options[key];
    }
    delete temp.title;
    delete temp.url;
    if(temp.via != null) {
        delete temp.via;
    }
    if(temp.text != null) {
        delete temp.text;
    }
    if(temp.countUrl != null){
        delete temp.countUrl;
    }
    for(key in temp) {
        windowConf += (key+'='+temp[key]+',');
    }
    windowConf = windowConf.slice(0,-1);
    window.open(url, title, windowConf);
};

// qzone share handler
SK.prototype.qzoneFunc = function(self){
    var conf = self.getOption();
    var p = {
        url: conf.link,
        showcount:'1',/*是否显示分享总数,显示：'1'，不显示：'0' */
        desc: '',/*默认分享理由(可选)*/
        summary: conf.desc,/*分享摘要(可选)*/
        title: conf.title,/*分享标题(可选)*/
        site:'',/*分享来源 如：腾讯网(可选)*/
        pics:'', /*分享图片的路径(可选)*/
        style:'203',
        width:98,
        height:22
    };
    var link;
    link = self.urlConcat(p, 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey');
    self.openWin({
        url: link,
        title: 'Sharing to Qzone',
        toolbar: 'no',
        resizable: 'no',
        status: 'no',
        menubar: 'no',
        scrollbars: 'no',
        height: 650,
        width: 600,
        left: 200,
        top: 50
    });
};

//    weibo share handler
SK.prototype.weiboFunc = function(self){
    var conf = self.getOption();
    var defaultText = conf.title+'--'+conf.desc+': '+conf.link;
    //    init weibo element's id
    self.wbEle.id = 'wb_publish';
    WB2.anyWhere(function(W){
        W.widget.publish({
            action:'publish',
            type:'web',
            refer:'y',
            language:'zh_cn',
            button_type:'red',
            button_size:'middle',
            id: 'wb_publish',
            appkey: conf.wbOption.appkey || '',
            uid: conf.wbOption.appkey || '',
            //appkey:'3125265748',
            //uid: '1624118717',
            default_text: defaultText
        });
    });
};

//    twitter share handler
SK.prototype.twitterFunc = function(self){
    var conf = self.getOption();
    var shareUrl = 'https://twitter.com/share';
    var shareObj = {
        url: conf.link,
        text: conf.title +' - '+conf.desc,
        countUrl: conf.link,
        via: conf.twitterName || ''
    };
    shareUrl = self.urlConcat(shareObj, shareUrl);
    conf.title = 'Sharing to Twitter';
    self.openWin({
        url: shareUrl,
        title: conf.title,
        toolbar: 'no',
        resizable: 'no',
        menubar: 'no',
        scrollbars: 'no',
        height: 650,
        width: 600,
        left: 200,
        top: 50
    });
};

//    wechat share Handler
SK.prototype.wechatFunc = function(self){
    var conf = self.baseConf;
    var wxObj = null;
    var qrcodeEle = null;

    if(typeof self.wxEle.qrcode === 'undefined') {
        self.wxEle.qrcode = qrcodeEle = doc.getElementsByClassName('js-'+self.baseConf.prefix+'-wechat-QRCode')[0];
        qrcodeEle.style.display = 'none';
        new QRCode(qrcodeEle, {
            text: conf.link,
            width: 204,
            height: 204,
            colorDark: '#000000',
            colorLight: '#ffffff'
        });

        qrcodeEle.onclick = function(){
            this.style.display = 'none';
        };
        self.wxEle.onclick = null;
        self.wxEle.onclick = function(){
            if(qrcodeEle.style.display === 'none') {
                qrcodeEle.style.display = 'block';
            }
        };
    }

    var shareReady =function(){
        wxObj = {};
        wxObj.title = conf.title;
        wxObj.link = conf.link;
        wxObj.desc = conf.desc;
        wxObj.img_url = conf.portrait;

        WeixinJSBridge.on('menu:share:appmessage', function(){
            WeixinJSBridge.invoke('sendAppMessage', wxObj,function(){});
        });
        WeixinJSBridge.on('menu:share:timeline', function(){
            WeixinJSBridge.invoke('shareTimeline', wxObj, function(){});
        });
        self.wxEle.onclick = function(){
            alert('点击右上角「分享按钮」分享给你的朋友们吧！');
        };

        qrcodeEle.parentNode.removeChild(qrcodeEle);
    };

    if(typeof WeixinJSBridge === 'undefined') {
        doc.addEventListener('WeixinJSBridgeReady', shareReady);
    } else {
        shareReady();
    }
};

//    make the base data
SK.prototype.setOptions = function (options) {
    var baseConf = {};
    if(typeof options === 'undefined') {
        options = baseConf;
    }
    if(typeof options.title === 'undefined') {
        baseConf.title = doc.title;
    } else {
        baseConf.title = options.title;
    }
    if(typeof options.link === 'undefined') {
        baseConf.link = location.href;
    } else {
        baseConf.link = options.link;
    }
    if(typeof options.desc === 'undefined') {
        baseConf.desc = this.findDesc();
    } else {
        baseConf.desc = options.desc;
    }
    if(typeof options.twitterName === 'string') {
        baseConf.twitterName = options.twitterName;
    }
    if(typeof options.prefix === 'undefined') {
        baseConf.prefix = 'shareKit';
    } else {
        baseConf.prefix = options.prefix;
    }
    if(typeof options.portrait === 'undefined') {
        baseConf.portrait = 'http://usualimages.qiniudn.com/1.jpeg';
    } else {
        baseConf.portrait = options.portrait;
    }
    if(typeof options.wbOption === 'object') {
        baseConf.wbOption = {
            uid: options.wbOption.uid,
            appkey: options.wbOption.appkey
        }
    } else {
        baseConf.wbOption = {
            uid: '',
            appkey: ''
        }
    }
    return baseConf;
};

// return a copy of option object
SK.prototype.getOption = function(){
    var re = {};
    for(var key in this.baseConf) {
        re[key] = this.baseConf[key];
    }
    return re;
};

SK.prototype.findDesc = function(){
    var metas = doc.getElementsByTagName('meta');
    var meta;
    for(var i=0; i< metas.length; i++) {
        meta = metas[i];
        if(meta.getAttribute('name') === 'description') {
            return meta.getAttribute('content');
        }
    }
}

//    concat url and query data
SK.prototype.urlConcat = function(o, url){
    var s = [];
    for(var i in o){
        s.push(i + '=' + encodeURIComponent(o[i]||''));
    }
    return url + '?' + s.join('&');
};

// exports
module.exports = SK;