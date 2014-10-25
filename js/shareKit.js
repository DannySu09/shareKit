;(function(doc){
    var shareKit;
    var qzone;
    var weibo;
    var twitter;
    var weixin;
    var init = function(){
        shareKit = doc.getElementsByClassName('js-shareKit')[0];
        qzone = shareKit.getElementsByClassName('js-shareKit-qzone')[0];
        weibo = shareKit.getElementsByClassName('js-shareKit-weibo')[0];
        twitter = shareKit.getElementsByClassName('js-shareKit-twitter')[0];
        weixin = shareKit.getElementsByClassName('js-shareKit-weixin')[0];
        shareKit.baseConf = makeBase();
        qzone.onclick = qzoneFunc;
    };
    // handler
    var qzoneFunc = function(e){
        e.preventDefault();
        makeQzone(shareKit.baseConf);

        function makeQzone(conf){
            var p = {
                //url: conf.link,
                url: 'http://www.baidu.com',
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
            var s = [];
            for(var i in p){
                s.push(i + '=' + encodeURIComponent(p[i]||''));
            }
            redirectLink = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?'+ s.join('&');
            //window.location.href = redirectLink;
            window.open(
                redirectLink,
                '分享到Qzone',
                'toolbar=no,resizable=no,status=no,menubar=no,scrollbars=no,height=650,width=600,left=200,top=50');
        }
    };

//    make the base data
    var makeBase = function () {
        var baseConf = {};
        baseConf.title = document.title;
        baseConf.link = location.href;
        baseConf.desc = findDesc();
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
    window.onload = init;
})(document);