;(function(doc){
    var shareKit;
    var qzone;
    var weibo;
    var twitter;
    var weixin;
    var init = function(option){
        shareKit = doc.getElementsByClassName('js-shareKit')[0];
        qzone = shareKit.getElementsByClassName('js-shareKit-qzone')[0];
        weibo = shareKit.getElementsByClassName('js-shareKit-weibo')[0];
        twitter = shareKit.getElementsByClassName('js-shareKit-twitter')[0];
        weixin = shareKit.getElementsByClassName('js-shareKit-weixin')[0];
        shareKit.baseConf = makeBase(option);
        qzone.onclick = qzoneFunc;
        weiboFunc(shareKit.baseConf);
        twitter.onclick = twitterFunc;
    };
    // qzone share handler
    var qzoneFunc = function(e){
        e.preventDefault();
        var conf = shareKit.baseConf;
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
        var redirectLink;
        redirectLink = urlConcat(p, 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey');
        window.open(
            redirectLink,
            'Sharing to Qzone',
            'toolbar=no,resizable=no,status=no,menubar=no,scrollbars=no,height=650,width=600,left=200,top=50'
        );
    };

//    weibo share handler
    var weiboFunc = function(conf){
        var defaultText = conf.title+'--'+conf.desc+': '+conf.link;
        weibo.id = 'wb_publish';
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
    var twitterFunc = function(e){
        e.preventDefault();
        var conf = shareKit.baseConf;
        var shareUrl = 'https://twitter.com/share';
        var shareObj = {
            url: conf.link,
            text: conf.title +' - '+conf.desc,
            countUrl: conf.link
        };
        if(conf.twitterName != null) {
            shareObj.via = shareObj.related = conf.twitterName;
        }
        shareUrl = urlConcat(shareObj, shareUrl);
        window.open(
            shareUrl,
            'Sharing to Twitter',
            'toolbar=no,resizable=no,status=no,menubar=no,scrollbars=no,height=650,width=600,left=200,top=50'
        );
    };

//    make the base data
    var makeBase = function (options) {
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
        return baseConf;

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
    };

    var urlConcat = function(o, url){
        var s = [];
        for(var i in o){
            s.push(i + '=' + encodeURIComponent(o[i]||''));
        }
        return url + '?' + s.join('&');
    };
    var shareKitFunc = function(options){
        window.onload = init(options);
    };
    if(window.define != null) {
        define(function(){
            return shareKitFunc;
        });
    } else {
        window.shareKit = shareKitFunc;
    }
})(document);