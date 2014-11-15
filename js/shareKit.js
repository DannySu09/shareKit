;(function(){
    var QRCode = require('qrcode');
    var SK = function(options){
        this.baseConf = this.setOptions(options);
        this.device = this.detectDevice(navigator.userAgent);
        this.initEle(this.baseConf.prefix);
        this.bind(this.qzEle, this.qzoneFunc);
        this.bind(this.twEle, this.twitterFunc);
        this.bind(this.wbEle, this.weiboFunc);
        this.bind(this.wxEle, this.wechatFunc);
    };
    SK.prototype.initEle = function(prefix) {
        this.wrapEle = document.getElementsByClassName('js-'+prefix)[0];
        this.qzEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-qzone')[0];
        this.wbEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-weibo')[0];
        this.twEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-twitter')[0];
        this.wxEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-wechat')[0];
    };

    SK.prototype.bind = function(ele, handler){
        var self = this;
        ele.onclick = function(e){
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
            if(options.hasOwnProperty(key)) {
                temp[key] = options[key];
            }
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
        link = urlConcat(p, 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey');
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
                appkey:'3125265748',
                id: 'wb_publish',
                uid: '1624118717',
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
        shareUrl = urlConcat(shareObj, shareUrl);
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
        var qrcode;
        var wcCanvas;
        var shareReady;
        var wxObj;
        if(self.device === 'phone') {
            wxObj = {};
            wxObj.title = conf.title;
            wxObj.link = conf.link;
            wxObj.desc = conf.desc;
            wxObj.img_url = conf.portrait;
            shareReady = function(){
                WeixinJSBridge.on('menu:share:appmessage', function(){
                    WeixinJSBridge.invoke('sendAppMessage', wxObj,function(){})
                });
                WeixinJSBridge.on('menu:share:timeline', function(){
                    WeixinJSBridge.invoke('shareTimeline', wxObj, function(){});
                });
            };
            if(typeof WeixinJSBridge === 'undefined') {
                document.addEventListener('WeixinJSBridgeReady', shareReady);
            } else {
                shareReady();
            }
        } else if(self.device === 'pc') {
            wcCanvas = self.wrapEle.getElementsByClassName('js-'+conf.prefix+'-wechat-QRCode')[0];
            qrcode = new QRCode.QRCodeDraw();
            qrcode.draw(wcCanvas, location.href, function(error, canvas){});
        }
    };

//    make the base data
    SK.prototype.setOptions = function (options) {
        var baseConf = {};
        if(options == null) {
            options = baseConf;
        }
        if(options.title == null) {
            baseConf.title = document.title;
        } else {
            baseConf.title = options.title;
        }
        if(options.link == null) {
            baseConf.link = location.href;
        } else {
            baseConf.link = options.link;
        }
        if(options.desc == null) {
            baseConf.desc = findDesc();
        } else {
            baseConf.desc = options.desc;
        }
        if(options.twitterName != null) {
            baseConf.twitterName = options.twitterName;
        }
        if(options.prefix == null) {
            baseConf.prefix = 'shareKit';
        } else {
            baseConf.prefix = options.prefix;
        }
        if(options.portrait == null) {
            options.portrait = 'http://usualimages.qiniudn.com/1.jpeg';
        } else {
            baseConf.portrait = options.portrait;
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

    // detect device type
    SK.prototype.detectDevice = function(ua){
        if(ua.match(/iphone|ipad|android/gi) != null) {
            return 'phone';
        } else {
            return 'pc';
        }
    };

    function findDesc(){
        var metas = document.getElementsByTagName('meta');
        var meta;
        for(var i=0; i< metas.length; i++) {
            meta = metas[i];
            if(meta.getAttribute('name') === 'description') {
                return meta.getAttribute('content');
            }
        }
    }

//    concat url and query data
    var urlConcat = function(o, url){
        var s = [];
        for(var i in o){
            s.push(i + '=' + encodeURIComponent(o[i]||''));
        }
        return url + '?' + s.join('&');
    };

    module.exports = SK;
})();