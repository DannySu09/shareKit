var expect = chai.expect;
describe('Share Kit', function(){
    describe('Test Url Concat', function(){
        it('should return encode url', function(){
            var src = urlConcat({
                a:'a',
                b:'bb:',
                c:123,
                d:'777',
                e:'888'
            }, 'http://www.baidu.com');
            var dest = 'http://www.baidu.com?'+'a=a&b=bb&c=123&d=777&e=888';
            expect(src).to.not.equal(dest);
        });
    });

    describe('Device Detecting', function(){
        it('should device detection getting right', function(){
            var ua_1 = 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30';
            var ua_2 = 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36';
            var ua_3 = 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25';
            var re_1 = detectDevice(ua_1);
            var re_2 = detectDevice(ua_2);
            var re_3 = detectDevice(ua_3);
            expect(re_1).to.equal('phone');
            expect(re_2).to.equal('pc');
            expect(re_3).to.equal('phone');
        });
    });
    describe('SK Object', function(){
        describe('SK Configuration Test', function(){
            it('Should empty object has default options', function(){
                var sk = new SK();
                expect(sk).to.not.be.an('undefined');
                expect(sk.baseConf.title).to.equal(document.title);
                expect(sk.baseConf.link).to.equal(location.href);
                expect(sk.baseConf.desc).to.equal(findDesc());
                expect(sk.baseConf.twitterName).to.be.an('undefined');
                expect(sk.baseConf.prefix).to.equal('shareKit');
            });
            it('Should object with configuration has some options', function(){
                var o = {
                    title: 'title',
                    link: 'http://baidu.com',
                    desc: 'Today isn\' another day.',
                    twitterName: 'sunaiwen'
                    //prefix: 'yoyoyo'
                };
                var sk = new SK(o);

                expect(sk.baseConf.title).to.equal(o.title);
                expect(sk.baseConf.link).to.equal(o.link);
                expect(sk.baseConf.desc).to.equal(o.desc);
                expect(sk.baseConf.twitterName).to.equal(o.twitterName);
            });
        });
        describe('SK Function Test', function(){
            var sk = new SK();
            it('Should have element and correct prefix', function(){
                expect(sk.wrapEle.className.indexOf('js-'+sk.baseConf.prefix)).to.not.equal(-1);
                expect(sk.qzEle.className.indexOf('js-'+sk.baseConf.prefix+'-qzone')).to.not.equal(-1);
            });
            it('Should bind a event correctly', function(done){
                var r = false;
                var handler = function(){
                    r = 'fire';
                    expect(r).to.equal('fire');
                    done();
                };
                sk.bind(sk.qzEle, handler);
                var evt = document.createEvent('MouseEvent');
                evt.initEvent('click', true, true);
                sk.qzEle.dispatchEvent(evt, true);
            });
            it('Should open a new window with correct props', function(){
                var sk = new SK();
                var conf = sk.openWin({
                    url: 'http://www.baidu.com',
                    toolbar: 'no',
                    scrollbars: 'no',
                    height: 650,
                    top: 50,
                    stub: 1
                });
                expect(conf).to.equal('toolbar=no,scrollbars=no,height=650,top=50,stub=1');
            });
        });
        describe('SK Constructor', function(){
            it('Should the bind function be invoked 4 times', function(){
                var spy = sinon.spy(SK.prototype, 'bind');
                var sk = new SK();
                expect(spy.callCount).to.equal(4);
            });
        });
        describe('SK elements\' event binding', function(){
            it('Should handler be fired', function(){
                var evt = document.createEvent('MouseEvent');
                var st = sinon.stub(SK.prototype, 'qzoneFunc');
                var sk = new SK();
                evt.initEvent('click', true, true);
                var re = sk.qzEle.dispatchEvent(evt,true);
                expect(st.callCount).to.equal(1);
                st.restore();
            });
        });
    });
});