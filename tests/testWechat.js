var SK = require('../js/shareKit.js');
var expect = chai.expect;

describe('Wechat sharing test', function(){
    var wxObj = null;
    it('Should have correct options', function(){
        var sk = new SK({
            title: 'wechat test',
            link: 'https://github.com',
            desc: 'redirect you to github'
        });

        var conf = sk.baseConf;

        wxObj = {};
        wxObj.title = conf.title;
        wxObj.link = conf.link;
        wxObj.desc = conf.desc;
        wxObj.img_url = conf.portrait;

        expect(wxObj.img_url).to.equal('http://usualimages.qiniudn.com/1.jpeg');
    })
});