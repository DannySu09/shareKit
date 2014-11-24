(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/sunaiwen/projects/shareKit/js/shareKit.js":[function(require,module,exports){
;(function(){
    var QRCode = require('qrcode');
    var SK = function(options){
        this.baseConf = this.setOptions(options);
        this.isFromPC = this.detectFrom(location.href);
        this.initEle(this.baseConf.prefix);
        this.bind(this.qzEle, this.qzoneFunc);
        this.bind(this.twEle, this.twitterFunc);
        this.wechatFunc(this);
    };
    SK.prototype.initEle = function(prefix) {
        var self = this;
        this.wrapEle = document.getElementsByClassName('js-'+prefix)[0];
        this.qzEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-qzone')[0];
        this.wbEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-weibo')[0];
        this.twEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-twitter')[0];
        this.wxEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-wechat')[0];

    //    init weibo script
        var wbScript = document.createElement('script');
        wbScript.src = 'http://tjs.sjs.sinajs.cn/open/api/js/wb.js';
        wbScript.charset = 'utf-8';
        document.body.appendChild(wbScript);
        wbScript.onload = function(){
            self.weiboFunc(self);
        };
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
        var shareReady;
        var wxObj;
        var qrcodeEle;
        var qStr;
        if(self.isFromPC === true) {
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
        } else if(self.isFromPC === false) {
            qStr = location.href;
            if(qStr.indexOf('?') > -1) {
                qStr += '&frompc=true';
            } else {
                qStr += '?frompc=true';
            }
            if(self.wxEle.qrcode == null) {
                self.wxEle.qrcode = qrcodeEle = document.getElementsByClassName('js-'+self.baseConf.prefix+'-wechat-QRCode')[0];
                qrcodeEle.style.display = 'none';
                self.wxEle.qrcode = new QRCode(qrcodeEle, {
                    text: qStr,
                    width: 204,
                    height: 204,
                    colorDark: '#000000',
                    colorLight: '#ffffff'
                });

                qrcodeEle.onclick = function(){
                    this.style.display = 'none';
                };
                self.wxEle.onclick = null;
                self.wxEle.addEventListener('click', function(){
                    if(qrcodeEle.style.display === 'none') {
                        qrcodeEle.style.display = 'block';
                    }
                });
            }
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
            baseConf.desc = this.findDesc();
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
    SK.prototype.detectFrom = function(url){
        var anchor = document.createElement('a');
        anchor.href = url;
        var qStr = anchor.search.slice(1);
        var qArr = null;
        if(qStr.indexOf('frompc') > -1) {
            qArr = qStr.split('&');
            for(var i = 0, len = qArr.length; i < len; i++){
                if(qArr[i].indexOf('frompc') > -1) {
                    return qArr[i].split('=')[1] === 'true';
                }
            }
        } else {
            return false;
        }

    };

    SK.prototype.findDesc = function(){
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
    SK.prototype.urlConcat = function(o, url){
        var s = [];
        for(var i in o){
            s.push(i + '=' + encodeURIComponent(o[i]||''));
        }
        return url + '?' + s.join('&');
    };

//    for test
    module.exports = SK;
})();
},{"qrcode":"/Users/sunaiwen/projects/shareKit/modules/qrcodejs/qrcode.js"}],"/Users/sunaiwen/projects/shareKit/modules/qrcodejs/qrcode.js":[function(require,module,exports){
(function (global){
;__browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
/**
 * @fileoverview
 * - Using the 'QRCode for Javascript library'
 * - Fixed dataset of 'QRCode for Javascript library' for support full-spec.
 * - this library has no dependencies.
 * 
 * @author davidshimjs
 * @see <a href="http://www.d-project.com/" target="_blank">http://www.d-project.com/</a>
 * @see <a href="http://jeromeetienne.github.com/jquery-qrcode/" target="_blank">http://jeromeetienne.github.com/jquery-qrcode/</a>
 */
var QRCode;

(function () {
	//---------------------------------------------------------------------
	// QRCode for JavaScript
	//
	// Copyright (c) 2009 Kazuhiko Arase
	//
	// URL: http://www.d-project.com/
	//
	// Licensed under the MIT license:
	//   http://www.opensource.org/licenses/mit-license.php
	//
	// The word "QR Code" is registered trademark of 
	// DENSO WAVE INCORPORATED
	//   http://www.denso-wave.com/qrcode/faqpatent-e.html
	//
	//---------------------------------------------------------------------
	function QR8bitByte(data) {
		this.mode = QRMode.MODE_8BIT_BYTE;
		this.data = data;
		this.parsedData = [];

		// Added to support UTF-8 Characters
		for (var i = 0, l = this.data.length; i < l; i++) {
			var byteArray = [];
			var code = this.data.charCodeAt(i);

			if (code > 0x10000) {
				byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
				byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
				byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
				byteArray[3] = 0x80 | (code & 0x3F);
			} else if (code > 0x800) {
				byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
				byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
				byteArray[2] = 0x80 | (code & 0x3F);
			} else if (code > 0x80) {
				byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
				byteArray[1] = 0x80 | (code & 0x3F);
			} else {
				byteArray[0] = code;
			}

			this.parsedData.push(byteArray);
		}

		this.parsedData = Array.prototype.concat.apply([], this.parsedData);

		if (this.parsedData.length != this.data.length) {
			this.parsedData.unshift(191);
			this.parsedData.unshift(187);
			this.parsedData.unshift(239);
		}
	}

	QR8bitByte.prototype = {
		getLength: function (buffer) {
			return this.parsedData.length;
		},
		write: function (buffer) {
			for (var i = 0, l = this.parsedData.length; i < l; i++) {
				buffer.put(this.parsedData[i], 8);
			}
		}
	};

	function QRCodeModel(typeNumber, errorCorrectLevel) {
		this.typeNumber = typeNumber;
		this.errorCorrectLevel = errorCorrectLevel;
		this.modules = null;
		this.moduleCount = 0;
		this.dataCache = null;
		this.dataList = [];
	}

	QRCodeModel.prototype={addData:function(data){var newData=new QR8bitByte(data);this.dataList.push(newData);this.dataCache=null;},isDark:function(row,col){if(row<0||this.moduleCount<=row||col<0||this.moduleCount<=col){throw new Error(row+","+col);}
	return this.modules[row][col];},getModuleCount:function(){return this.moduleCount;},make:function(){this.makeImpl(false,this.getBestMaskPattern());},makeImpl:function(test,maskPattern){this.moduleCount=this.typeNumber*4+17;this.modules=new Array(this.moduleCount);for(var row=0;row<this.moduleCount;row++){this.modules[row]=new Array(this.moduleCount);for(var col=0;col<this.moduleCount;col++){this.modules[row][col]=null;}}
	this.setupPositionProbePattern(0,0);this.setupPositionProbePattern(this.moduleCount-7,0);this.setupPositionProbePattern(0,this.moduleCount-7);this.setupPositionAdjustPattern();this.setupTimingPattern();this.setupTypeInfo(test,maskPattern);if(this.typeNumber>=7){this.setupTypeNumber(test);}
	if(this.dataCache==null){this.dataCache=QRCodeModel.createData(this.typeNumber,this.errorCorrectLevel,this.dataList);}
	this.mapData(this.dataCache,maskPattern);},setupPositionProbePattern:function(row,col){for(var r=-1;r<=7;r++){if(row+r<=-1||this.moduleCount<=row+r)continue;for(var c=-1;c<=7;c++){if(col+c<=-1||this.moduleCount<=col+c)continue;if((0<=r&&r<=6&&(c==0||c==6))||(0<=c&&c<=6&&(r==0||r==6))||(2<=r&&r<=4&&2<=c&&c<=4)){this.modules[row+r][col+c]=true;}else{this.modules[row+r][col+c]=false;}}}},getBestMaskPattern:function(){var minLostPoint=0;var pattern=0;for(var i=0;i<8;i++){this.makeImpl(true,i);var lostPoint=QRUtil.getLostPoint(this);if(i==0||minLostPoint>lostPoint){minLostPoint=lostPoint;pattern=i;}}
	return pattern;},createMovieClip:function(target_mc,instance_name,depth){var qr_mc=target_mc.createEmptyMovieClip(instance_name,depth);var cs=1;this.make();for(var row=0;row<this.modules.length;row++){var y=row*cs;for(var col=0;col<this.modules[row].length;col++){var x=col*cs;var dark=this.modules[row][col];if(dark){qr_mc.beginFill(0,100);qr_mc.moveTo(x,y);qr_mc.lineTo(x+cs,y);qr_mc.lineTo(x+cs,y+cs);qr_mc.lineTo(x,y+cs);qr_mc.endFill();}}}
	return qr_mc;},setupTimingPattern:function(){for(var r=8;r<this.moduleCount-8;r++){if(this.modules[r][6]!=null){continue;}
	this.modules[r][6]=(r%2==0);}
	for(var c=8;c<this.moduleCount-8;c++){if(this.modules[6][c]!=null){continue;}
	this.modules[6][c]=(c%2==0);}},setupPositionAdjustPattern:function(){var pos=QRUtil.getPatternPosition(this.typeNumber);for(var i=0;i<pos.length;i++){for(var j=0;j<pos.length;j++){var row=pos[i];var col=pos[j];if(this.modules[row][col]!=null){continue;}
	for(var r=-2;r<=2;r++){for(var c=-2;c<=2;c++){if(r==-2||r==2||c==-2||c==2||(r==0&&c==0)){this.modules[row+r][col+c]=true;}else{this.modules[row+r][col+c]=false;}}}}}},setupTypeNumber:function(test){var bits=QRUtil.getBCHTypeNumber(this.typeNumber);for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[Math.floor(i/3)][i%3+this.moduleCount-8-3]=mod;}
	for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[i%3+this.moduleCount-8-3][Math.floor(i/3)]=mod;}},setupTypeInfo:function(test,maskPattern){var data=(this.errorCorrectLevel<<3)|maskPattern;var bits=QRUtil.getBCHTypeInfo(data);for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<6){this.modules[i][8]=mod;}else if(i<8){this.modules[i+1][8]=mod;}else{this.modules[this.moduleCount-15+i][8]=mod;}}
	for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<8){this.modules[8][this.moduleCount-i-1]=mod;}else if(i<9){this.modules[8][15-i-1+1]=mod;}else{this.modules[8][15-i-1]=mod;}}
	this.modules[this.moduleCount-8][8]=(!test);},mapData:function(data,maskPattern){var inc=-1;var row=this.moduleCount-1;var bitIndex=7;var byteIndex=0;for(var col=this.moduleCount-1;col>0;col-=2){if(col==6)col--;while(true){for(var c=0;c<2;c++){if(this.modules[row][col-c]==null){var dark=false;if(byteIndex<data.length){dark=(((data[byteIndex]>>>bitIndex)&1)==1);}
	var mask=QRUtil.getMask(maskPattern,row,col-c);if(mask){dark=!dark;}
	this.modules[row][col-c]=dark;bitIndex--;if(bitIndex==-1){byteIndex++;bitIndex=7;}}}
	row+=inc;if(row<0||this.moduleCount<=row){row-=inc;inc=-inc;break;}}}}};QRCodeModel.PAD0=0xEC;QRCodeModel.PAD1=0x11;QRCodeModel.createData=function(typeNumber,errorCorrectLevel,dataList){var rsBlocks=QRRSBlock.getRSBlocks(typeNumber,errorCorrectLevel);var buffer=new QRBitBuffer();for(var i=0;i<dataList.length;i++){var data=dataList[i];buffer.put(data.mode,4);buffer.put(data.getLength(),QRUtil.getLengthInBits(data.mode,typeNumber));data.write(buffer);}
	var totalDataCount=0;for(var i=0;i<rsBlocks.length;i++){totalDataCount+=rsBlocks[i].dataCount;}
	if(buffer.getLengthInBits()>totalDataCount*8){throw new Error("code length overflow. ("
	+buffer.getLengthInBits()
	+">"
	+totalDataCount*8
	+")");}
	if(buffer.getLengthInBits()+4<=totalDataCount*8){buffer.put(0,4);}
	while(buffer.getLengthInBits()%8!=0){buffer.putBit(false);}
	while(true){if(buffer.getLengthInBits()>=totalDataCount*8){break;}
	buffer.put(QRCodeModel.PAD0,8);if(buffer.getLengthInBits()>=totalDataCount*8){break;}
	buffer.put(QRCodeModel.PAD1,8);}
	return QRCodeModel.createBytes(buffer,rsBlocks);};QRCodeModel.createBytes=function(buffer,rsBlocks){var offset=0;var maxDcCount=0;var maxEcCount=0;var dcdata=new Array(rsBlocks.length);var ecdata=new Array(rsBlocks.length);for(var r=0;r<rsBlocks.length;r++){var dcCount=rsBlocks[r].dataCount;var ecCount=rsBlocks[r].totalCount-dcCount;maxDcCount=Math.max(maxDcCount,dcCount);maxEcCount=Math.max(maxEcCount,ecCount);dcdata[r]=new Array(dcCount);for(var i=0;i<dcdata[r].length;i++){dcdata[r][i]=0xff&buffer.buffer[i+offset];}
	offset+=dcCount;var rsPoly=QRUtil.getErrorCorrectPolynomial(ecCount);var rawPoly=new QRPolynomial(dcdata[r],rsPoly.getLength()-1);var modPoly=rawPoly.mod(rsPoly);ecdata[r]=new Array(rsPoly.getLength()-1);for(var i=0;i<ecdata[r].length;i++){var modIndex=i+modPoly.getLength()-ecdata[r].length;ecdata[r][i]=(modIndex>=0)?modPoly.get(modIndex):0;}}
	var totalCodeCount=0;for(var i=0;i<rsBlocks.length;i++){totalCodeCount+=rsBlocks[i].totalCount;}
	var data=new Array(totalCodeCount);var index=0;for(var i=0;i<maxDcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<dcdata[r].length){data[index++]=dcdata[r][i];}}}
	for(var i=0;i<maxEcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<ecdata[r].length){data[index++]=ecdata[r][i];}}}
	return data;};var QRMode={MODE_NUMBER:1<<0,MODE_ALPHA_NUM:1<<1,MODE_8BIT_BYTE:1<<2,MODE_KANJI:1<<3};var QRErrorCorrectLevel={L:1,M:0,Q:3,H:2};var QRMaskPattern={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var QRUtil={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:(1<<10)|(1<<8)|(1<<5)|(1<<4)|(1<<2)|(1<<1)|(1<<0),G18:(1<<12)|(1<<11)|(1<<10)|(1<<9)|(1<<8)|(1<<5)|(1<<2)|(1<<0),G15_MASK:(1<<14)|(1<<12)|(1<<10)|(1<<4)|(1<<1),getBCHTypeInfo:function(data){var d=data<<10;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)>=0){d^=(QRUtil.G15<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)));}
	return((data<<10)|d)^QRUtil.G15_MASK;},getBCHTypeNumber:function(data){var d=data<<12;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)>=0){d^=(QRUtil.G18<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)));}
	return(data<<12)|d;},getBCHDigit:function(data){var digit=0;while(data!=0){digit++;data>>>=1;}
	return digit;},getPatternPosition:function(typeNumber){return QRUtil.PATTERN_POSITION_TABLE[typeNumber-1];},getMask:function(maskPattern,i,j){switch(maskPattern){case QRMaskPattern.PATTERN000:return(i+j)%2==0;case QRMaskPattern.PATTERN001:return i%2==0;case QRMaskPattern.PATTERN010:return j%3==0;case QRMaskPattern.PATTERN011:return(i+j)%3==0;case QRMaskPattern.PATTERN100:return(Math.floor(i/2)+Math.floor(j/3))%2==0;case QRMaskPattern.PATTERN101:return(i*j)%2+(i*j)%3==0;case QRMaskPattern.PATTERN110:return((i*j)%2+(i*j)%3)%2==0;case QRMaskPattern.PATTERN111:return((i*j)%3+(i+j)%2)%2==0;default:throw new Error("bad maskPattern:"+maskPattern);}},getErrorCorrectPolynomial:function(errorCorrectLength){var a=new QRPolynomial([1],0);for(var i=0;i<errorCorrectLength;i++){a=a.multiply(new QRPolynomial([1,QRMath.gexp(i)],0));}
	return a;},getLengthInBits:function(mode,type){if(1<=type&&type<10){switch(mode){case QRMode.MODE_NUMBER:return 10;case QRMode.MODE_ALPHA_NUM:return 9;case QRMode.MODE_8BIT_BYTE:return 8;case QRMode.MODE_KANJI:return 8;default:throw new Error("mode:"+mode);}}else if(type<27){switch(mode){case QRMode.MODE_NUMBER:return 12;case QRMode.MODE_ALPHA_NUM:return 11;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 10;default:throw new Error("mode:"+mode);}}else if(type<41){switch(mode){case QRMode.MODE_NUMBER:return 14;case QRMode.MODE_ALPHA_NUM:return 13;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 12;default:throw new Error("mode:"+mode);}}else{throw new Error("type:"+type);}},getLostPoint:function(qrCode){var moduleCount=qrCode.getModuleCount();var lostPoint=0;for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount;col++){var sameCount=0;var dark=qrCode.isDark(row,col);for(var r=-1;r<=1;r++){if(row+r<0||moduleCount<=row+r){continue;}
	for(var c=-1;c<=1;c++){if(col+c<0||moduleCount<=col+c){continue;}
	if(r==0&&c==0){continue;}
	if(dark==qrCode.isDark(row+r,col+c)){sameCount++;}}}
	if(sameCount>5){lostPoint+=(3+sameCount-5);}}}
	for(var row=0;row<moduleCount-1;row++){for(var col=0;col<moduleCount-1;col++){var count=0;if(qrCode.isDark(row,col))count++;if(qrCode.isDark(row+1,col))count++;if(qrCode.isDark(row,col+1))count++;if(qrCode.isDark(row+1,col+1))count++;if(count==0||count==4){lostPoint+=3;}}}
	for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount-6;col++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row,col+1)&&qrCode.isDark(row,col+2)&&qrCode.isDark(row,col+3)&&qrCode.isDark(row,col+4)&&!qrCode.isDark(row,col+5)&&qrCode.isDark(row,col+6)){lostPoint+=40;}}}
	for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount-6;row++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row+1,col)&&qrCode.isDark(row+2,col)&&qrCode.isDark(row+3,col)&&qrCode.isDark(row+4,col)&&!qrCode.isDark(row+5,col)&&qrCode.isDark(row+6,col)){lostPoint+=40;}}}
	var darkCount=0;for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount;row++){if(qrCode.isDark(row,col)){darkCount++;}}}
	var ratio=Math.abs(100*darkCount/moduleCount/moduleCount-50)/5;lostPoint+=ratio*10;return lostPoint;}};var QRMath={glog:function(n){if(n<1){throw new Error("glog("+n+")");}
	return QRMath.LOG_TABLE[n];},gexp:function(n){while(n<0){n+=255;}
	while(n>=256){n-=255;}
	return QRMath.EXP_TABLE[n];},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)};for(var i=0;i<8;i++){QRMath.EXP_TABLE[i]=1<<i;}
	for(var i=8;i<256;i++){QRMath.EXP_TABLE[i]=QRMath.EXP_TABLE[i-4]^QRMath.EXP_TABLE[i-5]^QRMath.EXP_TABLE[i-6]^QRMath.EXP_TABLE[i-8];}
	for(var i=0;i<255;i++){QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]]=i;}
	function QRPolynomial(num,shift){if(num.length==undefined){throw new Error(num.length+"/"+shift);}
	var offset=0;while(offset<num.length&&num[offset]==0){offset++;}
	this.num=new Array(num.length-offset+shift);for(var i=0;i<num.length-offset;i++){this.num[i]=num[i+offset];}}
	QRPolynomial.prototype={get:function(index){return this.num[index];},getLength:function(){return this.num.length;},multiply:function(e){var num=new Array(this.getLength()+e.getLength()-1);for(var i=0;i<this.getLength();i++){for(var j=0;j<e.getLength();j++){num[i+j]^=QRMath.gexp(QRMath.glog(this.get(i))+QRMath.glog(e.get(j)));}}
	return new QRPolynomial(num,0);},mod:function(e){if(this.getLength()-e.getLength()<0){return this;}
	var ratio=QRMath.glog(this.get(0))-QRMath.glog(e.get(0));var num=new Array(this.getLength());for(var i=0;i<this.getLength();i++){num[i]=this.get(i);}
	for(var i=0;i<e.getLength();i++){num[i]^=QRMath.gexp(QRMath.glog(e.get(i))+ratio);}
	return new QRPolynomial(num,0).mod(e);}};function QRRSBlock(totalCount,dataCount){this.totalCount=totalCount;this.dataCount=dataCount;}
	QRRSBlock.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]];QRRSBlock.getRSBlocks=function(typeNumber,errorCorrectLevel){var rsBlock=QRRSBlock.getRsBlockTable(typeNumber,errorCorrectLevel);if(rsBlock==undefined){throw new Error("bad rs block @ typeNumber:"+typeNumber+"/errorCorrectLevel:"+errorCorrectLevel);}
	var length=rsBlock.length/3;var list=[];for(var i=0;i<length;i++){var count=rsBlock[i*3+0];var totalCount=rsBlock[i*3+1];var dataCount=rsBlock[i*3+2];for(var j=0;j<count;j++){list.push(new QRRSBlock(totalCount,dataCount));}}
	return list;};QRRSBlock.getRsBlockTable=function(typeNumber,errorCorrectLevel){switch(errorCorrectLevel){case QRErrorCorrectLevel.L:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+0];case QRErrorCorrectLevel.M:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+1];case QRErrorCorrectLevel.Q:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+2];case QRErrorCorrectLevel.H:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+3];default:return undefined;}};function QRBitBuffer(){this.buffer=[];this.length=0;}
	QRBitBuffer.prototype={get:function(index){var bufIndex=Math.floor(index/8);return((this.buffer[bufIndex]>>>(7-index%8))&1)==1;},put:function(num,length){for(var i=0;i<length;i++){this.putBit(((num>>>(length-i-1))&1)==1);}},getLengthInBits:function(){return this.length;},putBit:function(bit){var bufIndex=Math.floor(this.length/8);if(this.buffer.length<=bufIndex){this.buffer.push(0);}
	if(bit){this.buffer[bufIndex]|=(0x80>>>(this.length%8));}
	this.length++;}};var QRCodeLimitLength=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]];
	
	function _isSupportCanvas() {
		return typeof CanvasRenderingContext2D != "undefined";
	}
	
	// android 2.x doesn't support Data-URI spec
	function _getAndroid() {
		var android = false;
		var sAgent = navigator.userAgent;
		
		if (/android/i.test(sAgent)) { // android
			android = true;
			var aMat = sAgent.toString().match(/android ([0-9]\.[0-9])/i);
			
			if (aMat && aMat[1]) {
				android = parseFloat(aMat[1]);
			}
		}
		
		return android;
	}
	
	var svgDrawer = (function() {

		var Drawing = function (el, htOption) {
			this._el = el;
			this._htOption = htOption;
		};

		Drawing.prototype.draw = function (oQRCode) {
			var _htOption = this._htOption;
			var _el = this._el;
			var nCount = oQRCode.getModuleCount();
			var nWidth = Math.floor(_htOption.width / nCount);
			var nHeight = Math.floor(_htOption.height / nCount);

			this.clear();

			function makeSVG(tag, attrs) {
				var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
				for (var k in attrs)
					if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
				return el;
			}

			var svg = makeSVG("svg" , {'viewBox': '0 0 ' + String(nCount) + " " + String(nCount), 'width': '100%', 'height': '100%', 'fill': _htOption.colorLight});
			svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
			_el.appendChild(svg);

			svg.appendChild(makeSVG("rect", {"fill": _htOption.colorLight, "width": "100%", "height": "100%"}));
			svg.appendChild(makeSVG("rect", {"fill": _htOption.colorDark, "width": "1", "height": "1", "id": "template"}));

			for (var row = 0; row < nCount; row++) {
				for (var col = 0; col < nCount; col++) {
					if (oQRCode.isDark(row, col)) {
						var child = makeSVG("use", {"x": String(row), "y": String(col)});
						child.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#template")
						svg.appendChild(child);
					}
				}
			}
		};
		Drawing.prototype.clear = function () {
			while (this._el.hasChildNodes())
				this._el.removeChild(this._el.lastChild);
		};
		return Drawing;
	})();

	var useSVG = document.documentElement.tagName.toLowerCase() === "svg";

	// Drawing in DOM by using Table tag
	var Drawing = useSVG ? svgDrawer : !_isSupportCanvas() ? (function () {
		var Drawing = function (el, htOption) {
			this._el = el;
			this._htOption = htOption;
		};
			
		/**
		 * Draw the QRCode
		 * 
		 * @param {QRCode} oQRCode
		 */
		Drawing.prototype.draw = function (oQRCode) {
            var _htOption = this._htOption;
            var _el = this._el;
			var nCount = oQRCode.getModuleCount();
			var nWidth = Math.floor(_htOption.width / nCount);
			var nHeight = Math.floor(_htOption.height / nCount);
			var aHTML = ['<table style="border:0;border-collapse:collapse;">'];
			
			for (var row = 0; row < nCount; row++) {
				aHTML.push('<tr>');
				
				for (var col = 0; col < nCount; col++) {
					aHTML.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + nWidth + 'px;height:' + nHeight + 'px;background-color:' + (oQRCode.isDark(row, col) ? _htOption.colorDark : _htOption.colorLight) + ';"></td>');
				}
				
				aHTML.push('</tr>');
			}
			
			aHTML.push('</table>');
			_el.innerHTML = aHTML.join('');
			
			// Fix the margin values as real size.
			var elTable = _el.childNodes[0];
			var nLeftMarginTable = (_htOption.width - elTable.offsetWidth) / 2;
			var nTopMarginTable = (_htOption.height - elTable.offsetHeight) / 2;
			
			if (nLeftMarginTable > 0 && nTopMarginTable > 0) {
				elTable.style.margin = nTopMarginTable + "px " + nLeftMarginTable + "px";	
			}
		};
		
		/**
		 * Clear the QRCode
		 */
		Drawing.prototype.clear = function () {
			this._el.innerHTML = '';
		};
		
		return Drawing;
	})() : (function () { // Drawing in Canvas
		function _onMakeImage() {
			this._elImage.src = this._elCanvas.toDataURL("image/png");
			this._elImage.style.display = "block";
			this._elCanvas.style.display = "none";			
		}
		
		// Android 2.1 bug workaround
		// http://code.google.com/p/android/issues/detail?id=5141
		if (this._android && this._android <= 2.1) {
	    	var factor = 1 / window.devicePixelRatio;
	        var drawImage = CanvasRenderingContext2D.prototype.drawImage; 
	    	CanvasRenderingContext2D.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
	    		if (("nodeName" in image) && /img/i.test(image.nodeName)) {
		        	for (var i = arguments.length - 1; i >= 1; i--) {
		            	arguments[i] = arguments[i] * factor;
		        	}
	    		} else if (typeof dw == "undefined") {
	    			arguments[1] *= factor;
	    			arguments[2] *= factor;
	    			arguments[3] *= factor;
	    			arguments[4] *= factor;
	    		}
	    		
	        	drawImage.apply(this, arguments); 
	    	};
		}
		
		/**
		 * Check whether the user's browser supports Data URI or not
		 * 
		 * @private
		 * @param {Function} fSuccess Occurs if it supports Data URI
		 * @param {Function} fFail Occurs if it doesn't support Data URI
		 */
		function _safeSetDataURI(fSuccess, fFail) {
            var self = this;
            self._fFail = fFail;
            self._fSuccess = fSuccess;

            // Check it just once
            if (self._bSupportDataURI === null) {
                var el = document.createElement("img");
                var fOnError = function() {
                    self._bSupportDataURI = false;

                    if (self._fFail) {
                        self._fFail.call(self);
                    }
                };
                var fOnSuccess = function() {
                    self._bSupportDataURI = true;

                    if (self._fSuccess) {
                        self._fSuccess.call(self);
                    }
                };

                el.onabort = fOnError;
                el.onerror = fOnError;
                el.onload = fOnSuccess;
                el.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="; // the Image contains 1px data.
                return;
            } else if (self._bSupportDataURI === true && self._fSuccess) {
                self._fSuccess.call(self);
            } else if (self._bSupportDataURI === false && self._fFail) {
                self._fFail.call(self);
            }
		};
		
		/**
		 * Drawing QRCode by using canvas
		 * 
		 * @constructor
		 * @param {HTMLElement} el
		 * @param {Object} htOption QRCode Options 
		 */
		var Drawing = function (el, htOption) {
    		this._bIsPainted = false;
    		this._android = _getAndroid();
		
			this._htOption = htOption;
			this._elCanvas = document.createElement("canvas");
			this._elCanvas.width = htOption.width;
			this._elCanvas.height = htOption.height;
			el.appendChild(this._elCanvas);
			this._el = el;
			this._oContext = this._elCanvas.getContext("2d");
			this._bIsPainted = false;
			this._elImage = document.createElement("img");
			this._elImage.alt = "Scan me!";
			this._elImage.style.display = "none";
			this._el.appendChild(this._elImage);
			this._bSupportDataURI = null;
		};
			
		/**
		 * Draw the QRCode
		 * 
		 * @param {QRCode} oQRCode 
		 */
		Drawing.prototype.draw = function (oQRCode) {
            var _elImage = this._elImage;
            var _oContext = this._oContext;
            var _htOption = this._htOption;
            
			var nCount = oQRCode.getModuleCount();
			var nWidth = _htOption.width / nCount;
			var nHeight = _htOption.height / nCount;
			var nRoundedWidth = Math.round(nWidth);
			var nRoundedHeight = Math.round(nHeight);

			_elImage.style.display = "none";
			this.clear();
			
			for (var row = 0; row < nCount; row++) {
				for (var col = 0; col < nCount; col++) {
					var bIsDark = oQRCode.isDark(row, col);
					var nLeft = col * nWidth;
					var nTop = row * nHeight;
					_oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
					_oContext.lineWidth = 1;
					_oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;					
					_oContext.fillRect(nLeft, nTop, nWidth, nHeight);
					
					// 안티 앨리어싱 방지 처리
					_oContext.strokeRect(
						Math.floor(nLeft) + 0.5,
						Math.floor(nTop) + 0.5,
						nRoundedWidth,
						nRoundedHeight
					);
					
					_oContext.strokeRect(
						Math.ceil(nLeft) - 0.5,
						Math.ceil(nTop) - 0.5,
						nRoundedWidth,
						nRoundedHeight
					);
				}
			}
			
			this._bIsPainted = true;
		};
			
		/**
		 * Make the image from Canvas if the browser supports Data URI.
		 */
		Drawing.prototype.makeImage = function () {
			if (this._bIsPainted) {
				_safeSetDataURI.call(this, _onMakeImage);
			}
		};
			
		/**
		 * Return whether the QRCode is painted or not
		 * 
		 * @return {Boolean}
		 */
		Drawing.prototype.isPainted = function () {
			return this._bIsPainted;
		};
		
		/**
		 * Clear the QRCode
		 */
		Drawing.prototype.clear = function () {
			this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);
			this._bIsPainted = false;
		};
		
		/**
		 * @private
		 * @param {Number} nNumber
		 */
		Drawing.prototype.round = function (nNumber) {
			if (!nNumber) {
				return nNumber;
			}
			
			return Math.floor(nNumber * 1000) / 1000;
		};
		
		return Drawing;
	})();
	
	/**
	 * Get the type by string length
	 * 
	 * @private
	 * @param {String} sText
	 * @param {Number} nCorrectLevel
	 * @return {Number} type
	 */
	function _getTypeNumber(sText, nCorrectLevel) {			
		var nType = 1;
		var length = _getUTF8Length(sText);
		
		for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
			var nLimit = 0;
			
			switch (nCorrectLevel) {
				case QRErrorCorrectLevel.L :
					nLimit = QRCodeLimitLength[i][0];
					break;
				case QRErrorCorrectLevel.M :
					nLimit = QRCodeLimitLength[i][1];
					break;
				case QRErrorCorrectLevel.Q :
					nLimit = QRCodeLimitLength[i][2];
					break;
				case QRErrorCorrectLevel.H :
					nLimit = QRCodeLimitLength[i][3];
					break;
			}
			
			if (length <= nLimit) {
				break;
			} else {
				nType++;
			}
		}
		
		if (nType > QRCodeLimitLength.length) {
			throw new Error("Too long data");
		}
		
		return nType;
	}

	function _getUTF8Length(sText) {
		var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
		return replacedText.length + (replacedText.length != sText ? 3 : 0);
	}
	
	/**
	 * @class QRCode
	 * @constructor
	 * @example 
	 * new QRCode(document.getElementById("test"), "http://jindo.dev.naver.com/collie");
	 *
	 * @example
	 * var oQRCode = new QRCode("test", {
	 *    text : "http://naver.com",
	 *    width : 128,
	 *    height : 128
	 * });
	 * 
	 * oQRCode.clear(); // Clear the QRCode.
	 * oQRCode.makeCode("http://map.naver.com"); // Re-create the QRCode.
	 *
	 * @param {HTMLElement|String} el target element or 'id' attribute of element.
	 * @param {Object|String} vOption
	 * @param {String} vOption.text QRCode link data
	 * @param {Number} [vOption.width=256]
	 * @param {Number} [vOption.height=256]
	 * @param {String} [vOption.colorDark="#000000"]
	 * @param {String} [vOption.colorLight="#ffffff"]
	 * @param {QRCode.CorrectLevel} [vOption.correctLevel=QRCode.CorrectLevel.H] [L|M|Q|H] 
	 */
	QRCode = function (el, vOption) {
		this._htOption = {
			width : 256, 
			height : 256,
			typeNumber : 4,
			colorDark : "#000000",
			colorLight : "#ffffff",
			correctLevel : QRErrorCorrectLevel.H
		};
		
		if (typeof vOption === 'string') {
			vOption	= {
				text : vOption
			};
		}
		
		// Overwrites options
		if (vOption) {
			for (var i in vOption) {
				this._htOption[i] = vOption[i];
			}
		}
		
		if (typeof el == "string") {
			el = document.getElementById(el);
		}

		if (this._htOption.useSVG) {
			Drawing = svgDrawer;
		}
		
		this._android = _getAndroid();
		this._el = el;
		this._oQRCode = null;
		this._oDrawing = new Drawing(this._el, this._htOption);
		
		if (this._htOption.text) {
			this.makeCode(this._htOption.text);	
		}
	};
	
	/**
	 * Make the QRCode
	 * 
	 * @param {String} sText link data
	 */
	QRCode.prototype.makeCode = function (sText) {
		this._oQRCode = new QRCodeModel(_getTypeNumber(sText, this._htOption.correctLevel), this._htOption.correctLevel);
		this._oQRCode.addData(sText);
		this._oQRCode.make();
		this._el.title = sText;
		this._oDrawing.draw(this._oQRCode);			
		this.makeImage();
	};
	
	/**
	 * Make the Image from Canvas element
	 * - It occurs automatically
	 * - Android below 3 doesn't support Data-URI spec.
	 * 
	 * @private
	 */
	QRCode.prototype.makeImage = function () {
		if (typeof this._oDrawing.makeImage == "function" && (!this._android || this._android >= 3)) {
			this._oDrawing.makeImage();
		}
	};
	
	/**
	 * Clear the QRCode
	 */
	QRCode.prototype.clear = function () {
		this._oDrawing.clear();
	};
	
	/**
	 * @name QRCode.CorrectLevel
	 */
	QRCode.CorrectLevel = QRErrorCorrectLevel;
})();

; browserify_shim__define__module__export__(typeof QRCode != "undefined" ? QRCode : window.QRCode);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/Users/sunaiwen/projects/shareKit/tests/test.js":[function(require,module,exports){
var expect = chai.expect;
var SK = require('../js/shareKit.js');
describe('Share Kit', function(){
    describe('Test Url Concat', function(){
        it('should return encode url', function(){
            var src = SK.prototype.urlConcat({
                a:'a',
                b:'bb\/\/',
                c: '123??%',
                d: 777,
                e:'888'
            }, 'http://www.baidu.com');
            var dest = 'http://www.baidu.com?'+'a=a&b=bb\/\/&c=123??%&d=777&e=888';

            expect(src).to.not.equal(dest);
            expect(decodeURIComponent(src)).to.equal(dest);
        });
    });

    describe('resource detect', function(){
        it('should detect url has frompc query string or not ', function(){
            var url = location.href;
            var index = url.indexOf('?');
            if(index > -1) {
                url = url.slice(0, index);
            }
            var re = SK.prototype.detectFrom(url+'?frompc=true');
            expect(re).to.equal(true);

            re = SK.prototype.detectFrom(url);
            expect(re).to.equal(false);
        });
    });
    describe('SK Object', function(){
        var evt;
        beforeEach(function(){
            evt = document.createEvent('MouseEvent');
            evt.initEvent('click', true, true);
        });
        describe('SK Configuration Test', function(){
            it('Should empty object has default options', function(){
                var sk = new SK();
                expect(sk).to.not.be.an('undefined');
                expect(sk.baseConf.title).to.equal(document.title);
                expect(sk.baseConf.link).to.equal(location.href);
                expect(sk.baseConf.desc).to.equal(SK.prototype.findDesc());
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
        describe('SK init function Test', function(){
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
                sk.qzEle.dispatchEvent(evt, true);
            });
        });
        describe('SK Constructor', function(){
            it('Should the bind function be invoked 2 times', function(){
                // weibo-sharing function don't need to bind an event.
                var spy = sinon.spy(SK.prototype, 'bind');
                var sk = new SK();
                expect(spy.callCount).to.equal(2);
            });
        });
        describe('SK elements\' event binding', function(){
            it('Should handler be fired', function(){
                var st = sinon.stub(SK.prototype, 'qzoneFunc');
                var sk = new SK();
                sk.qzEle.dispatchEvent(evt,true);
                expect(st.callCount).to.equal(1);
                st.restore();
            });
        });
        describe('SK open window function test', function(){
            it('Should open window with correct url, title, and props', function(){
                SK.prototype.openWin({
                    url: 'http://www.baidu.com',
                    title: 'open baidu',
                    scrollbars: 'no',
                    menubar: 'no',
                    status: 'no',
                    height: 600,
                    width: 900,
                    left: 300,
                    top: 0
                });
            });
        });
        describe('The Qzone share function', function(){
            var args = null;
            var cache = SK.prototype.openWin;
            beforeEach(function(){
                var fakeOpenWin = function(){
                    args = arguments[0];
                };
                SK.prototype.openWin = fakeOpenWin;
            });
            it('Should qzoneFunc open a window with correct options', function(){
                var sk = new SK({
                    link: 'http://baidu.com',
                    title: 'qzone share function test',
                    twitterName: 'sunaiwen',
                    desc: 'this is a test testing qzone share function.'
                });

                sk.qzEle.dispatchEvent(evt, true);

                expect(args.menubar).to.equal('no');
                expect(args.resizable).to.equal('no');
                expect(args.status).to.equal('no');
                expect(args.toolbar).to.equal('no');
                expect(args.top).to.equal(50);
                expect(args.left).to.equal(200);
                expect(args.width).to.equal(600);
                expect(args.height).to.equal(650);
                expect(args.title).to.equal('Sharing to Qzone');
            });
            afterEach(function(){
                SK.prototype.openWin = cache;
            });
        });
        describe('The wechat share function', function(){
            it('Should conduct correct info in wechat sharing', function(){
                var cache = SK.prototype.detectDevice;
                SK.prototype.detectDevice = function(){
                    return 'phone';
                };
                var sk = new SK({
                    link: location.href,
                    title: 'wechat function',
                    desc: 'wechat function test you wether you love me.',
                    portrait: 'https://d13yacurqjgara.cloudfront.net/users/52277/screenshots/1807333/gille_dribbble_boreas_v01-01.png'
                });
                sk.wxEle.dispatchEvent(evt, true);
                SK.prototype.detectDevice = cache;
            });
            it('Should show qrcode when in pc env', function(){
                var sk = new SK({
                    link: location.href
                });
                sk.wxEle.dispatchEvent(evt, true);
            });
        });
    });
});
},{"../js/shareKit.js":"/Users/sunaiwen/projects/shareKit/js/shareKit.js"}]},{},["/Users/sunaiwen/projects/shareKit/tests/test.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9zaGFyZUtpdC5qcyIsIm1vZHVsZXMvcXJjb2RlanMvcXJjb2RlLmpzIiwidGVzdHMvdGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN21CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiOyhmdW5jdGlvbigpe1xuICAgIHZhciBRUkNvZGUgPSByZXF1aXJlKCdxcmNvZGUnKTtcbiAgICB2YXIgU0sgPSBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgICAgdGhpcy5iYXNlQ29uZiA9IHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgdGhpcy5pc0Zyb21QQyA9IHRoaXMuZGV0ZWN0RnJvbShsb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgdGhpcy5pbml0RWxlKHRoaXMuYmFzZUNvbmYucHJlZml4KTtcbiAgICAgICAgdGhpcy5iaW5kKHRoaXMucXpFbGUsIHRoaXMucXpvbmVGdW5jKTtcbiAgICAgICAgdGhpcy5iaW5kKHRoaXMudHdFbGUsIHRoaXMudHdpdHRlckZ1bmMpO1xuICAgICAgICB0aGlzLndlY2hhdEZ1bmModGhpcyk7XG4gICAgfTtcbiAgICBTSy5wcm90b3R5cGUuaW5pdEVsZSA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMud3JhcEVsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLScrcHJlZml4KVswXTtcbiAgICAgICAgdGhpcy5xekVsZSA9IHRoaXMud3JhcEVsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy0nK3ByZWZpeCsnLXF6b25lJylbMF07XG4gICAgICAgIHRoaXMud2JFbGUgPSB0aGlzLndyYXBFbGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtJytwcmVmaXgrJy13ZWlibycpWzBdO1xuICAgICAgICB0aGlzLnR3RWxlID0gdGhpcy53cmFwRWxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLScrcHJlZml4KyctdHdpdHRlcicpWzBdO1xuICAgICAgICB0aGlzLnd4RWxlID0gdGhpcy53cmFwRWxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLScrcHJlZml4Kyctd2VjaGF0JylbMF07XG5cbiAgICAvLyAgICBpbml0IHdlaWJvIHNjcmlwdFxuICAgICAgICB2YXIgd2JTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgd2JTY3JpcHQuc3JjID0gJ2h0dHA6Ly90anMuc2pzLnNpbmFqcy5jbi9vcGVuL2FwaS9qcy93Yi5qcyc7XG4gICAgICAgIHdiU2NyaXB0LmNoYXJzZXQgPSAndXRmLTgnO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHdiU2NyaXB0KTtcbiAgICAgICAgd2JTY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHNlbGYud2VpYm9GdW5jKHNlbGYpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBTSy5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKGVsZSwgaGFuZGxlcil7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgZWxlLm9uY2xpY2sgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGhhbmRsZXIoc2VsZik7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIFNLLnByb3RvdHlwZS5vcGVuV2luID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICAgIC8vIHVybCBjYW5ub3QgYmUgZW1wdHlcbiAgICAgICAgaWYob3B0aW9ucy51cmwgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignVGhlIHVybCB0byBvcGVuIGhhdmUgdG8gYmUgcGFzc2VkIGluLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0ZW1wID0ge307XG4gICAgICAgIHZhciB0aXRsZSA9IG9wdGlvbnMudGl0bGUgfHwgJ3NoYXJlS2l0XFwncyB3aW5kb3cnO1xuICAgICAgICB2YXIgdXJsID0gb3B0aW9ucy51cmw7XG4gICAgICAgIHZhciB3aW5kb3dDb25mPScnO1xuICAgICAgICBmb3IodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZihvcHRpb25zLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB0ZW1wW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIHRlbXAudGl0bGU7XG4gICAgICAgIGRlbGV0ZSB0ZW1wLnVybDtcbiAgICAgICAgaWYodGVtcC52aWEgIT0gbnVsbCkge1xuICAgICAgICAgICAgZGVsZXRlIHRlbXAudmlhO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRlbXAudGV4dCAhPSBudWxsKSB7XG4gICAgICAgICAgICBkZWxldGUgdGVtcC50ZXh0O1xuICAgICAgICB9XG4gICAgICAgIGlmKHRlbXAuY291bnRVcmwgIT0gbnVsbCl7XG4gICAgICAgICAgICBkZWxldGUgdGVtcC5jb3VudFVybDtcbiAgICAgICAgfVxuICAgICAgICBmb3Ioa2V5IGluIHRlbXApIHtcbiAgICAgICAgICAgIHdpbmRvd0NvbmYgKz0gKGtleSsnPScrdGVtcFtrZXldKycsJyk7XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93Q29uZiA9IHdpbmRvd0NvbmYuc2xpY2UoMCwtMSk7XG4gICAgICAgIHdpbmRvdy5vcGVuKHVybCwgdGl0bGUsIHdpbmRvd0NvbmYpO1xuICAgIH07XG5cbiAgICAvLyBxem9uZSBzaGFyZSBoYW5kbGVyXG4gICAgU0sucHJvdG90eXBlLnF6b25lRnVuYyA9IGZ1bmN0aW9uKHNlbGYpe1xuICAgICAgICB2YXIgY29uZiA9IHNlbGYuZ2V0T3B0aW9uKCk7XG4gICAgICAgIHZhciBwID0ge1xuICAgICAgICAgICAgdXJsOiBjb25mLmxpbmssXG4gICAgICAgICAgICBzaG93Y291bnQ6JzEnLC8q5piv5ZCm5pi+56S65YiG5Lqr5oC75pWwLOaYvuekuu+8micxJ++8jOS4jeaYvuekuu+8micwJyAqL1xuICAgICAgICAgICAgZGVzYzogJycsLyrpu5jorqTliIbkuqvnkIbnlLEo5Y+v6YCJKSovXG4gICAgICAgICAgICBzdW1tYXJ5OiBjb25mLmRlc2MsLyrliIbkuqvmkZjopoEo5Y+v6YCJKSovXG4gICAgICAgICAgICB0aXRsZTogY29uZi50aXRsZSwvKuWIhuS6q+agh+mimCjlj6/pgIkpKi9cbiAgICAgICAgICAgIHNpdGU6JycsLyrliIbkuqvmnaXmupAg5aaC77ya6IW+6K6v572RKOWPr+mAiSkqL1xuICAgICAgICAgICAgcGljczonJywgLyrliIbkuqvlm77niYfnmoTot6/lvoQo5Y+v6YCJKSovXG4gICAgICAgICAgICBzdHlsZTonMjAzJyxcbiAgICAgICAgICAgIHdpZHRoOjk4LFxuICAgICAgICAgICAgaGVpZ2h0OjIyXG4gICAgICAgIH07XG4gICAgICAgIHZhciBsaW5rO1xuICAgICAgICBsaW5rID0gc2VsZi51cmxDb25jYXQocCwgJ2h0dHA6Ly9zbnMucXpvbmUucXEuY29tL2NnaS1iaW4vcXpzaGFyZS9jZ2lfcXpzaGFyZV9vbmVrZXknKTtcbiAgICAgICAgc2VsZi5vcGVuV2luKHtcbiAgICAgICAgICAgIHVybDogbGluayxcbiAgICAgICAgICAgIHRpdGxlOiAnU2hhcmluZyB0byBRem9uZScsXG4gICAgICAgICAgICB0b29sYmFyOiAnbm8nLFxuICAgICAgICAgICAgcmVzaXphYmxlOiAnbm8nLFxuICAgICAgICAgICAgc3RhdHVzOiAnbm8nLFxuICAgICAgICAgICAgbWVudWJhcjogJ25vJyxcbiAgICAgICAgICAgIHNjcm9sbGJhcnM6ICdubycsXG4gICAgICAgICAgICBoZWlnaHQ6IDY1MCxcbiAgICAgICAgICAgIHdpZHRoOiA2MDAsXG4gICAgICAgICAgICBsZWZ0OiAyMDAsXG4gICAgICAgICAgICB0b3A6IDUwXG4gICAgICAgIH0pO1xuICAgIH07XG5cbi8vICAgIHdlaWJvIHNoYXJlIGhhbmRsZXJcbiAgICBTSy5wcm90b3R5cGUud2VpYm9GdW5jID0gZnVuY3Rpb24oc2VsZil7XG4gICAgICAgIHZhciBjb25mID0gc2VsZi5nZXRPcHRpb24oKTtcbiAgICAgICAgdmFyIGRlZmF1bHRUZXh0ID0gY29uZi50aXRsZSsnLS0nK2NvbmYuZGVzYysnOiAnK2NvbmYubGluaztcbiAgICAgICAgLy8gICAgaW5pdCB3ZWlibyBlbGVtZW50J3MgaWRcbiAgICAgICAgc2VsZi53YkVsZS5pZCA9ICd3Yl9wdWJsaXNoJztcbiAgICAgICAgV0IyLmFueVdoZXJlKGZ1bmN0aW9uKFcpe1xuICAgICAgICAgICAgVy53aWRnZXQucHVibGlzaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOidwdWJsaXNoJyxcbiAgICAgICAgICAgICAgICB0eXBlOid3ZWInLFxuICAgICAgICAgICAgICAgIHJlZmVyOid5JyxcbiAgICAgICAgICAgICAgICBsYW5ndWFnZTonemhfY24nLFxuICAgICAgICAgICAgICAgIGJ1dHRvbl90eXBlOidyZWQnLFxuICAgICAgICAgICAgICAgIGJ1dHRvbl9zaXplOidtaWRkbGUnLFxuICAgICAgICAgICAgICAgIGFwcGtleTonMzEyNTI2NTc0OCcsXG4gICAgICAgICAgICAgICAgaWQ6ICd3Yl9wdWJsaXNoJyxcbiAgICAgICAgICAgICAgICB1aWQ6ICcxNjI0MTE4NzE3JyxcbiAgICAgICAgICAgICAgICBkZWZhdWx0X3RleHQ6IGRlZmF1bHRUZXh0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuLy8gICAgdHdpdHRlciBzaGFyZSBoYW5kbGVyXG4gICAgU0sucHJvdG90eXBlLnR3aXR0ZXJGdW5jID0gZnVuY3Rpb24oc2VsZil7XG4gICAgICAgIHZhciBjb25mID0gc2VsZi5nZXRPcHRpb24oKTtcbiAgICAgICAgdmFyIHNoYXJlVXJsID0gJ2h0dHBzOi8vdHdpdHRlci5jb20vc2hhcmUnO1xuICAgICAgICB2YXIgc2hhcmVPYmogPSB7XG4gICAgICAgICAgICB1cmw6IGNvbmYubGluayxcbiAgICAgICAgICAgIHRleHQ6IGNvbmYudGl0bGUgKycgLSAnK2NvbmYuZGVzYyxcbiAgICAgICAgICAgIGNvdW50VXJsOiBjb25mLmxpbmssXG4gICAgICAgICAgICB2aWE6IGNvbmYudHdpdHRlck5hbWUgfHwgJydcbiAgICAgICAgfTtcbiAgICAgICAgc2hhcmVVcmwgPSBzZWxmLnVybENvbmNhdChzaGFyZU9iaiwgc2hhcmVVcmwpO1xuICAgICAgICBjb25mLnRpdGxlID0gJ1NoYXJpbmcgdG8gVHdpdHRlcic7XG4gICAgICAgIHNlbGYub3Blbldpbih7XG4gICAgICAgICAgICB1cmw6IHNoYXJlVXJsLFxuICAgICAgICAgICAgdGl0bGU6IGNvbmYudGl0bGUsXG4gICAgICAgICAgICB0b29sYmFyOiAnbm8nLFxuICAgICAgICAgICAgcmVzaXphYmxlOiAnbm8nLFxuICAgICAgICAgICAgbWVudWJhcjogJ25vJyxcbiAgICAgICAgICAgIHNjcm9sbGJhcnM6ICdubycsXG4gICAgICAgICAgICBoZWlnaHQ6IDY1MCxcbiAgICAgICAgICAgIHdpZHRoOiA2MDAsXG4gICAgICAgICAgICBsZWZ0OiAyMDAsXG4gICAgICAgICAgICB0b3A6IDUwXG4gICAgICAgIH0pO1xuICAgIH07XG5cbi8vICAgIHdlY2hhdCBzaGFyZSBIYW5kbGVyXG4gICAgU0sucHJvdG90eXBlLndlY2hhdEZ1bmMgPSBmdW5jdGlvbihzZWxmKXtcbiAgICAgICAgdmFyIGNvbmYgPSBzZWxmLmJhc2VDb25mO1xuICAgICAgICB2YXIgc2hhcmVSZWFkeTtcbiAgICAgICAgdmFyIHd4T2JqO1xuICAgICAgICB2YXIgcXJjb2RlRWxlO1xuICAgICAgICB2YXIgcVN0cjtcbiAgICAgICAgaWYoc2VsZi5pc0Zyb21QQyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgd3hPYmogPSB7fTtcbiAgICAgICAgICAgIHd4T2JqLnRpdGxlID0gY29uZi50aXRsZTtcbiAgICAgICAgICAgIHd4T2JqLmxpbmsgPSBjb25mLmxpbms7XG4gICAgICAgICAgICB3eE9iai5kZXNjID0gY29uZi5kZXNjO1xuICAgICAgICAgICAgd3hPYmouaW1nX3VybCA9IGNvbmYucG9ydHJhaXQ7XG4gICAgICAgICAgICBzaGFyZVJlYWR5ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBXZWl4aW5KU0JyaWRnZS5vbignbWVudTpzaGFyZTphcHBtZXNzYWdlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgV2VpeGluSlNCcmlkZ2UuaW52b2tlKCdzZW5kQXBwTWVzc2FnZScsIHd4T2JqLGZ1bmN0aW9uKCl7fSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBXZWl4aW5KU0JyaWRnZS5vbignbWVudTpzaGFyZTp0aW1lbGluZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIFdlaXhpbkpTQnJpZGdlLmludm9rZSgnc2hhcmVUaW1lbGluZScsIHd4T2JqLCBmdW5jdGlvbigpe30pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmKHR5cGVvZiBXZWl4aW5KU0JyaWRnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdXZWl4aW5KU0JyaWRnZVJlYWR5Jywgc2hhcmVSZWFkeSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNoYXJlUmVhZHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmKHNlbGYuaXNGcm9tUEMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBxU3RyID0gbG9jYXRpb24uaHJlZjtcbiAgICAgICAgICAgIGlmKHFTdHIuaW5kZXhPZignPycpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBxU3RyICs9ICcmZnJvbXBjPXRydWUnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBxU3RyICs9ICc/ZnJvbXBjPXRydWUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoc2VsZi53eEVsZS5xcmNvZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHNlbGYud3hFbGUucXJjb2RlID0gcXJjb2RlRWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtJytzZWxmLmJhc2VDb25mLnByZWZpeCsnLXdlY2hhdC1RUkNvZGUnKVswXTtcbiAgICAgICAgICAgICAgICBxcmNvZGVFbGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICBzZWxmLnd4RWxlLnFyY29kZSA9IG5ldyBRUkNvZGUocXJjb2RlRWxlLCB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IHFTdHIsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAyMDQsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogMjA0LFxuICAgICAgICAgICAgICAgICAgICBjb2xvckRhcms6ICcjMDAwMDAwJyxcbiAgICAgICAgICAgICAgICAgICAgY29sb3JMaWdodDogJyNmZmZmZmYnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBxcmNvZGVFbGUub25jbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNlbGYud3hFbGUub25jbGljayA9IG51bGw7XG4gICAgICAgICAgICAgICAgc2VsZi53eEVsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGlmKHFyY29kZUVsZS5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHFyY29kZUVsZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuLy8gICAgbWFrZSB0aGUgYmFzZSBkYXRhXG4gICAgU0sucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICB2YXIgYmFzZUNvbmYgPSB7fTtcbiAgICAgICAgaWYob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gYmFzZUNvbmY7XG4gICAgICAgIH1cbiAgICAgICAgaWYob3B0aW9ucy50aXRsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBiYXNlQ29uZi50aXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmFzZUNvbmYudGl0bGUgPSBvcHRpb25zLnRpdGxlO1xuICAgICAgICB9XG4gICAgICAgIGlmKG9wdGlvbnMubGluayA9PSBudWxsKSB7XG4gICAgICAgICAgICBiYXNlQ29uZi5saW5rID0gbG9jYXRpb24uaHJlZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2VDb25mLmxpbmsgPSBvcHRpb25zLmxpbms7XG4gICAgICAgIH1cbiAgICAgICAgaWYob3B0aW9ucy5kZXNjID09IG51bGwpIHtcbiAgICAgICAgICAgIGJhc2VDb25mLmRlc2MgPSB0aGlzLmZpbmREZXNjKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlQ29uZi5kZXNjID0gb3B0aW9ucy5kZXNjO1xuICAgICAgICB9XG4gICAgICAgIGlmKG9wdGlvbnMudHdpdHRlck5hbWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgYmFzZUNvbmYudHdpdHRlck5hbWUgPSBvcHRpb25zLnR3aXR0ZXJOYW1lO1xuICAgICAgICB9XG4gICAgICAgIGlmKG9wdGlvbnMucHJlZml4ID09IG51bGwpIHtcbiAgICAgICAgICAgIGJhc2VDb25mLnByZWZpeCA9ICdzaGFyZUtpdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlQ29uZi5wcmVmaXggPSBvcHRpb25zLnByZWZpeDtcbiAgICAgICAgfVxuICAgICAgICBpZihvcHRpb25zLnBvcnRyYWl0ID09IG51bGwpIHtcbiAgICAgICAgICAgIG9wdGlvbnMucG9ydHJhaXQgPSAnaHR0cDovL3VzdWFsaW1hZ2VzLnFpbml1ZG4uY29tLzEuanBlZyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlQ29uZi5wb3J0cmFpdCA9IG9wdGlvbnMucG9ydHJhaXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2VDb25mO1xuICAgIH07XG5cbiAgICAvLyByZXR1cm4gYSBjb3B5IG9mIG9wdGlvbiBvYmplY3RcbiAgICBTSy5wcm90b3R5cGUuZ2V0T3B0aW9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHJlID0ge307XG4gICAgICAgIGZvcih2YXIga2V5IGluIHRoaXMuYmFzZUNvbmYpIHtcbiAgICAgICAgICAgIHJlW2tleV0gPSB0aGlzLmJhc2VDb25mW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlO1xuICAgIH07XG5cbiAgICAvLyBkZXRlY3QgZGV2aWNlIHR5cGVcbiAgICBTSy5wcm90b3R5cGUuZGV0ZWN0RnJvbSA9IGZ1bmN0aW9uKHVybCl7XG4gICAgICAgIHZhciBhbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGFuY2hvci5ocmVmID0gdXJsO1xuICAgICAgICB2YXIgcVN0ciA9IGFuY2hvci5zZWFyY2guc2xpY2UoMSk7XG4gICAgICAgIHZhciBxQXJyID0gbnVsbDtcbiAgICAgICAgaWYocVN0ci5pbmRleE9mKCdmcm9tcGMnKSA+IC0xKSB7XG4gICAgICAgICAgICBxQXJyID0gcVN0ci5zcGxpdCgnJicpO1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMCwgbGVuID0gcUFyci5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgICAgICAgICAgaWYocUFycltpXS5pbmRleE9mKCdmcm9tcGMnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBxQXJyW2ldLnNwbGl0KCc9JylbMV0gPT09ICd0cnVlJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTSy5wcm90b3R5cGUuZmluZERlc2MgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbWV0YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWV0YScpO1xuICAgICAgICB2YXIgbWV0YTtcbiAgICAgICAgZm9yKHZhciBpPTA7IGk8IG1ldGFzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBtZXRhID0gbWV0YXNbaV07XG4gICAgICAgICAgICBpZihtZXRhLmdldEF0dHJpYnV0ZSgnbmFtZScpID09PSAnZGVzY3JpcHRpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ldGEuZ2V0QXR0cmlidXRlKCdjb250ZW50Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbi8vICAgIGNvbmNhdCB1cmwgYW5kIHF1ZXJ5IGRhdGFcbiAgICBTSy5wcm90b3R5cGUudXJsQ29uY2F0ID0gZnVuY3Rpb24obywgdXJsKXtcbiAgICAgICAgdmFyIHMgPSBbXTtcbiAgICAgICAgZm9yKHZhciBpIGluIG8pe1xuICAgICAgICAgICAgcy5wdXNoKGkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob1tpXXx8JycpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXJsICsgJz8nICsgcy5qb2luKCcmJyk7XG4gICAgfTtcblxuLy8gICAgZm9yIHRlc3RcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNLO1xufSkoKTsiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG47X19icm93c2VyaWZ5X3NoaW1fcmVxdWlyZV9fPXJlcXVpcmU7KGZ1bmN0aW9uIGJyb3dzZXJpZnlTaGltKG1vZHVsZSwgZXhwb3J0cywgcmVxdWlyZSwgZGVmaW5lLCBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXykge1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3XG4gKiAtIFVzaW5nIHRoZSAnUVJDb2RlIGZvciBKYXZhc2NyaXB0IGxpYnJhcnknXG4gKiAtIEZpeGVkIGRhdGFzZXQgb2YgJ1FSQ29kZSBmb3IgSmF2YXNjcmlwdCBsaWJyYXJ5JyBmb3Igc3VwcG9ydCBmdWxsLXNwZWMuXG4gKiAtIHRoaXMgbGlicmFyeSBoYXMgbm8gZGVwZW5kZW5jaWVzLlxuICogXG4gKiBAYXV0aG9yIGRhdmlkc2hpbWpzXG4gKiBAc2VlIDxhIGhyZWY9XCJodHRwOi8vd3d3LmQtcHJvamVjdC5jb20vXCIgdGFyZ2V0PVwiX2JsYW5rXCI+aHR0cDovL3d3dy5kLXByb2plY3QuY29tLzwvYT5cbiAqIEBzZWUgPGEgaHJlZj1cImh0dHA6Ly9qZXJvbWVldGllbm5lLmdpdGh1Yi5jb20vanF1ZXJ5LXFyY29kZS9cIiB0YXJnZXQ9XCJfYmxhbmtcIj5odHRwOi8vamVyb21lZXRpZW5uZS5naXRodWIuY29tL2pxdWVyeS1xcmNvZGUvPC9hPlxuICovXG52YXIgUVJDb2RlO1xuXG4oZnVuY3Rpb24gKCkge1xuXHQvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBRUkNvZGUgZm9yIEphdmFTY3JpcHRcblx0Ly9cblx0Ly8gQ29weXJpZ2h0IChjKSAyMDA5IEthenVoaWtvIEFyYXNlXG5cdC8vXG5cdC8vIFVSTDogaHR0cDovL3d3dy5kLXByb2plY3QuY29tL1xuXHQvL1xuXHQvLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG5cdC8vICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0Ly9cblx0Ly8gVGhlIHdvcmQgXCJRUiBDb2RlXCIgaXMgcmVnaXN0ZXJlZCB0cmFkZW1hcmsgb2YgXG5cdC8vIERFTlNPIFdBVkUgSU5DT1JQT1JBVEVEXG5cdC8vICAgaHR0cDovL3d3dy5kZW5zby13YXZlLmNvbS9xcmNvZGUvZmFxcGF0ZW50LWUuaHRtbFxuXHQvL1xuXHQvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRmdW5jdGlvbiBRUjhiaXRCeXRlKGRhdGEpIHtcblx0XHR0aGlzLm1vZGUgPSBRUk1vZGUuTU9ERV84QklUX0JZVEU7XG5cdFx0dGhpcy5kYXRhID0gZGF0YTtcblx0XHR0aGlzLnBhcnNlZERhdGEgPSBbXTtcblxuXHRcdC8vIEFkZGVkIHRvIHN1cHBvcnQgVVRGLTggQ2hhcmFjdGVyc1xuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5kYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHRcdFx0dmFyIGJ5dGVBcnJheSA9IFtdO1xuXHRcdFx0dmFyIGNvZGUgPSB0aGlzLmRhdGEuY2hhckNvZGVBdChpKTtcblxuXHRcdFx0aWYgKGNvZGUgPiAweDEwMDAwKSB7XG5cdFx0XHRcdGJ5dGVBcnJheVswXSA9IDB4RjAgfCAoKGNvZGUgJiAweDFDMDAwMCkgPj4+IDE4KTtcblx0XHRcdFx0Ynl0ZUFycmF5WzFdID0gMHg4MCB8ICgoY29kZSAmIDB4M0YwMDApID4+PiAxMik7XG5cdFx0XHRcdGJ5dGVBcnJheVsyXSA9IDB4ODAgfCAoKGNvZGUgJiAweEZDMCkgPj4+IDYpO1xuXHRcdFx0XHRieXRlQXJyYXlbM10gPSAweDgwIHwgKGNvZGUgJiAweDNGKTtcblx0XHRcdH0gZWxzZSBpZiAoY29kZSA+IDB4ODAwKSB7XG5cdFx0XHRcdGJ5dGVBcnJheVswXSA9IDB4RTAgfCAoKGNvZGUgJiAweEYwMDApID4+PiAxMik7XG5cdFx0XHRcdGJ5dGVBcnJheVsxXSA9IDB4ODAgfCAoKGNvZGUgJiAweEZDMCkgPj4+IDYpO1xuXHRcdFx0XHRieXRlQXJyYXlbMl0gPSAweDgwIHwgKGNvZGUgJiAweDNGKTtcblx0XHRcdH0gZWxzZSBpZiAoY29kZSA+IDB4ODApIHtcblx0XHRcdFx0Ynl0ZUFycmF5WzBdID0gMHhDMCB8ICgoY29kZSAmIDB4N0MwKSA+Pj4gNik7XG5cdFx0XHRcdGJ5dGVBcnJheVsxXSA9IDB4ODAgfCAoY29kZSAmIDB4M0YpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ynl0ZUFycmF5WzBdID0gY29kZTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5wYXJzZWREYXRhLnB1c2goYnl0ZUFycmF5KTtcblx0XHR9XG5cblx0XHR0aGlzLnBhcnNlZERhdGEgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCB0aGlzLnBhcnNlZERhdGEpO1xuXG5cdFx0aWYgKHRoaXMucGFyc2VkRGF0YS5sZW5ndGggIT0gdGhpcy5kYXRhLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5wYXJzZWREYXRhLnVuc2hpZnQoMTkxKTtcblx0XHRcdHRoaXMucGFyc2VkRGF0YS51bnNoaWZ0KDE4Nyk7XG5cdFx0XHR0aGlzLnBhcnNlZERhdGEudW5zaGlmdCgyMzkpO1xuXHRcdH1cblx0fVxuXG5cdFFSOGJpdEJ5dGUucHJvdG90eXBlID0ge1xuXHRcdGdldExlbmd0aDogZnVuY3Rpb24gKGJ1ZmZlcikge1xuXHRcdFx0cmV0dXJuIHRoaXMucGFyc2VkRGF0YS5sZW5ndGg7XG5cdFx0fSxcblx0XHR3cml0ZTogZnVuY3Rpb24gKGJ1ZmZlcikge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnBhcnNlZERhdGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRcdGJ1ZmZlci5wdXQodGhpcy5wYXJzZWREYXRhW2ldLCA4KTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0ZnVuY3Rpb24gUVJDb2RlTW9kZWwodHlwZU51bWJlciwgZXJyb3JDb3JyZWN0TGV2ZWwpIHtcblx0XHR0aGlzLnR5cGVOdW1iZXIgPSB0eXBlTnVtYmVyO1xuXHRcdHRoaXMuZXJyb3JDb3JyZWN0TGV2ZWwgPSBlcnJvckNvcnJlY3RMZXZlbDtcblx0XHR0aGlzLm1vZHVsZXMgPSBudWxsO1xuXHRcdHRoaXMubW9kdWxlQ291bnQgPSAwO1xuXHRcdHRoaXMuZGF0YUNhY2hlID0gbnVsbDtcblx0XHR0aGlzLmRhdGFMaXN0ID0gW107XG5cdH1cblxuXHRRUkNvZGVNb2RlbC5wcm90b3R5cGU9e2FkZERhdGE6ZnVuY3Rpb24oZGF0YSl7dmFyIG5ld0RhdGE9bmV3IFFSOGJpdEJ5dGUoZGF0YSk7dGhpcy5kYXRhTGlzdC5wdXNoKG5ld0RhdGEpO3RoaXMuZGF0YUNhY2hlPW51bGw7fSxpc0Rhcms6ZnVuY3Rpb24ocm93LGNvbCl7aWYocm93PDB8fHRoaXMubW9kdWxlQ291bnQ8PXJvd3x8Y29sPDB8fHRoaXMubW9kdWxlQ291bnQ8PWNvbCl7dGhyb3cgbmV3IEVycm9yKHJvdytcIixcIitjb2wpO31cblx0cmV0dXJuIHRoaXMubW9kdWxlc1tyb3ddW2NvbF07fSxnZXRNb2R1bGVDb3VudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1vZHVsZUNvdW50O30sbWFrZTpmdW5jdGlvbigpe3RoaXMubWFrZUltcGwoZmFsc2UsdGhpcy5nZXRCZXN0TWFza1BhdHRlcm4oKSk7fSxtYWtlSW1wbDpmdW5jdGlvbih0ZXN0LG1hc2tQYXR0ZXJuKXt0aGlzLm1vZHVsZUNvdW50PXRoaXMudHlwZU51bWJlcio0KzE3O3RoaXMubW9kdWxlcz1uZXcgQXJyYXkodGhpcy5tb2R1bGVDb3VudCk7Zm9yKHZhciByb3c9MDtyb3c8dGhpcy5tb2R1bGVDb3VudDtyb3crKyl7dGhpcy5tb2R1bGVzW3Jvd109bmV3IEFycmF5KHRoaXMubW9kdWxlQ291bnQpO2Zvcih2YXIgY29sPTA7Y29sPHRoaXMubW9kdWxlQ291bnQ7Y29sKyspe3RoaXMubW9kdWxlc1tyb3ddW2NvbF09bnVsbDt9fVxuXHR0aGlzLnNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4oMCwwKTt0aGlzLnNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4odGhpcy5tb2R1bGVDb3VudC03LDApO3RoaXMuc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybigwLHRoaXMubW9kdWxlQ291bnQtNyk7dGhpcy5zZXR1cFBvc2l0aW9uQWRqdXN0UGF0dGVybigpO3RoaXMuc2V0dXBUaW1pbmdQYXR0ZXJuKCk7dGhpcy5zZXR1cFR5cGVJbmZvKHRlc3QsbWFza1BhdHRlcm4pO2lmKHRoaXMudHlwZU51bWJlcj49Nyl7dGhpcy5zZXR1cFR5cGVOdW1iZXIodGVzdCk7fVxuXHRpZih0aGlzLmRhdGFDYWNoZT09bnVsbCl7dGhpcy5kYXRhQ2FjaGU9UVJDb2RlTW9kZWwuY3JlYXRlRGF0YSh0aGlzLnR5cGVOdW1iZXIsdGhpcy5lcnJvckNvcnJlY3RMZXZlbCx0aGlzLmRhdGFMaXN0KTt9XG5cdHRoaXMubWFwRGF0YSh0aGlzLmRhdGFDYWNoZSxtYXNrUGF0dGVybik7fSxzZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuOmZ1bmN0aW9uKHJvdyxjb2wpe2Zvcih2YXIgcj0tMTtyPD03O3IrKyl7aWYocm93K3I8PS0xfHx0aGlzLm1vZHVsZUNvdW50PD1yb3crciljb250aW51ZTtmb3IodmFyIGM9LTE7Yzw9NztjKyspe2lmKGNvbCtjPD0tMXx8dGhpcy5tb2R1bGVDb3VudDw9Y29sK2MpY29udGludWU7aWYoKDA8PXImJnI8PTYmJihjPT0wfHxjPT02KSl8fCgwPD1jJiZjPD02JiYocj09MHx8cj09NikpfHwoMjw9ciYmcjw9NCYmMjw9YyYmYzw9NCkpe3RoaXMubW9kdWxlc1tyb3crcl1bY29sK2NdPXRydWU7fWVsc2V7dGhpcy5tb2R1bGVzW3JvdytyXVtjb2wrY109ZmFsc2U7fX19fSxnZXRCZXN0TWFza1BhdHRlcm46ZnVuY3Rpb24oKXt2YXIgbWluTG9zdFBvaW50PTA7dmFyIHBhdHRlcm49MDtmb3IodmFyIGk9MDtpPDg7aSsrKXt0aGlzLm1ha2VJbXBsKHRydWUsaSk7dmFyIGxvc3RQb2ludD1RUlV0aWwuZ2V0TG9zdFBvaW50KHRoaXMpO2lmKGk9PTB8fG1pbkxvc3RQb2ludD5sb3N0UG9pbnQpe21pbkxvc3RQb2ludD1sb3N0UG9pbnQ7cGF0dGVybj1pO319XG5cdHJldHVybiBwYXR0ZXJuO30sY3JlYXRlTW92aWVDbGlwOmZ1bmN0aW9uKHRhcmdldF9tYyxpbnN0YW5jZV9uYW1lLGRlcHRoKXt2YXIgcXJfbWM9dGFyZ2V0X21jLmNyZWF0ZUVtcHR5TW92aWVDbGlwKGluc3RhbmNlX25hbWUsZGVwdGgpO3ZhciBjcz0xO3RoaXMubWFrZSgpO2Zvcih2YXIgcm93PTA7cm93PHRoaXMubW9kdWxlcy5sZW5ndGg7cm93Kyspe3ZhciB5PXJvdypjcztmb3IodmFyIGNvbD0wO2NvbDx0aGlzLm1vZHVsZXNbcm93XS5sZW5ndGg7Y29sKyspe3ZhciB4PWNvbCpjczt2YXIgZGFyaz10aGlzLm1vZHVsZXNbcm93XVtjb2xdO2lmKGRhcmspe3FyX21jLmJlZ2luRmlsbCgwLDEwMCk7cXJfbWMubW92ZVRvKHgseSk7cXJfbWMubGluZVRvKHgrY3MseSk7cXJfbWMubGluZVRvKHgrY3MseStjcyk7cXJfbWMubGluZVRvKHgseStjcyk7cXJfbWMuZW5kRmlsbCgpO319fVxuXHRyZXR1cm4gcXJfbWM7fSxzZXR1cFRpbWluZ1BhdHRlcm46ZnVuY3Rpb24oKXtmb3IodmFyIHI9ODtyPHRoaXMubW9kdWxlQ291bnQtODtyKyspe2lmKHRoaXMubW9kdWxlc1tyXVs2XSE9bnVsbCl7Y29udGludWU7fVxuXHR0aGlzLm1vZHVsZXNbcl1bNl09KHIlMj09MCk7fVxuXHRmb3IodmFyIGM9ODtjPHRoaXMubW9kdWxlQ291bnQtODtjKyspe2lmKHRoaXMubW9kdWxlc1s2XVtjXSE9bnVsbCl7Y29udGludWU7fVxuXHR0aGlzLm1vZHVsZXNbNl1bY109KGMlMj09MCk7fX0sc2V0dXBQb3NpdGlvbkFkanVzdFBhdHRlcm46ZnVuY3Rpb24oKXt2YXIgcG9zPVFSVXRpbC5nZXRQYXR0ZXJuUG9zaXRpb24odGhpcy50eXBlTnVtYmVyKTtmb3IodmFyIGk9MDtpPHBvcy5sZW5ndGg7aSsrKXtmb3IodmFyIGo9MDtqPHBvcy5sZW5ndGg7aisrKXt2YXIgcm93PXBvc1tpXTt2YXIgY29sPXBvc1tqXTtpZih0aGlzLm1vZHVsZXNbcm93XVtjb2xdIT1udWxsKXtjb250aW51ZTt9XG5cdGZvcih2YXIgcj0tMjtyPD0yO3IrKyl7Zm9yKHZhciBjPS0yO2M8PTI7YysrKXtpZihyPT0tMnx8cj09Mnx8Yz09LTJ8fGM9PTJ8fChyPT0wJiZjPT0wKSl7dGhpcy5tb2R1bGVzW3JvdytyXVtjb2wrY109dHJ1ZTt9ZWxzZXt0aGlzLm1vZHVsZXNbcm93K3JdW2NvbCtjXT1mYWxzZTt9fX19fX0sc2V0dXBUeXBlTnVtYmVyOmZ1bmN0aW9uKHRlc3Qpe3ZhciBiaXRzPVFSVXRpbC5nZXRCQ0hUeXBlTnVtYmVyKHRoaXMudHlwZU51bWJlcik7Zm9yKHZhciBpPTA7aTwxODtpKyspe3ZhciBtb2Q9KCF0ZXN0JiYoKGJpdHM+PmkpJjEpPT0xKTt0aGlzLm1vZHVsZXNbTWF0aC5mbG9vcihpLzMpXVtpJTMrdGhpcy5tb2R1bGVDb3VudC04LTNdPW1vZDt9XG5cdGZvcih2YXIgaT0wO2k8MTg7aSsrKXt2YXIgbW9kPSghdGVzdCYmKChiaXRzPj5pKSYxKT09MSk7dGhpcy5tb2R1bGVzW2klMyt0aGlzLm1vZHVsZUNvdW50LTgtM11bTWF0aC5mbG9vcihpLzMpXT1tb2Q7fX0sc2V0dXBUeXBlSW5mbzpmdW5jdGlvbih0ZXN0LG1hc2tQYXR0ZXJuKXt2YXIgZGF0YT0odGhpcy5lcnJvckNvcnJlY3RMZXZlbDw8Myl8bWFza1BhdHRlcm47dmFyIGJpdHM9UVJVdGlsLmdldEJDSFR5cGVJbmZvKGRhdGEpO2Zvcih2YXIgaT0wO2k8MTU7aSsrKXt2YXIgbW9kPSghdGVzdCYmKChiaXRzPj5pKSYxKT09MSk7aWYoaTw2KXt0aGlzLm1vZHVsZXNbaV1bOF09bW9kO31lbHNlIGlmKGk8OCl7dGhpcy5tb2R1bGVzW2krMV1bOF09bW9kO31lbHNle3RoaXMubW9kdWxlc1t0aGlzLm1vZHVsZUNvdW50LTE1K2ldWzhdPW1vZDt9fVxuXHRmb3IodmFyIGk9MDtpPDE1O2krKyl7dmFyIG1vZD0oIXRlc3QmJigoYml0cz4+aSkmMSk9PTEpO2lmKGk8OCl7dGhpcy5tb2R1bGVzWzhdW3RoaXMubW9kdWxlQ291bnQtaS0xXT1tb2Q7fWVsc2UgaWYoaTw5KXt0aGlzLm1vZHVsZXNbOF1bMTUtaS0xKzFdPW1vZDt9ZWxzZXt0aGlzLm1vZHVsZXNbOF1bMTUtaS0xXT1tb2Q7fX1cblx0dGhpcy5tb2R1bGVzW3RoaXMubW9kdWxlQ291bnQtOF1bOF09KCF0ZXN0KTt9LG1hcERhdGE6ZnVuY3Rpb24oZGF0YSxtYXNrUGF0dGVybil7dmFyIGluYz0tMTt2YXIgcm93PXRoaXMubW9kdWxlQ291bnQtMTt2YXIgYml0SW5kZXg9Nzt2YXIgYnl0ZUluZGV4PTA7Zm9yKHZhciBjb2w9dGhpcy5tb2R1bGVDb3VudC0xO2NvbD4wO2NvbC09Mil7aWYoY29sPT02KWNvbC0tO3doaWxlKHRydWUpe2Zvcih2YXIgYz0wO2M8MjtjKyspe2lmKHRoaXMubW9kdWxlc1tyb3ddW2NvbC1jXT09bnVsbCl7dmFyIGRhcms9ZmFsc2U7aWYoYnl0ZUluZGV4PGRhdGEubGVuZ3RoKXtkYXJrPSgoKGRhdGFbYnl0ZUluZGV4XT4+PmJpdEluZGV4KSYxKT09MSk7fVxuXHR2YXIgbWFzaz1RUlV0aWwuZ2V0TWFzayhtYXNrUGF0dGVybixyb3csY29sLWMpO2lmKG1hc2spe2Rhcms9IWRhcms7fVxuXHR0aGlzLm1vZHVsZXNbcm93XVtjb2wtY109ZGFyaztiaXRJbmRleC0tO2lmKGJpdEluZGV4PT0tMSl7Ynl0ZUluZGV4Kys7Yml0SW5kZXg9Nzt9fX1cblx0cm93Kz1pbmM7aWYocm93PDB8fHRoaXMubW9kdWxlQ291bnQ8PXJvdyl7cm93LT1pbmM7aW5jPS1pbmM7YnJlYWs7fX19fX07UVJDb2RlTW9kZWwuUEFEMD0weEVDO1FSQ29kZU1vZGVsLlBBRDE9MHgxMTtRUkNvZGVNb2RlbC5jcmVhdGVEYXRhPWZ1bmN0aW9uKHR5cGVOdW1iZXIsZXJyb3JDb3JyZWN0TGV2ZWwsZGF0YUxpc3Qpe3ZhciByc0Jsb2Nrcz1RUlJTQmxvY2suZ2V0UlNCbG9ja3ModHlwZU51bWJlcixlcnJvckNvcnJlY3RMZXZlbCk7dmFyIGJ1ZmZlcj1uZXcgUVJCaXRCdWZmZXIoKTtmb3IodmFyIGk9MDtpPGRhdGFMaXN0Lmxlbmd0aDtpKyspe3ZhciBkYXRhPWRhdGFMaXN0W2ldO2J1ZmZlci5wdXQoZGF0YS5tb2RlLDQpO2J1ZmZlci5wdXQoZGF0YS5nZXRMZW5ndGgoKSxRUlV0aWwuZ2V0TGVuZ3RoSW5CaXRzKGRhdGEubW9kZSx0eXBlTnVtYmVyKSk7ZGF0YS53cml0ZShidWZmZXIpO31cblx0dmFyIHRvdGFsRGF0YUNvdW50PTA7Zm9yKHZhciBpPTA7aTxyc0Jsb2Nrcy5sZW5ndGg7aSsrKXt0b3RhbERhdGFDb3VudCs9cnNCbG9ja3NbaV0uZGF0YUNvdW50O31cblx0aWYoYnVmZmVyLmdldExlbmd0aEluQml0cygpPnRvdGFsRGF0YUNvdW50Kjgpe3Rocm93IG5ldyBFcnJvcihcImNvZGUgbGVuZ3RoIG92ZXJmbG93LiAoXCJcblx0K2J1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKVxuXHQrXCI+XCJcblx0K3RvdGFsRGF0YUNvdW50Kjhcblx0K1wiKVwiKTt9XG5cdGlmKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSs0PD10b3RhbERhdGFDb3VudCo4KXtidWZmZXIucHV0KDAsNCk7fVxuXHR3aGlsZShidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCklOCE9MCl7YnVmZmVyLnB1dEJpdChmYWxzZSk7fVxuXHR3aGlsZSh0cnVlKXtpZihidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCk+PXRvdGFsRGF0YUNvdW50Kjgpe2JyZWFrO31cblx0YnVmZmVyLnB1dChRUkNvZGVNb2RlbC5QQUQwLDgpO2lmKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKT49dG90YWxEYXRhQ291bnQqOCl7YnJlYWs7fVxuXHRidWZmZXIucHV0KFFSQ29kZU1vZGVsLlBBRDEsOCk7fVxuXHRyZXR1cm4gUVJDb2RlTW9kZWwuY3JlYXRlQnl0ZXMoYnVmZmVyLHJzQmxvY2tzKTt9O1FSQ29kZU1vZGVsLmNyZWF0ZUJ5dGVzPWZ1bmN0aW9uKGJ1ZmZlcixyc0Jsb2Nrcyl7dmFyIG9mZnNldD0wO3ZhciBtYXhEY0NvdW50PTA7dmFyIG1heEVjQ291bnQ9MDt2YXIgZGNkYXRhPW5ldyBBcnJheShyc0Jsb2Nrcy5sZW5ndGgpO3ZhciBlY2RhdGE9bmV3IEFycmF5KHJzQmxvY2tzLmxlbmd0aCk7Zm9yKHZhciByPTA7cjxyc0Jsb2Nrcy5sZW5ndGg7cisrKXt2YXIgZGNDb3VudD1yc0Jsb2Nrc1tyXS5kYXRhQ291bnQ7dmFyIGVjQ291bnQ9cnNCbG9ja3Nbcl0udG90YWxDb3VudC1kY0NvdW50O21heERjQ291bnQ9TWF0aC5tYXgobWF4RGNDb3VudCxkY0NvdW50KTttYXhFY0NvdW50PU1hdGgubWF4KG1heEVjQ291bnQsZWNDb3VudCk7ZGNkYXRhW3JdPW5ldyBBcnJheShkY0NvdW50KTtmb3IodmFyIGk9MDtpPGRjZGF0YVtyXS5sZW5ndGg7aSsrKXtkY2RhdGFbcl1baV09MHhmZiZidWZmZXIuYnVmZmVyW2krb2Zmc2V0XTt9XG5cdG9mZnNldCs9ZGNDb3VudDt2YXIgcnNQb2x5PVFSVXRpbC5nZXRFcnJvckNvcnJlY3RQb2x5bm9taWFsKGVjQ291bnQpO3ZhciByYXdQb2x5PW5ldyBRUlBvbHlub21pYWwoZGNkYXRhW3JdLHJzUG9seS5nZXRMZW5ndGgoKS0xKTt2YXIgbW9kUG9seT1yYXdQb2x5Lm1vZChyc1BvbHkpO2VjZGF0YVtyXT1uZXcgQXJyYXkocnNQb2x5LmdldExlbmd0aCgpLTEpO2Zvcih2YXIgaT0wO2k8ZWNkYXRhW3JdLmxlbmd0aDtpKyspe3ZhciBtb2RJbmRleD1pK21vZFBvbHkuZ2V0TGVuZ3RoKCktZWNkYXRhW3JdLmxlbmd0aDtlY2RhdGFbcl1baV09KG1vZEluZGV4Pj0wKT9tb2RQb2x5LmdldChtb2RJbmRleCk6MDt9fVxuXHR2YXIgdG90YWxDb2RlQ291bnQ9MDtmb3IodmFyIGk9MDtpPHJzQmxvY2tzLmxlbmd0aDtpKyspe3RvdGFsQ29kZUNvdW50Kz1yc0Jsb2Nrc1tpXS50b3RhbENvdW50O31cblx0dmFyIGRhdGE9bmV3IEFycmF5KHRvdGFsQ29kZUNvdW50KTt2YXIgaW5kZXg9MDtmb3IodmFyIGk9MDtpPG1heERjQ291bnQ7aSsrKXtmb3IodmFyIHI9MDtyPHJzQmxvY2tzLmxlbmd0aDtyKyspe2lmKGk8ZGNkYXRhW3JdLmxlbmd0aCl7ZGF0YVtpbmRleCsrXT1kY2RhdGFbcl1baV07fX19XG5cdGZvcih2YXIgaT0wO2k8bWF4RWNDb3VudDtpKyspe2Zvcih2YXIgcj0wO3I8cnNCbG9ja3MubGVuZ3RoO3IrKyl7aWYoaTxlY2RhdGFbcl0ubGVuZ3RoKXtkYXRhW2luZGV4KytdPWVjZGF0YVtyXVtpXTt9fX1cblx0cmV0dXJuIGRhdGE7fTt2YXIgUVJNb2RlPXtNT0RFX05VTUJFUjoxPDwwLE1PREVfQUxQSEFfTlVNOjE8PDEsTU9ERV84QklUX0JZVEU6MTw8MixNT0RFX0tBTkpJOjE8PDN9O3ZhciBRUkVycm9yQ29ycmVjdExldmVsPXtMOjEsTTowLFE6MyxIOjJ9O3ZhciBRUk1hc2tQYXR0ZXJuPXtQQVRURVJOMDAwOjAsUEFUVEVSTjAwMToxLFBBVFRFUk4wMTA6MixQQVRURVJOMDExOjMsUEFUVEVSTjEwMDo0LFBBVFRFUk4xMDE6NSxQQVRURVJOMTEwOjYsUEFUVEVSTjExMTo3fTt2YXIgUVJVdGlsPXtQQVRURVJOX1BPU0lUSU9OX1RBQkxFOltbXSxbNiwxOF0sWzYsMjJdLFs2LDI2XSxbNiwzMF0sWzYsMzRdLFs2LDIyLDM4XSxbNiwyNCw0Ml0sWzYsMjYsNDZdLFs2LDI4LDUwXSxbNiwzMCw1NF0sWzYsMzIsNThdLFs2LDM0LDYyXSxbNiwyNiw0Niw2Nl0sWzYsMjYsNDgsNzBdLFs2LDI2LDUwLDc0XSxbNiwzMCw1NCw3OF0sWzYsMzAsNTYsODJdLFs2LDMwLDU4LDg2XSxbNiwzNCw2Miw5MF0sWzYsMjgsNTAsNzIsOTRdLFs2LDI2LDUwLDc0LDk4XSxbNiwzMCw1NCw3OCwxMDJdLFs2LDI4LDU0LDgwLDEwNl0sWzYsMzIsNTgsODQsMTEwXSxbNiwzMCw1OCw4NiwxMTRdLFs2LDM0LDYyLDkwLDExOF0sWzYsMjYsNTAsNzQsOTgsMTIyXSxbNiwzMCw1NCw3OCwxMDIsMTI2XSxbNiwyNiw1Miw3OCwxMDQsMTMwXSxbNiwzMCw1Niw4MiwxMDgsMTM0XSxbNiwzNCw2MCw4NiwxMTIsMTM4XSxbNiwzMCw1OCw4NiwxMTQsMTQyXSxbNiwzNCw2Miw5MCwxMTgsMTQ2XSxbNiwzMCw1NCw3OCwxMDIsMTI2LDE1MF0sWzYsMjQsNTAsNzYsMTAyLDEyOCwxNTRdLFs2LDI4LDU0LDgwLDEwNiwxMzIsMTU4XSxbNiwzMiw1OCw4NCwxMTAsMTM2LDE2Ml0sWzYsMjYsNTQsODIsMTEwLDEzOCwxNjZdLFs2LDMwLDU4LDg2LDExNCwxNDIsMTcwXV0sRzE1OigxPDwxMCl8KDE8PDgpfCgxPDw1KXwoMTw8NCl8KDE8PDIpfCgxPDwxKXwoMTw8MCksRzE4OigxPDwxMil8KDE8PDExKXwoMTw8MTApfCgxPDw5KXwoMTw8OCl8KDE8PDUpfCgxPDwyKXwoMTw8MCksRzE1X01BU0s6KDE8PDE0KXwoMTw8MTIpfCgxPDwxMCl8KDE8PDQpfCgxPDwxKSxnZXRCQ0hUeXBlSW5mbzpmdW5jdGlvbihkYXRhKXt2YXIgZD1kYXRhPDwxMDt3aGlsZShRUlV0aWwuZ2V0QkNIRGlnaXQoZCktUVJVdGlsLmdldEJDSERpZ2l0KFFSVXRpbC5HMTUpPj0wKXtkXj0oUVJVdGlsLkcxNTw8KFFSVXRpbC5nZXRCQ0hEaWdpdChkKS1RUlV0aWwuZ2V0QkNIRGlnaXQoUVJVdGlsLkcxNSkpKTt9XG5cdHJldHVybigoZGF0YTw8MTApfGQpXlFSVXRpbC5HMTVfTUFTSzt9LGdldEJDSFR5cGVOdW1iZXI6ZnVuY3Rpb24oZGF0YSl7dmFyIGQ9ZGF0YTw8MTI7d2hpbGUoUVJVdGlsLmdldEJDSERpZ2l0KGQpLVFSVXRpbC5nZXRCQ0hEaWdpdChRUlV0aWwuRzE4KT49MCl7ZF49KFFSVXRpbC5HMTg8PChRUlV0aWwuZ2V0QkNIRGlnaXQoZCktUVJVdGlsLmdldEJDSERpZ2l0KFFSVXRpbC5HMTgpKSk7fVxuXHRyZXR1cm4oZGF0YTw8MTIpfGQ7fSxnZXRCQ0hEaWdpdDpmdW5jdGlvbihkYXRhKXt2YXIgZGlnaXQ9MDt3aGlsZShkYXRhIT0wKXtkaWdpdCsrO2RhdGE+Pj49MTt9XG5cdHJldHVybiBkaWdpdDt9LGdldFBhdHRlcm5Qb3NpdGlvbjpmdW5jdGlvbih0eXBlTnVtYmVyKXtyZXR1cm4gUVJVdGlsLlBBVFRFUk5fUE9TSVRJT05fVEFCTEVbdHlwZU51bWJlci0xXTt9LGdldE1hc2s6ZnVuY3Rpb24obWFza1BhdHRlcm4saSxqKXtzd2l0Y2gobWFza1BhdHRlcm4pe2Nhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDAwOnJldHVybihpK2opJTI9PTA7Y2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMDE6cmV0dXJuIGklMj09MDtjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAxMDpyZXR1cm4gaiUzPT0wO2Nhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDExOnJldHVybihpK2opJTM9PTA7Y2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMDA6cmV0dXJuKE1hdGguZmxvb3IoaS8yKStNYXRoLmZsb29yKGovMykpJTI9PTA7Y2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMDE6cmV0dXJuKGkqaiklMisoaSpqKSUzPT0wO2Nhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMTEwOnJldHVybigoaSpqKSUyKyhpKmopJTMpJTI9PTA7Y2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMTE6cmV0dXJuKChpKmopJTMrKGkraiklMiklMj09MDtkZWZhdWx0OnRocm93IG5ldyBFcnJvcihcImJhZCBtYXNrUGF0dGVybjpcIittYXNrUGF0dGVybik7fX0sZ2V0RXJyb3JDb3JyZWN0UG9seW5vbWlhbDpmdW5jdGlvbihlcnJvckNvcnJlY3RMZW5ndGgpe3ZhciBhPW5ldyBRUlBvbHlub21pYWwoWzFdLDApO2Zvcih2YXIgaT0wO2k8ZXJyb3JDb3JyZWN0TGVuZ3RoO2krKyl7YT1hLm11bHRpcGx5KG5ldyBRUlBvbHlub21pYWwoWzEsUVJNYXRoLmdleHAoaSldLDApKTt9XG5cdHJldHVybiBhO30sZ2V0TGVuZ3RoSW5CaXRzOmZ1bmN0aW9uKG1vZGUsdHlwZSl7aWYoMTw9dHlwZSYmdHlwZTwxMCl7c3dpdGNoKG1vZGUpe2Nhc2UgUVJNb2RlLk1PREVfTlVNQkVSOnJldHVybiAxMDtjYXNlIFFSTW9kZS5NT0RFX0FMUEhBX05VTTpyZXR1cm4gOTtjYXNlIFFSTW9kZS5NT0RFXzhCSVRfQllURTpyZXR1cm4gODtjYXNlIFFSTW9kZS5NT0RFX0tBTkpJOnJldHVybiA4O2RlZmF1bHQ6dGhyb3cgbmV3IEVycm9yKFwibW9kZTpcIittb2RlKTt9fWVsc2UgaWYodHlwZTwyNyl7c3dpdGNoKG1vZGUpe2Nhc2UgUVJNb2RlLk1PREVfTlVNQkVSOnJldHVybiAxMjtjYXNlIFFSTW9kZS5NT0RFX0FMUEhBX05VTTpyZXR1cm4gMTE7Y2FzZSBRUk1vZGUuTU9ERV84QklUX0JZVEU6cmV0dXJuIDE2O2Nhc2UgUVJNb2RlLk1PREVfS0FOSkk6cmV0dXJuIDEwO2RlZmF1bHQ6dGhyb3cgbmV3IEVycm9yKFwibW9kZTpcIittb2RlKTt9fWVsc2UgaWYodHlwZTw0MSl7c3dpdGNoKG1vZGUpe2Nhc2UgUVJNb2RlLk1PREVfTlVNQkVSOnJldHVybiAxNDtjYXNlIFFSTW9kZS5NT0RFX0FMUEhBX05VTTpyZXR1cm4gMTM7Y2FzZSBRUk1vZGUuTU9ERV84QklUX0JZVEU6cmV0dXJuIDE2O2Nhc2UgUVJNb2RlLk1PREVfS0FOSkk6cmV0dXJuIDEyO2RlZmF1bHQ6dGhyb3cgbmV3IEVycm9yKFwibW9kZTpcIittb2RlKTt9fWVsc2V7dGhyb3cgbmV3IEVycm9yKFwidHlwZTpcIit0eXBlKTt9fSxnZXRMb3N0UG9pbnQ6ZnVuY3Rpb24ocXJDb2RlKXt2YXIgbW9kdWxlQ291bnQ9cXJDb2RlLmdldE1vZHVsZUNvdW50KCk7dmFyIGxvc3RQb2ludD0wO2Zvcih2YXIgcm93PTA7cm93PG1vZHVsZUNvdW50O3JvdysrKXtmb3IodmFyIGNvbD0wO2NvbDxtb2R1bGVDb3VudDtjb2wrKyl7dmFyIHNhbWVDb3VudD0wO3ZhciBkYXJrPXFyQ29kZS5pc0Rhcmsocm93LGNvbCk7Zm9yKHZhciByPS0xO3I8PTE7cisrKXtpZihyb3crcjwwfHxtb2R1bGVDb3VudDw9cm93K3Ipe2NvbnRpbnVlO31cblx0Zm9yKHZhciBjPS0xO2M8PTE7YysrKXtpZihjb2wrYzwwfHxtb2R1bGVDb3VudDw9Y29sK2Mpe2NvbnRpbnVlO31cblx0aWYocj09MCYmYz09MCl7Y29udGludWU7fVxuXHRpZihkYXJrPT1xckNvZGUuaXNEYXJrKHJvdytyLGNvbCtjKSl7c2FtZUNvdW50Kys7fX19XG5cdGlmKHNhbWVDb3VudD41KXtsb3N0UG9pbnQrPSgzK3NhbWVDb3VudC01KTt9fX1cblx0Zm9yKHZhciByb3c9MDtyb3c8bW9kdWxlQ291bnQtMTtyb3crKyl7Zm9yKHZhciBjb2w9MDtjb2w8bW9kdWxlQ291bnQtMTtjb2wrKyl7dmFyIGNvdW50PTA7aWYocXJDb2RlLmlzRGFyayhyb3csY29sKSljb3VudCsrO2lmKHFyQ29kZS5pc0Rhcmsocm93KzEsY29sKSljb3VudCsrO2lmKHFyQ29kZS5pc0Rhcmsocm93LGNvbCsxKSljb3VudCsrO2lmKHFyQ29kZS5pc0Rhcmsocm93KzEsY29sKzEpKWNvdW50Kys7aWYoY291bnQ9PTB8fGNvdW50PT00KXtsb3N0UG9pbnQrPTM7fX19XG5cdGZvcih2YXIgcm93PTA7cm93PG1vZHVsZUNvdW50O3JvdysrKXtmb3IodmFyIGNvbD0wO2NvbDxtb2R1bGVDb3VudC02O2NvbCsrKXtpZihxckNvZGUuaXNEYXJrKHJvdyxjb2wpJiYhcXJDb2RlLmlzRGFyayhyb3csY29sKzEpJiZxckNvZGUuaXNEYXJrKHJvdyxjb2wrMikmJnFyQ29kZS5pc0Rhcmsocm93LGNvbCszKSYmcXJDb2RlLmlzRGFyayhyb3csY29sKzQpJiYhcXJDb2RlLmlzRGFyayhyb3csY29sKzUpJiZxckNvZGUuaXNEYXJrKHJvdyxjb2wrNikpe2xvc3RQb2ludCs9NDA7fX19XG5cdGZvcih2YXIgY29sPTA7Y29sPG1vZHVsZUNvdW50O2NvbCsrKXtmb3IodmFyIHJvdz0wO3Jvdzxtb2R1bGVDb3VudC02O3JvdysrKXtpZihxckNvZGUuaXNEYXJrKHJvdyxjb2wpJiYhcXJDb2RlLmlzRGFyayhyb3crMSxjb2wpJiZxckNvZGUuaXNEYXJrKHJvdysyLGNvbCkmJnFyQ29kZS5pc0Rhcmsocm93KzMsY29sKSYmcXJDb2RlLmlzRGFyayhyb3crNCxjb2wpJiYhcXJDb2RlLmlzRGFyayhyb3crNSxjb2wpJiZxckNvZGUuaXNEYXJrKHJvdys2LGNvbCkpe2xvc3RQb2ludCs9NDA7fX19XG5cdHZhciBkYXJrQ291bnQ9MDtmb3IodmFyIGNvbD0wO2NvbDxtb2R1bGVDb3VudDtjb2wrKyl7Zm9yKHZhciByb3c9MDtyb3c8bW9kdWxlQ291bnQ7cm93Kyspe2lmKHFyQ29kZS5pc0Rhcmsocm93LGNvbCkpe2RhcmtDb3VudCsrO319fVxuXHR2YXIgcmF0aW89TWF0aC5hYnMoMTAwKmRhcmtDb3VudC9tb2R1bGVDb3VudC9tb2R1bGVDb3VudC01MCkvNTtsb3N0UG9pbnQrPXJhdGlvKjEwO3JldHVybiBsb3N0UG9pbnQ7fX07dmFyIFFSTWF0aD17Z2xvZzpmdW5jdGlvbihuKXtpZihuPDEpe3Rocm93IG5ldyBFcnJvcihcImdsb2coXCIrbitcIilcIik7fVxuXHRyZXR1cm4gUVJNYXRoLkxPR19UQUJMRVtuXTt9LGdleHA6ZnVuY3Rpb24obil7d2hpbGUobjwwKXtuKz0yNTU7fVxuXHR3aGlsZShuPj0yNTYpe24tPTI1NTt9XG5cdHJldHVybiBRUk1hdGguRVhQX1RBQkxFW25dO30sRVhQX1RBQkxFOm5ldyBBcnJheSgyNTYpLExPR19UQUJMRTpuZXcgQXJyYXkoMjU2KX07Zm9yKHZhciBpPTA7aTw4O2krKyl7UVJNYXRoLkVYUF9UQUJMRVtpXT0xPDxpO31cblx0Zm9yKHZhciBpPTg7aTwyNTY7aSsrKXtRUk1hdGguRVhQX1RBQkxFW2ldPVFSTWF0aC5FWFBfVEFCTEVbaS00XV5RUk1hdGguRVhQX1RBQkxFW2ktNV1eUVJNYXRoLkVYUF9UQUJMRVtpLTZdXlFSTWF0aC5FWFBfVEFCTEVbaS04XTt9XG5cdGZvcih2YXIgaT0wO2k8MjU1O2krKyl7UVJNYXRoLkxPR19UQUJMRVtRUk1hdGguRVhQX1RBQkxFW2ldXT1pO31cblx0ZnVuY3Rpb24gUVJQb2x5bm9taWFsKG51bSxzaGlmdCl7aWYobnVtLmxlbmd0aD09dW5kZWZpbmVkKXt0aHJvdyBuZXcgRXJyb3IobnVtLmxlbmd0aCtcIi9cIitzaGlmdCk7fVxuXHR2YXIgb2Zmc2V0PTA7d2hpbGUob2Zmc2V0PG51bS5sZW5ndGgmJm51bVtvZmZzZXRdPT0wKXtvZmZzZXQrKzt9XG5cdHRoaXMubnVtPW5ldyBBcnJheShudW0ubGVuZ3RoLW9mZnNldCtzaGlmdCk7Zm9yKHZhciBpPTA7aTxudW0ubGVuZ3RoLW9mZnNldDtpKyspe3RoaXMubnVtW2ldPW51bVtpK29mZnNldF07fX1cblx0UVJQb2x5bm9taWFsLnByb3RvdHlwZT17Z2V0OmZ1bmN0aW9uKGluZGV4KXtyZXR1cm4gdGhpcy5udW1baW5kZXhdO30sZ2V0TGVuZ3RoOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubnVtLmxlbmd0aDt9LG11bHRpcGx5OmZ1bmN0aW9uKGUpe3ZhciBudW09bmV3IEFycmF5KHRoaXMuZ2V0TGVuZ3RoKCkrZS5nZXRMZW5ndGgoKS0xKTtmb3IodmFyIGk9MDtpPHRoaXMuZ2V0TGVuZ3RoKCk7aSsrKXtmb3IodmFyIGo9MDtqPGUuZ2V0TGVuZ3RoKCk7aisrKXtudW1baStqXV49UVJNYXRoLmdleHAoUVJNYXRoLmdsb2codGhpcy5nZXQoaSkpK1FSTWF0aC5nbG9nKGUuZ2V0KGopKSk7fX1cblx0cmV0dXJuIG5ldyBRUlBvbHlub21pYWwobnVtLDApO30sbW9kOmZ1bmN0aW9uKGUpe2lmKHRoaXMuZ2V0TGVuZ3RoKCktZS5nZXRMZW5ndGgoKTwwKXtyZXR1cm4gdGhpczt9XG5cdHZhciByYXRpbz1RUk1hdGguZ2xvZyh0aGlzLmdldCgwKSktUVJNYXRoLmdsb2coZS5nZXQoMCkpO3ZhciBudW09bmV3IEFycmF5KHRoaXMuZ2V0TGVuZ3RoKCkpO2Zvcih2YXIgaT0wO2k8dGhpcy5nZXRMZW5ndGgoKTtpKyspe251bVtpXT10aGlzLmdldChpKTt9XG5cdGZvcih2YXIgaT0wO2k8ZS5nZXRMZW5ndGgoKTtpKyspe251bVtpXV49UVJNYXRoLmdleHAoUVJNYXRoLmdsb2coZS5nZXQoaSkpK3JhdGlvKTt9XG5cdHJldHVybiBuZXcgUVJQb2x5bm9taWFsKG51bSwwKS5tb2QoZSk7fX07ZnVuY3Rpb24gUVJSU0Jsb2NrKHRvdGFsQ291bnQsZGF0YUNvdW50KXt0aGlzLnRvdGFsQ291bnQ9dG90YWxDb3VudDt0aGlzLmRhdGFDb3VudD1kYXRhQ291bnQ7fVxuXHRRUlJTQmxvY2suUlNfQkxPQ0tfVEFCTEU9W1sxLDI2LDE5XSxbMSwyNiwxNl0sWzEsMjYsMTNdLFsxLDI2LDldLFsxLDQ0LDM0XSxbMSw0NCwyOF0sWzEsNDQsMjJdLFsxLDQ0LDE2XSxbMSw3MCw1NV0sWzEsNzAsNDRdLFsyLDM1LDE3XSxbMiwzNSwxM10sWzEsMTAwLDgwXSxbMiw1MCwzMl0sWzIsNTAsMjRdLFs0LDI1LDldLFsxLDEzNCwxMDhdLFsyLDY3LDQzXSxbMiwzMywxNSwyLDM0LDE2XSxbMiwzMywxMSwyLDM0LDEyXSxbMiw4Niw2OF0sWzQsNDMsMjddLFs0LDQzLDE5XSxbNCw0MywxNV0sWzIsOTgsNzhdLFs0LDQ5LDMxXSxbMiwzMiwxNCw0LDMzLDE1XSxbNCwzOSwxMywxLDQwLDE0XSxbMiwxMjEsOTddLFsyLDYwLDM4LDIsNjEsMzldLFs0LDQwLDE4LDIsNDEsMTldLFs0LDQwLDE0LDIsNDEsMTVdLFsyLDE0NiwxMTZdLFszLDU4LDM2LDIsNTksMzddLFs0LDM2LDE2LDQsMzcsMTddLFs0LDM2LDEyLDQsMzcsMTNdLFsyLDg2LDY4LDIsODcsNjldLFs0LDY5LDQzLDEsNzAsNDRdLFs2LDQzLDE5LDIsNDQsMjBdLFs2LDQzLDE1LDIsNDQsMTZdLFs0LDEwMSw4MV0sWzEsODAsNTAsNCw4MSw1MV0sWzQsNTAsMjIsNCw1MSwyM10sWzMsMzYsMTIsOCwzNywxM10sWzIsMTE2LDkyLDIsMTE3LDkzXSxbNiw1OCwzNiwyLDU5LDM3XSxbNCw0NiwyMCw2LDQ3LDIxXSxbNyw0MiwxNCw0LDQzLDE1XSxbNCwxMzMsMTA3XSxbOCw1OSwzNywxLDYwLDM4XSxbOCw0NCwyMCw0LDQ1LDIxXSxbMTIsMzMsMTEsNCwzNCwxMl0sWzMsMTQ1LDExNSwxLDE0NiwxMTZdLFs0LDY0LDQwLDUsNjUsNDFdLFsxMSwzNiwxNiw1LDM3LDE3XSxbMTEsMzYsMTIsNSwzNywxM10sWzUsMTA5LDg3LDEsMTEwLDg4XSxbNSw2NSw0MSw1LDY2LDQyXSxbNSw1NCwyNCw3LDU1LDI1XSxbMTEsMzYsMTJdLFs1LDEyMiw5OCwxLDEyMyw5OV0sWzcsNzMsNDUsMyw3NCw0Nl0sWzE1LDQzLDE5LDIsNDQsMjBdLFszLDQ1LDE1LDEzLDQ2LDE2XSxbMSwxMzUsMTA3LDUsMTM2LDEwOF0sWzEwLDc0LDQ2LDEsNzUsNDddLFsxLDUwLDIyLDE1LDUxLDIzXSxbMiw0MiwxNCwxNyw0MywxNV0sWzUsMTUwLDEyMCwxLDE1MSwxMjFdLFs5LDY5LDQzLDQsNzAsNDRdLFsxNyw1MCwyMiwxLDUxLDIzXSxbMiw0MiwxNCwxOSw0MywxNV0sWzMsMTQxLDExMyw0LDE0MiwxMTRdLFszLDcwLDQ0LDExLDcxLDQ1XSxbMTcsNDcsMjEsNCw0OCwyMl0sWzksMzksMTMsMTYsNDAsMTRdLFszLDEzNSwxMDcsNSwxMzYsMTA4XSxbMyw2Nyw0MSwxMyw2OCw0Ml0sWzE1LDU0LDI0LDUsNTUsMjVdLFsxNSw0MywxNSwxMCw0NCwxNl0sWzQsMTQ0LDExNiw0LDE0NSwxMTddLFsxNyw2OCw0Ml0sWzE3LDUwLDIyLDYsNTEsMjNdLFsxOSw0NiwxNiw2LDQ3LDE3XSxbMiwxMzksMTExLDcsMTQwLDExMl0sWzE3LDc0LDQ2XSxbNyw1NCwyNCwxNiw1NSwyNV0sWzM0LDM3LDEzXSxbNCwxNTEsMTIxLDUsMTUyLDEyMl0sWzQsNzUsNDcsMTQsNzYsNDhdLFsxMSw1NCwyNCwxNCw1NSwyNV0sWzE2LDQ1LDE1LDE0LDQ2LDE2XSxbNiwxNDcsMTE3LDQsMTQ4LDExOF0sWzYsNzMsNDUsMTQsNzQsNDZdLFsxMSw1NCwyNCwxNiw1NSwyNV0sWzMwLDQ2LDE2LDIsNDcsMTddLFs4LDEzMiwxMDYsNCwxMzMsMTA3XSxbOCw3NSw0NywxMyw3Niw0OF0sWzcsNTQsMjQsMjIsNTUsMjVdLFsyMiw0NSwxNSwxMyw0NiwxNl0sWzEwLDE0MiwxMTQsMiwxNDMsMTE1XSxbMTksNzQsNDYsNCw3NSw0N10sWzI4LDUwLDIyLDYsNTEsMjNdLFszMyw0NiwxNiw0LDQ3LDE3XSxbOCwxNTIsMTIyLDQsMTUzLDEyM10sWzIyLDczLDQ1LDMsNzQsNDZdLFs4LDUzLDIzLDI2LDU0LDI0XSxbMTIsNDUsMTUsMjgsNDYsMTZdLFszLDE0NywxMTcsMTAsMTQ4LDExOF0sWzMsNzMsNDUsMjMsNzQsNDZdLFs0LDU0LDI0LDMxLDU1LDI1XSxbMTEsNDUsMTUsMzEsNDYsMTZdLFs3LDE0NiwxMTYsNywxNDcsMTE3XSxbMjEsNzMsNDUsNyw3NCw0Nl0sWzEsNTMsMjMsMzcsNTQsMjRdLFsxOSw0NSwxNSwyNiw0NiwxNl0sWzUsMTQ1LDExNSwxMCwxNDYsMTE2XSxbMTksNzUsNDcsMTAsNzYsNDhdLFsxNSw1NCwyNCwyNSw1NSwyNV0sWzIzLDQ1LDE1LDI1LDQ2LDE2XSxbMTMsMTQ1LDExNSwzLDE0NiwxMTZdLFsyLDc0LDQ2LDI5LDc1LDQ3XSxbNDIsNTQsMjQsMSw1NSwyNV0sWzIzLDQ1LDE1LDI4LDQ2LDE2XSxbMTcsMTQ1LDExNV0sWzEwLDc0LDQ2LDIzLDc1LDQ3XSxbMTAsNTQsMjQsMzUsNTUsMjVdLFsxOSw0NSwxNSwzNSw0NiwxNl0sWzE3LDE0NSwxMTUsMSwxNDYsMTE2XSxbMTQsNzQsNDYsMjEsNzUsNDddLFsyOSw1NCwyNCwxOSw1NSwyNV0sWzExLDQ1LDE1LDQ2LDQ2LDE2XSxbMTMsMTQ1LDExNSw2LDE0NiwxMTZdLFsxNCw3NCw0NiwyMyw3NSw0N10sWzQ0LDU0LDI0LDcsNTUsMjVdLFs1OSw0NiwxNiwxLDQ3LDE3XSxbMTIsMTUxLDEyMSw3LDE1MiwxMjJdLFsxMiw3NSw0NywyNiw3Niw0OF0sWzM5LDU0LDI0LDE0LDU1LDI1XSxbMjIsNDUsMTUsNDEsNDYsMTZdLFs2LDE1MSwxMjEsMTQsMTUyLDEyMl0sWzYsNzUsNDcsMzQsNzYsNDhdLFs0Niw1NCwyNCwxMCw1NSwyNV0sWzIsNDUsMTUsNjQsNDYsMTZdLFsxNywxNTIsMTIyLDQsMTUzLDEyM10sWzI5LDc0LDQ2LDE0LDc1LDQ3XSxbNDksNTQsMjQsMTAsNTUsMjVdLFsyNCw0NSwxNSw0Niw0NiwxNl0sWzQsMTUyLDEyMiwxOCwxNTMsMTIzXSxbMTMsNzQsNDYsMzIsNzUsNDddLFs0OCw1NCwyNCwxNCw1NSwyNV0sWzQyLDQ1LDE1LDMyLDQ2LDE2XSxbMjAsMTQ3LDExNyw0LDE0OCwxMThdLFs0MCw3NSw0Nyw3LDc2LDQ4XSxbNDMsNTQsMjQsMjIsNTUsMjVdLFsxMCw0NSwxNSw2Nyw0NiwxNl0sWzE5LDE0OCwxMTgsNiwxNDksMTE5XSxbMTgsNzUsNDcsMzEsNzYsNDhdLFszNCw1NCwyNCwzNCw1NSwyNV0sWzIwLDQ1LDE1LDYxLDQ2LDE2XV07UVJSU0Jsb2NrLmdldFJTQmxvY2tzPWZ1bmN0aW9uKHR5cGVOdW1iZXIsZXJyb3JDb3JyZWN0TGV2ZWwpe3ZhciByc0Jsb2NrPVFSUlNCbG9jay5nZXRSc0Jsb2NrVGFibGUodHlwZU51bWJlcixlcnJvckNvcnJlY3RMZXZlbCk7aWYocnNCbG9jaz09dW5kZWZpbmVkKXt0aHJvdyBuZXcgRXJyb3IoXCJiYWQgcnMgYmxvY2sgQCB0eXBlTnVtYmVyOlwiK3R5cGVOdW1iZXIrXCIvZXJyb3JDb3JyZWN0TGV2ZWw6XCIrZXJyb3JDb3JyZWN0TGV2ZWwpO31cblx0dmFyIGxlbmd0aD1yc0Jsb2NrLmxlbmd0aC8zO3ZhciBsaXN0PVtdO2Zvcih2YXIgaT0wO2k8bGVuZ3RoO2krKyl7dmFyIGNvdW50PXJzQmxvY2tbaSozKzBdO3ZhciB0b3RhbENvdW50PXJzQmxvY2tbaSozKzFdO3ZhciBkYXRhQ291bnQ9cnNCbG9ja1tpKjMrMl07Zm9yKHZhciBqPTA7ajxjb3VudDtqKyspe2xpc3QucHVzaChuZXcgUVJSU0Jsb2NrKHRvdGFsQ291bnQsZGF0YUNvdW50KSk7fX1cblx0cmV0dXJuIGxpc3Q7fTtRUlJTQmxvY2suZ2V0UnNCbG9ja1RhYmxlPWZ1bmN0aW9uKHR5cGVOdW1iZXIsZXJyb3JDb3JyZWN0TGV2ZWwpe3N3aXRjaChlcnJvckNvcnJlY3RMZXZlbCl7Y2FzZSBRUkVycm9yQ29ycmVjdExldmVsLkw6cmV0dXJuIFFSUlNCbG9jay5SU19CTE9DS19UQUJMRVsodHlwZU51bWJlci0xKSo0KzBdO2Nhc2UgUVJFcnJvckNvcnJlY3RMZXZlbC5NOnJldHVybiBRUlJTQmxvY2suUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXItMSkqNCsxXTtjYXNlIFFSRXJyb3JDb3JyZWN0TGV2ZWwuUTpyZXR1cm4gUVJSU0Jsb2NrLlJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyLTEpKjQrMl07Y2FzZSBRUkVycm9yQ29ycmVjdExldmVsLkg6cmV0dXJuIFFSUlNCbG9jay5SU19CTE9DS19UQUJMRVsodHlwZU51bWJlci0xKSo0KzNdO2RlZmF1bHQ6cmV0dXJuIHVuZGVmaW5lZDt9fTtmdW5jdGlvbiBRUkJpdEJ1ZmZlcigpe3RoaXMuYnVmZmVyPVtdO3RoaXMubGVuZ3RoPTA7fVxuXHRRUkJpdEJ1ZmZlci5wcm90b3R5cGU9e2dldDpmdW5jdGlvbihpbmRleCl7dmFyIGJ1ZkluZGV4PU1hdGguZmxvb3IoaW5kZXgvOCk7cmV0dXJuKCh0aGlzLmJ1ZmZlcltidWZJbmRleF0+Pj4oNy1pbmRleCU4KSkmMSk9PTE7fSxwdXQ6ZnVuY3Rpb24obnVtLGxlbmd0aCl7Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXt0aGlzLnB1dEJpdCgoKG51bT4+PihsZW5ndGgtaS0xKSkmMSk9PTEpO319LGdldExlbmd0aEluQml0czpmdW5jdGlvbigpe3JldHVybiB0aGlzLmxlbmd0aDt9LHB1dEJpdDpmdW5jdGlvbihiaXQpe3ZhciBidWZJbmRleD1NYXRoLmZsb29yKHRoaXMubGVuZ3RoLzgpO2lmKHRoaXMuYnVmZmVyLmxlbmd0aDw9YnVmSW5kZXgpe3RoaXMuYnVmZmVyLnB1c2goMCk7fVxuXHRpZihiaXQpe3RoaXMuYnVmZmVyW2J1ZkluZGV4XXw9KDB4ODA+Pj4odGhpcy5sZW5ndGglOCkpO31cblx0dGhpcy5sZW5ndGgrKzt9fTt2YXIgUVJDb2RlTGltaXRMZW5ndGg9W1sxNywxNCwxMSw3XSxbMzIsMjYsMjAsMTRdLFs1Myw0MiwzMiwyNF0sWzc4LDYyLDQ2LDM0XSxbMTA2LDg0LDYwLDQ0XSxbMTM0LDEwNiw3NCw1OF0sWzE1NCwxMjIsODYsNjRdLFsxOTIsMTUyLDEwOCw4NF0sWzIzMCwxODAsMTMwLDk4XSxbMjcxLDIxMywxNTEsMTE5XSxbMzIxLDI1MSwxNzcsMTM3XSxbMzY3LDI4NywyMDMsMTU1XSxbNDI1LDMzMSwyNDEsMTc3XSxbNDU4LDM2MiwyNTgsMTk0XSxbNTIwLDQxMiwyOTIsMjIwXSxbNTg2LDQ1MCwzMjIsMjUwXSxbNjQ0LDUwNCwzNjQsMjgwXSxbNzE4LDU2MCwzOTQsMzEwXSxbNzkyLDYyNCw0NDIsMzM4XSxbODU4LDY2Niw0ODIsMzgyXSxbOTI5LDcxMSw1MDksNDAzXSxbMTAwMyw3NzksNTY1LDQzOV0sWzEwOTEsODU3LDYxMSw0NjFdLFsxMTcxLDkxMSw2NjEsNTExXSxbMTI3Myw5OTcsNzE1LDUzNV0sWzEzNjcsMTA1OSw3NTEsNTkzXSxbMTQ2NSwxMTI1LDgwNSw2MjVdLFsxNTI4LDExOTAsODY4LDY1OF0sWzE2MjgsMTI2NCw5MDgsNjk4XSxbMTczMiwxMzcwLDk4Miw3NDJdLFsxODQwLDE0NTIsMTAzMCw3OTBdLFsxOTUyLDE1MzgsMTExMiw4NDJdLFsyMDY4LDE2MjgsMTE2OCw4OThdLFsyMTg4LDE3MjIsMTIyOCw5NThdLFsyMzAzLDE4MDksMTI4Myw5ODNdLFsyNDMxLDE5MTEsMTM1MSwxMDUxXSxbMjU2MywxOTg5LDE0MjMsMTA5M10sWzI2OTksMjA5OSwxNDk5LDExMzldLFsyODA5LDIyMTMsMTU3OSwxMjE5XSxbMjk1MywyMzMxLDE2NjMsMTI3M11dO1xuXHRcblx0ZnVuY3Rpb24gX2lzU3VwcG9ydENhbnZhcygpIHtcblx0XHRyZXR1cm4gdHlwZW9mIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCAhPSBcInVuZGVmaW5lZFwiO1xuXHR9XG5cdFxuXHQvLyBhbmRyb2lkIDIueCBkb2Vzbid0IHN1cHBvcnQgRGF0YS1VUkkgc3BlY1xuXHRmdW5jdGlvbiBfZ2V0QW5kcm9pZCgpIHtcblx0XHR2YXIgYW5kcm9pZCA9IGZhbHNlO1xuXHRcdHZhciBzQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuXHRcdFxuXHRcdGlmICgvYW5kcm9pZC9pLnRlc3Qoc0FnZW50KSkgeyAvLyBhbmRyb2lkXG5cdFx0XHRhbmRyb2lkID0gdHJ1ZTtcblx0XHRcdHZhciBhTWF0ID0gc0FnZW50LnRvU3RyaW5nKCkubWF0Y2goL2FuZHJvaWQgKFswLTldXFwuWzAtOV0pL2kpO1xuXHRcdFx0XG5cdFx0XHRpZiAoYU1hdCAmJiBhTWF0WzFdKSB7XG5cdFx0XHRcdGFuZHJvaWQgPSBwYXJzZUZsb2F0KGFNYXRbMV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gYW5kcm9pZDtcblx0fVxuXHRcblx0dmFyIHN2Z0RyYXdlciA9IChmdW5jdGlvbigpIHtcblxuXHRcdHZhciBEcmF3aW5nID0gZnVuY3Rpb24gKGVsLCBodE9wdGlvbikge1xuXHRcdFx0dGhpcy5fZWwgPSBlbDtcblx0XHRcdHRoaXMuX2h0T3B0aW9uID0gaHRPcHRpb247XG5cdFx0fTtcblxuXHRcdERyYXdpbmcucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAob1FSQ29kZSkge1xuXHRcdFx0dmFyIF9odE9wdGlvbiA9IHRoaXMuX2h0T3B0aW9uO1xuXHRcdFx0dmFyIF9lbCA9IHRoaXMuX2VsO1xuXHRcdFx0dmFyIG5Db3VudCA9IG9RUkNvZGUuZ2V0TW9kdWxlQ291bnQoKTtcblx0XHRcdHZhciBuV2lkdGggPSBNYXRoLmZsb29yKF9odE9wdGlvbi53aWR0aCAvIG5Db3VudCk7XG5cdFx0XHR2YXIgbkhlaWdodCA9IE1hdGguZmxvb3IoX2h0T3B0aW9uLmhlaWdodCAvIG5Db3VudCk7XG5cblx0XHRcdHRoaXMuY2xlYXIoKTtcblxuXHRcdFx0ZnVuY3Rpb24gbWFrZVNWRyh0YWcsIGF0dHJzKSB7XG5cdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCB0YWcpO1xuXHRcdFx0XHRmb3IgKHZhciBrIGluIGF0dHJzKVxuXHRcdFx0XHRcdGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShrKSkgZWwuc2V0QXR0cmlidXRlKGssIGF0dHJzW2tdKTtcblx0XHRcdFx0cmV0dXJuIGVsO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc3ZnID0gbWFrZVNWRyhcInN2Z1wiICwgeyd2aWV3Qm94JzogJzAgMCAnICsgU3RyaW5nKG5Db3VudCkgKyBcIiBcIiArIFN0cmluZyhuQ291bnQpLCAnd2lkdGgnOiAnMTAwJScsICdoZWlnaHQnOiAnMTAwJScsICdmaWxsJzogX2h0T3B0aW9uLmNvbG9yTGlnaHR9KTtcblx0XHRcdHN2Zy5zZXRBdHRyaWJ1dGVOUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvXCIsIFwieG1sbnM6eGxpbmtcIiwgXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIpO1xuXHRcdFx0X2VsLmFwcGVuZENoaWxkKHN2Zyk7XG5cblx0XHRcdHN2Zy5hcHBlbmRDaGlsZChtYWtlU1ZHKFwicmVjdFwiLCB7XCJmaWxsXCI6IF9odE9wdGlvbi5jb2xvckxpZ2h0LCBcIndpZHRoXCI6IFwiMTAwJVwiLCBcImhlaWdodFwiOiBcIjEwMCVcIn0pKTtcblx0XHRcdHN2Zy5hcHBlbmRDaGlsZChtYWtlU1ZHKFwicmVjdFwiLCB7XCJmaWxsXCI6IF9odE9wdGlvbi5jb2xvckRhcmssIFwid2lkdGhcIjogXCIxXCIsIFwiaGVpZ2h0XCI6IFwiMVwiLCBcImlkXCI6IFwidGVtcGxhdGVcIn0pKTtcblxuXHRcdFx0Zm9yICh2YXIgcm93ID0gMDsgcm93IDwgbkNvdW50OyByb3crKykge1xuXHRcdFx0XHRmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBuQ291bnQ7IGNvbCsrKSB7XG5cdFx0XHRcdFx0aWYgKG9RUkNvZGUuaXNEYXJrKHJvdywgY29sKSkge1xuXHRcdFx0XHRcdFx0dmFyIGNoaWxkID0gbWFrZVNWRyhcInVzZVwiLCB7XCJ4XCI6IFN0cmluZyhyb3cpLCBcInlcIjogU3RyaW5nKGNvbCl9KTtcblx0XHRcdFx0XHRcdGNoaWxkLnNldEF0dHJpYnV0ZU5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLCBcImhyZWZcIiwgXCIjdGVtcGxhdGVcIilcblx0XHRcdFx0XHRcdHN2Zy5hcHBlbmRDaGlsZChjaGlsZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHREcmF3aW5nLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHdoaWxlICh0aGlzLl9lbC5oYXNDaGlsZE5vZGVzKCkpXG5cdFx0XHRcdHRoaXMuX2VsLnJlbW92ZUNoaWxkKHRoaXMuX2VsLmxhc3RDaGlsZCk7XG5cdFx0fTtcblx0XHRyZXR1cm4gRHJhd2luZztcblx0fSkoKTtcblxuXHR2YXIgdXNlU1ZHID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJzdmdcIjtcblxuXHQvLyBEcmF3aW5nIGluIERPTSBieSB1c2luZyBUYWJsZSB0YWdcblx0dmFyIERyYXdpbmcgPSB1c2VTVkcgPyBzdmdEcmF3ZXIgOiAhX2lzU3VwcG9ydENhbnZhcygpID8gKGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgRHJhd2luZyA9IGZ1bmN0aW9uIChlbCwgaHRPcHRpb24pIHtcblx0XHRcdHRoaXMuX2VsID0gZWw7XG5cdFx0XHR0aGlzLl9odE9wdGlvbiA9IGh0T3B0aW9uO1xuXHRcdH07XG5cdFx0XHRcblx0XHQvKipcblx0XHQgKiBEcmF3IHRoZSBRUkNvZGVcblx0XHQgKiBcblx0XHQgKiBAcGFyYW0ge1FSQ29kZX0gb1FSQ29kZVxuXHRcdCAqL1xuXHRcdERyYXdpbmcucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAob1FSQ29kZSkge1xuICAgICAgICAgICAgdmFyIF9odE9wdGlvbiA9IHRoaXMuX2h0T3B0aW9uO1xuICAgICAgICAgICAgdmFyIF9lbCA9IHRoaXMuX2VsO1xuXHRcdFx0dmFyIG5Db3VudCA9IG9RUkNvZGUuZ2V0TW9kdWxlQ291bnQoKTtcblx0XHRcdHZhciBuV2lkdGggPSBNYXRoLmZsb29yKF9odE9wdGlvbi53aWR0aCAvIG5Db3VudCk7XG5cdFx0XHR2YXIgbkhlaWdodCA9IE1hdGguZmxvb3IoX2h0T3B0aW9uLmhlaWdodCAvIG5Db3VudCk7XG5cdFx0XHR2YXIgYUhUTUwgPSBbJzx0YWJsZSBzdHlsZT1cImJvcmRlcjowO2JvcmRlci1jb2xsYXBzZTpjb2xsYXBzZTtcIj4nXTtcblx0XHRcdFxuXHRcdFx0Zm9yICh2YXIgcm93ID0gMDsgcm93IDwgbkNvdW50OyByb3crKykge1xuXHRcdFx0XHRhSFRNTC5wdXNoKCc8dHI+Jyk7XG5cdFx0XHRcdFxuXHRcdFx0XHRmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBuQ291bnQ7IGNvbCsrKSB7XG5cdFx0XHRcdFx0YUhUTUwucHVzaCgnPHRkIHN0eWxlPVwiYm9yZGVyOjA7Ym9yZGVyLWNvbGxhcHNlOmNvbGxhcHNlO3BhZGRpbmc6MDttYXJnaW46MDt3aWR0aDonICsgbldpZHRoICsgJ3B4O2hlaWdodDonICsgbkhlaWdodCArICdweDtiYWNrZ3JvdW5kLWNvbG9yOicgKyAob1FSQ29kZS5pc0Rhcmsocm93LCBjb2wpID8gX2h0T3B0aW9uLmNvbG9yRGFyayA6IF9odE9wdGlvbi5jb2xvckxpZ2h0KSArICc7XCI+PC90ZD4nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0YUhUTUwucHVzaCgnPC90cj4nKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0YUhUTUwucHVzaCgnPC90YWJsZT4nKTtcblx0XHRcdF9lbC5pbm5lckhUTUwgPSBhSFRNTC5qb2luKCcnKTtcblx0XHRcdFxuXHRcdFx0Ly8gRml4IHRoZSBtYXJnaW4gdmFsdWVzIGFzIHJlYWwgc2l6ZS5cblx0XHRcdHZhciBlbFRhYmxlID0gX2VsLmNoaWxkTm9kZXNbMF07XG5cdFx0XHR2YXIgbkxlZnRNYXJnaW5UYWJsZSA9IChfaHRPcHRpb24ud2lkdGggLSBlbFRhYmxlLm9mZnNldFdpZHRoKSAvIDI7XG5cdFx0XHR2YXIgblRvcE1hcmdpblRhYmxlID0gKF9odE9wdGlvbi5oZWlnaHQgLSBlbFRhYmxlLm9mZnNldEhlaWdodCkgLyAyO1xuXHRcdFx0XG5cdFx0XHRpZiAobkxlZnRNYXJnaW5UYWJsZSA+IDAgJiYgblRvcE1hcmdpblRhYmxlID4gMCkge1xuXHRcdFx0XHRlbFRhYmxlLnN0eWxlLm1hcmdpbiA9IG5Ub3BNYXJnaW5UYWJsZSArIFwicHggXCIgKyBuTGVmdE1hcmdpblRhYmxlICsgXCJweFwiO1x0XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRcblx0XHQvKipcblx0XHQgKiBDbGVhciB0aGUgUVJDb2RlXG5cdFx0ICovXG5cdFx0RHJhd2luZy5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aGlzLl9lbC5pbm5lckhUTUwgPSAnJztcblx0XHR9O1xuXHRcdFxuXHRcdHJldHVybiBEcmF3aW5nO1xuXHR9KSgpIDogKGZ1bmN0aW9uICgpIHsgLy8gRHJhd2luZyBpbiBDYW52YXNcblx0XHRmdW5jdGlvbiBfb25NYWtlSW1hZ2UoKSB7XG5cdFx0XHR0aGlzLl9lbEltYWdlLnNyYyA9IHRoaXMuX2VsQ2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcblx0XHRcdHRoaXMuX2VsSW1hZ2Uuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcblx0XHRcdHRoaXMuX2VsQ2FudmFzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0Ly8gQW5kcm9pZCAyLjEgYnVnIHdvcmthcm91bmRcblx0XHQvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvYW5kcm9pZC9pc3N1ZXMvZGV0YWlsP2lkPTUxNDFcblx0XHRpZiAodGhpcy5fYW5kcm9pZCAmJiB0aGlzLl9hbmRyb2lkIDw9IDIuMSkge1xuXHQgICAgXHR2YXIgZmFjdG9yID0gMSAvIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuXHQgICAgICAgIHZhciBkcmF3SW1hZ2UgPSBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQucHJvdG90eXBlLmRyYXdJbWFnZTsgXG5cdCAgICBcdENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC5wcm90b3R5cGUuZHJhd0ltYWdlID0gZnVuY3Rpb24gKGltYWdlLCBzeCwgc3ksIHN3LCBzaCwgZHgsIGR5LCBkdywgZGgpIHtcblx0ICAgIFx0XHRpZiAoKFwibm9kZU5hbWVcIiBpbiBpbWFnZSkgJiYgL2ltZy9pLnRlc3QoaW1hZ2Uubm9kZU5hbWUpKSB7XG5cdFx0ICAgICAgICBcdGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAxOyBpLS0pIHtcblx0XHQgICAgICAgICAgICBcdGFyZ3VtZW50c1tpXSA9IGFyZ3VtZW50c1tpXSAqIGZhY3Rvcjtcblx0XHQgICAgICAgIFx0fVxuXHQgICAgXHRcdH0gZWxzZSBpZiAodHlwZW9mIGR3ID09IFwidW5kZWZpbmVkXCIpIHtcblx0ICAgIFx0XHRcdGFyZ3VtZW50c1sxXSAqPSBmYWN0b3I7XG5cdCAgICBcdFx0XHRhcmd1bWVudHNbMl0gKj0gZmFjdG9yO1xuXHQgICAgXHRcdFx0YXJndW1lbnRzWzNdICo9IGZhY3Rvcjtcblx0ICAgIFx0XHRcdGFyZ3VtZW50c1s0XSAqPSBmYWN0b3I7XG5cdCAgICBcdFx0fVxuXHQgICAgXHRcdFxuXHQgICAgICAgIFx0ZHJhd0ltYWdlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IFxuXHQgICAgXHR9O1xuXHRcdH1cblx0XHRcblx0XHQvKipcblx0XHQgKiBDaGVjayB3aGV0aGVyIHRoZSB1c2VyJ3MgYnJvd3NlciBzdXBwb3J0cyBEYXRhIFVSSSBvciBub3Rcblx0XHQgKiBcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEBwYXJhbSB7RnVuY3Rpb259IGZTdWNjZXNzIE9jY3VycyBpZiBpdCBzdXBwb3J0cyBEYXRhIFVSSVxuXHRcdCAqIEBwYXJhbSB7RnVuY3Rpb259IGZGYWlsIE9jY3VycyBpZiBpdCBkb2Vzbid0IHN1cHBvcnQgRGF0YSBVUklcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfc2FmZVNldERhdGFVUkkoZlN1Y2Nlc3MsIGZGYWlsKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBzZWxmLl9mRmFpbCA9IGZGYWlsO1xuICAgICAgICAgICAgc2VsZi5fZlN1Y2Nlc3MgPSBmU3VjY2VzcztcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaXQganVzdCBvbmNlXG4gICAgICAgICAgICBpZiAoc2VsZi5fYlN1cHBvcnREYXRhVVJJID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgICAgICAgICB2YXIgZk9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fYlN1cHBvcnREYXRhVVJJID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuX2ZGYWlsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9mRmFpbC5jYWxsKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgZk9uU3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9iU3VwcG9ydERhdGFVUkkgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLl9mU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fZlN1Y2Nlc3MuY2FsbChzZWxmKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBlbC5vbmFib3J0ID0gZk9uRXJyb3I7XG4gICAgICAgICAgICAgICAgZWwub25lcnJvciA9IGZPbkVycm9yO1xuICAgICAgICAgICAgICAgIGVsLm9ubG9hZCA9IGZPblN1Y2Nlc3M7XG4gICAgICAgICAgICAgICAgZWwuc3JjID0gXCJkYXRhOmltYWdlL2dpZjtiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFVQUFBQUZDQVlBQUFDTmJ5YmxBQUFBSEVsRVFWUUkxMlA0Ly84L3czOEdJQVhESUJLRTBESHhnbGpOQkFBTzlUWEwwWTRPSHdBQUFBQkpSVTVFcmtKZ2dnPT1cIjsgLy8gdGhlIEltYWdlIGNvbnRhaW5zIDFweCBkYXRhLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZi5fYlN1cHBvcnREYXRhVVJJID09PSB0cnVlICYmIHNlbGYuX2ZTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZlN1Y2Nlc3MuY2FsbChzZWxmKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VsZi5fYlN1cHBvcnREYXRhVVJJID09PSBmYWxzZSAmJiBzZWxmLl9mRmFpbCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2ZGYWlsLmNhbGwoc2VsZik7XG4gICAgICAgICAgICB9XG5cdFx0fTtcblx0XHRcblx0XHQvKipcblx0XHQgKiBEcmF3aW5nIFFSQ29kZSBieSB1c2luZyBjYW52YXNcblx0XHQgKiBcblx0XHQgKiBAY29uc3RydWN0b3Jcblx0XHQgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbFxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBodE9wdGlvbiBRUkNvZGUgT3B0aW9ucyBcblx0XHQgKi9cblx0XHR2YXIgRHJhd2luZyA9IGZ1bmN0aW9uIChlbCwgaHRPcHRpb24pIHtcbiAgICBcdFx0dGhpcy5fYklzUGFpbnRlZCA9IGZhbHNlO1xuICAgIFx0XHR0aGlzLl9hbmRyb2lkID0gX2dldEFuZHJvaWQoKTtcblx0XHRcblx0XHRcdHRoaXMuX2h0T3B0aW9uID0gaHRPcHRpb247XG5cdFx0XHR0aGlzLl9lbENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG5cdFx0XHR0aGlzLl9lbENhbnZhcy53aWR0aCA9IGh0T3B0aW9uLndpZHRoO1xuXHRcdFx0dGhpcy5fZWxDYW52YXMuaGVpZ2h0ID0gaHRPcHRpb24uaGVpZ2h0O1xuXHRcdFx0ZWwuYXBwZW5kQ2hpbGQodGhpcy5fZWxDYW52YXMpO1xuXHRcdFx0dGhpcy5fZWwgPSBlbDtcblx0XHRcdHRoaXMuX29Db250ZXh0ID0gdGhpcy5fZWxDYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdFx0dGhpcy5fYklzUGFpbnRlZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5fZWxJbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG5cdFx0XHR0aGlzLl9lbEltYWdlLmFsdCA9IFwiU2NhbiBtZSFcIjtcblx0XHRcdHRoaXMuX2VsSW1hZ2Uuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXHRcdFx0dGhpcy5fZWwuYXBwZW5kQ2hpbGQodGhpcy5fZWxJbWFnZSk7XG5cdFx0XHR0aGlzLl9iU3VwcG9ydERhdGFVUkkgPSBudWxsO1xuXHRcdH07XG5cdFx0XHRcblx0XHQvKipcblx0XHQgKiBEcmF3IHRoZSBRUkNvZGVcblx0XHQgKiBcblx0XHQgKiBAcGFyYW0ge1FSQ29kZX0gb1FSQ29kZSBcblx0XHQgKi9cblx0XHREcmF3aW5nLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKG9RUkNvZGUpIHtcbiAgICAgICAgICAgIHZhciBfZWxJbWFnZSA9IHRoaXMuX2VsSW1hZ2U7XG4gICAgICAgICAgICB2YXIgX29Db250ZXh0ID0gdGhpcy5fb0NvbnRleHQ7XG4gICAgICAgICAgICB2YXIgX2h0T3B0aW9uID0gdGhpcy5faHRPcHRpb247XG4gICAgICAgICAgICBcblx0XHRcdHZhciBuQ291bnQgPSBvUVJDb2RlLmdldE1vZHVsZUNvdW50KCk7XG5cdFx0XHR2YXIgbldpZHRoID0gX2h0T3B0aW9uLndpZHRoIC8gbkNvdW50O1xuXHRcdFx0dmFyIG5IZWlnaHQgPSBfaHRPcHRpb24uaGVpZ2h0IC8gbkNvdW50O1xuXHRcdFx0dmFyIG5Sb3VuZGVkV2lkdGggPSBNYXRoLnJvdW5kKG5XaWR0aCk7XG5cdFx0XHR2YXIgblJvdW5kZWRIZWlnaHQgPSBNYXRoLnJvdW5kKG5IZWlnaHQpO1xuXG5cdFx0XHRfZWxJbWFnZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cdFx0XHR0aGlzLmNsZWFyKCk7XG5cdFx0XHRcblx0XHRcdGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG5Db3VudDsgcm93KyspIHtcblx0XHRcdFx0Zm9yICh2YXIgY29sID0gMDsgY29sIDwgbkNvdW50OyBjb2wrKykge1xuXHRcdFx0XHRcdHZhciBiSXNEYXJrID0gb1FSQ29kZS5pc0Rhcmsocm93LCBjb2wpO1xuXHRcdFx0XHRcdHZhciBuTGVmdCA9IGNvbCAqIG5XaWR0aDtcblx0XHRcdFx0XHR2YXIgblRvcCA9IHJvdyAqIG5IZWlnaHQ7XG5cdFx0XHRcdFx0X29Db250ZXh0LnN0cm9rZVN0eWxlID0gYklzRGFyayA/IF9odE9wdGlvbi5jb2xvckRhcmsgOiBfaHRPcHRpb24uY29sb3JMaWdodDtcblx0XHRcdFx0XHRfb0NvbnRleHQubGluZVdpZHRoID0gMTtcblx0XHRcdFx0XHRfb0NvbnRleHQuZmlsbFN0eWxlID0gYklzRGFyayA/IF9odE9wdGlvbi5jb2xvckRhcmsgOiBfaHRPcHRpb24uY29sb3JMaWdodDtcdFx0XHRcdFx0XG5cdFx0XHRcdFx0X29Db250ZXh0LmZpbGxSZWN0KG5MZWZ0LCBuVG9wLCBuV2lkdGgsIG5IZWlnaHQpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIOyViO2LsCDslajrpqzslrTsi7Eg67Cp7KeAIOyymOumrFxuXHRcdFx0XHRcdF9vQ29udGV4dC5zdHJva2VSZWN0KFxuXHRcdFx0XHRcdFx0TWF0aC5mbG9vcihuTGVmdCkgKyAwLjUsXG5cdFx0XHRcdFx0XHRNYXRoLmZsb29yKG5Ub3ApICsgMC41LFxuXHRcdFx0XHRcdFx0blJvdW5kZWRXaWR0aCxcblx0XHRcdFx0XHRcdG5Sb3VuZGVkSGVpZ2h0XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRfb0NvbnRleHQuc3Ryb2tlUmVjdChcblx0XHRcdFx0XHRcdE1hdGguY2VpbChuTGVmdCkgLSAwLjUsXG5cdFx0XHRcdFx0XHRNYXRoLmNlaWwoblRvcCkgLSAwLjUsXG5cdFx0XHRcdFx0XHRuUm91bmRlZFdpZHRoLFxuXHRcdFx0XHRcdFx0blJvdW5kZWRIZWlnaHRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHRoaXMuX2JJc1BhaW50ZWQgPSB0cnVlO1xuXHRcdH07XG5cdFx0XHRcblx0XHQvKipcblx0XHQgKiBNYWtlIHRoZSBpbWFnZSBmcm9tIENhbnZhcyBpZiB0aGUgYnJvd3NlciBzdXBwb3J0cyBEYXRhIFVSSS5cblx0XHQgKi9cblx0XHREcmF3aW5nLnByb3RvdHlwZS5tYWtlSW1hZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAodGhpcy5fYklzUGFpbnRlZCkge1xuXHRcdFx0XHRfc2FmZVNldERhdGFVUkkuY2FsbCh0aGlzLCBfb25NYWtlSW1hZ2UpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0XHRcblx0XHQvKipcblx0XHQgKiBSZXR1cm4gd2hldGhlciB0aGUgUVJDb2RlIGlzIHBhaW50ZWQgb3Igbm90XG5cdFx0ICogXG5cdFx0ICogQHJldHVybiB7Qm9vbGVhbn1cblx0XHQgKi9cblx0XHREcmF3aW5nLnByb3RvdHlwZS5pc1BhaW50ZWQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYklzUGFpbnRlZDtcblx0XHR9O1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIENsZWFyIHRoZSBRUkNvZGVcblx0XHQgKi9cblx0XHREcmF3aW5nLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHRoaXMuX29Db250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLl9lbENhbnZhcy53aWR0aCwgdGhpcy5fZWxDYW52YXMuaGVpZ2h0KTtcblx0XHRcdHRoaXMuX2JJc1BhaW50ZWQgPSBmYWxzZTtcblx0XHR9O1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IG5OdW1iZXJcblx0XHQgKi9cblx0XHREcmF3aW5nLnByb3RvdHlwZS5yb3VuZCA9IGZ1bmN0aW9uIChuTnVtYmVyKSB7XG5cdFx0XHRpZiAoIW5OdW1iZXIpIHtcblx0XHRcdFx0cmV0dXJuIG5OdW1iZXI7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKG5OdW1iZXIgKiAxMDAwKSAvIDEwMDA7XG5cdFx0fTtcblx0XHRcblx0XHRyZXR1cm4gRHJhd2luZztcblx0fSkoKTtcblx0XG5cdC8qKlxuXHQgKiBHZXQgdGhlIHR5cGUgYnkgc3RyaW5nIGxlbmd0aFxuXHQgKiBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHNUZXh0XG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBuQ29ycmVjdExldmVsXG5cdCAqIEByZXR1cm4ge051bWJlcn0gdHlwZVxuXHQgKi9cblx0ZnVuY3Rpb24gX2dldFR5cGVOdW1iZXIoc1RleHQsIG5Db3JyZWN0TGV2ZWwpIHtcdFx0XHRcblx0XHR2YXIgblR5cGUgPSAxO1xuXHRcdHZhciBsZW5ndGggPSBfZ2V0VVRGOExlbmd0aChzVGV4dCk7XG5cdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IFFSQ29kZUxpbWl0TGVuZ3RoLmxlbmd0aDsgaSA8PSBsZW47IGkrKykge1xuXHRcdFx0dmFyIG5MaW1pdCA9IDA7XG5cdFx0XHRcblx0XHRcdHN3aXRjaCAobkNvcnJlY3RMZXZlbCkge1xuXHRcdFx0XHRjYXNlIFFSRXJyb3JDb3JyZWN0TGV2ZWwuTCA6XG5cdFx0XHRcdFx0bkxpbWl0ID0gUVJDb2RlTGltaXRMZW5ndGhbaV1bMF07XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgUVJFcnJvckNvcnJlY3RMZXZlbC5NIDpcblx0XHRcdFx0XHRuTGltaXQgPSBRUkNvZGVMaW1pdExlbmd0aFtpXVsxXTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBRUkVycm9yQ29ycmVjdExldmVsLlEgOlxuXHRcdFx0XHRcdG5MaW1pdCA9IFFSQ29kZUxpbWl0TGVuZ3RoW2ldWzJdO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFFSRXJyb3JDb3JyZWN0TGV2ZWwuSCA6XG5cdFx0XHRcdFx0bkxpbWl0ID0gUVJDb2RlTGltaXRMZW5ndGhbaV1bM107XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmIChsZW5ndGggPD0gbkxpbWl0KSB7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0blR5cGUrKztcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0aWYgKG5UeXBlID4gUVJDb2RlTGltaXRMZW5ndGgubGVuZ3RoKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUb28gbG9uZyBkYXRhXCIpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gblR5cGU7XG5cdH1cblxuXHRmdW5jdGlvbiBfZ2V0VVRGOExlbmd0aChzVGV4dCkge1xuXHRcdHZhciByZXBsYWNlZFRleHQgPSBlbmNvZGVVUkkoc1RleHQpLnRvU3RyaW5nKCkucmVwbGFjZSgvXFwlWzAtOWEtZkEtRl17Mn0vZywgJ2EnKTtcblx0XHRyZXR1cm4gcmVwbGFjZWRUZXh0Lmxlbmd0aCArIChyZXBsYWNlZFRleHQubGVuZ3RoICE9IHNUZXh0ID8gMyA6IDApO1xuXHR9XG5cdFxuXHQvKipcblx0ICogQGNsYXNzIFFSQ29kZVxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQGV4YW1wbGUgXG5cdCAqIG5ldyBRUkNvZGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0ZXN0XCIpLCBcImh0dHA6Ly9qaW5kby5kZXYubmF2ZXIuY29tL2NvbGxpZVwiKTtcblx0ICpcblx0ICogQGV4YW1wbGVcblx0ICogdmFyIG9RUkNvZGUgPSBuZXcgUVJDb2RlKFwidGVzdFwiLCB7XG5cdCAqICAgIHRleHQgOiBcImh0dHA6Ly9uYXZlci5jb21cIixcblx0ICogICAgd2lkdGggOiAxMjgsXG5cdCAqICAgIGhlaWdodCA6IDEyOFxuXHQgKiB9KTtcblx0ICogXG5cdCAqIG9RUkNvZGUuY2xlYXIoKTsgLy8gQ2xlYXIgdGhlIFFSQ29kZS5cblx0ICogb1FSQ29kZS5tYWtlQ29kZShcImh0dHA6Ly9tYXAubmF2ZXIuY29tXCIpOyAvLyBSZS1jcmVhdGUgdGhlIFFSQ29kZS5cblx0ICpcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudHxTdHJpbmd9IGVsIHRhcmdldCBlbGVtZW50IG9yICdpZCcgYXR0cmlidXRlIG9mIGVsZW1lbnQuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdk9wdGlvblxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdk9wdGlvbi50ZXh0IFFSQ29kZSBsaW5rIGRhdGFcblx0ICogQHBhcmFtIHtOdW1iZXJ9IFt2T3B0aW9uLndpZHRoPTI1Nl1cblx0ICogQHBhcmFtIHtOdW1iZXJ9IFt2T3B0aW9uLmhlaWdodD0yNTZdXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBbdk9wdGlvbi5jb2xvckRhcms9XCIjMDAwMDAwXCJdXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBbdk9wdGlvbi5jb2xvckxpZ2h0PVwiI2ZmZmZmZlwiXVxuXHQgKiBAcGFyYW0ge1FSQ29kZS5Db3JyZWN0TGV2ZWx9IFt2T3B0aW9uLmNvcnJlY3RMZXZlbD1RUkNvZGUuQ29ycmVjdExldmVsLkhdIFtMfE18UXxIXSBcblx0ICovXG5cdFFSQ29kZSA9IGZ1bmN0aW9uIChlbCwgdk9wdGlvbikge1xuXHRcdHRoaXMuX2h0T3B0aW9uID0ge1xuXHRcdFx0d2lkdGggOiAyNTYsIFxuXHRcdFx0aGVpZ2h0IDogMjU2LFxuXHRcdFx0dHlwZU51bWJlciA6IDQsXG5cdFx0XHRjb2xvckRhcmsgOiBcIiMwMDAwMDBcIixcblx0XHRcdGNvbG9yTGlnaHQgOiBcIiNmZmZmZmZcIixcblx0XHRcdGNvcnJlY3RMZXZlbCA6IFFSRXJyb3JDb3JyZWN0TGV2ZWwuSFxuXHRcdH07XG5cdFx0XG5cdFx0aWYgKHR5cGVvZiB2T3B0aW9uID09PSAnc3RyaW5nJykge1xuXHRcdFx0dk9wdGlvblx0PSB7XG5cdFx0XHRcdHRleHQgOiB2T3B0aW9uXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRcblx0XHQvLyBPdmVyd3JpdGVzIG9wdGlvbnNcblx0XHRpZiAodk9wdGlvbikge1xuXHRcdFx0Zm9yICh2YXIgaSBpbiB2T3B0aW9uKSB7XG5cdFx0XHRcdHRoaXMuX2h0T3B0aW9uW2ldID0gdk9wdGlvbltpXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0aWYgKHR5cGVvZiBlbCA9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5faHRPcHRpb24udXNlU1ZHKSB7XG5cdFx0XHREcmF3aW5nID0gc3ZnRHJhd2VyO1xuXHRcdH1cblx0XHRcblx0XHR0aGlzLl9hbmRyb2lkID0gX2dldEFuZHJvaWQoKTtcblx0XHR0aGlzLl9lbCA9IGVsO1xuXHRcdHRoaXMuX29RUkNvZGUgPSBudWxsO1xuXHRcdHRoaXMuX29EcmF3aW5nID0gbmV3IERyYXdpbmcodGhpcy5fZWwsIHRoaXMuX2h0T3B0aW9uKTtcblx0XHRcblx0XHRpZiAodGhpcy5faHRPcHRpb24udGV4dCkge1xuXHRcdFx0dGhpcy5tYWtlQ29kZSh0aGlzLl9odE9wdGlvbi50ZXh0KTtcdFxuXHRcdH1cblx0fTtcblx0XG5cdC8qKlxuXHQgKiBNYWtlIHRoZSBRUkNvZGVcblx0ICogXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzVGV4dCBsaW5rIGRhdGFcblx0ICovXG5cdFFSQ29kZS5wcm90b3R5cGUubWFrZUNvZGUgPSBmdW5jdGlvbiAoc1RleHQpIHtcblx0XHR0aGlzLl9vUVJDb2RlID0gbmV3IFFSQ29kZU1vZGVsKF9nZXRUeXBlTnVtYmVyKHNUZXh0LCB0aGlzLl9odE9wdGlvbi5jb3JyZWN0TGV2ZWwpLCB0aGlzLl9odE9wdGlvbi5jb3JyZWN0TGV2ZWwpO1xuXHRcdHRoaXMuX29RUkNvZGUuYWRkRGF0YShzVGV4dCk7XG5cdFx0dGhpcy5fb1FSQ29kZS5tYWtlKCk7XG5cdFx0dGhpcy5fZWwudGl0bGUgPSBzVGV4dDtcblx0XHR0aGlzLl9vRHJhd2luZy5kcmF3KHRoaXMuX29RUkNvZGUpO1x0XHRcdFxuXHRcdHRoaXMubWFrZUltYWdlKCk7XG5cdH07XG5cdFxuXHQvKipcblx0ICogTWFrZSB0aGUgSW1hZ2UgZnJvbSBDYW52YXMgZWxlbWVudFxuXHQgKiAtIEl0IG9jY3VycyBhdXRvbWF0aWNhbGx5XG5cdCAqIC0gQW5kcm9pZCBiZWxvdyAzIGRvZXNuJ3Qgc3VwcG9ydCBEYXRhLVVSSSBzcGVjLlxuXHQgKiBcblx0ICogQHByaXZhdGVcblx0ICovXG5cdFFSQ29kZS5wcm90b3R5cGUubWFrZUltYWdlID0gZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0eXBlb2YgdGhpcy5fb0RyYXdpbmcubWFrZUltYWdlID09IFwiZnVuY3Rpb25cIiAmJiAoIXRoaXMuX2FuZHJvaWQgfHwgdGhpcy5fYW5kcm9pZCA+PSAzKSkge1xuXHRcdFx0dGhpcy5fb0RyYXdpbmcubWFrZUltYWdlKCk7XG5cdFx0fVxuXHR9O1xuXHRcblx0LyoqXG5cdCAqIENsZWFyIHRoZSBRUkNvZGVcblx0ICovXG5cdFFSQ29kZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5fb0RyYXdpbmcuY2xlYXIoKTtcblx0fTtcblx0XG5cdC8qKlxuXHQgKiBAbmFtZSBRUkNvZGUuQ29ycmVjdExldmVsXG5cdCAqL1xuXHRRUkNvZGUuQ29ycmVjdExldmVsID0gUVJFcnJvckNvcnJlY3RMZXZlbDtcbn0pKCk7XG5cbjsgYnJvd3NlcmlmeV9zaGltX19kZWZpbmVfX21vZHVsZV9fZXhwb3J0X18odHlwZW9mIFFSQ29kZSAhPSBcInVuZGVmaW5lZFwiID8gUVJDb2RlIDogd2luZG93LlFSQ29kZSk7XG5cbn0pLmNhbGwoZ2xvYmFsLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZ1bmN0aW9uIGRlZmluZUV4cG9ydChleCkgeyBtb2R1bGUuZXhwb3J0cyA9IGV4OyB9KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwidmFyIGV4cGVjdCA9IGNoYWkuZXhwZWN0O1xudmFyIFNLID0gcmVxdWlyZSgnLi4vanMvc2hhcmVLaXQuanMnKTtcbmRlc2NyaWJlKCdTaGFyZSBLaXQnLCBmdW5jdGlvbigpe1xuICAgIGRlc2NyaWJlKCdUZXN0IFVybCBDb25jYXQnLCBmdW5jdGlvbigpe1xuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiBlbmNvZGUgdXJsJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBzcmMgPSBTSy5wcm90b3R5cGUudXJsQ29uY2F0KHtcbiAgICAgICAgICAgICAgICBhOidhJyxcbiAgICAgICAgICAgICAgICBiOidiYlxcL1xcLycsXG4gICAgICAgICAgICAgICAgYzogJzEyMz8/JScsXG4gICAgICAgICAgICAgICAgZDogNzc3LFxuICAgICAgICAgICAgICAgIGU6Jzg4OCdcbiAgICAgICAgICAgIH0sICdodHRwOi8vd3d3LmJhaWR1LmNvbScpO1xuICAgICAgICAgICAgdmFyIGRlc3QgPSAnaHR0cDovL3d3dy5iYWlkdS5jb20/JysnYT1hJmI9YmJcXC9cXC8mYz0xMjM/PyUmZD03NzcmZT04ODgnO1xuXG4gICAgICAgICAgICBleHBlY3Qoc3JjKS50by5ub3QuZXF1YWwoZGVzdCk7XG4gICAgICAgICAgICBleHBlY3QoZGVjb2RlVVJJQ29tcG9uZW50KHNyYykpLnRvLmVxdWFsKGRlc3QpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdyZXNvdXJjZSBkZXRlY3QnLCBmdW5jdGlvbigpe1xuICAgICAgICBpdCgnc2hvdWxkIGRldGVjdCB1cmwgaGFzIGZyb21wYyBxdWVyeSBzdHJpbmcgb3Igbm90ICcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgdXJsID0gbG9jYXRpb24uaHJlZjtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHVybC5pbmRleE9mKCc/Jyk7XG4gICAgICAgICAgICBpZihpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZSA9IFNLLnByb3RvdHlwZS5kZXRlY3RGcm9tKHVybCsnP2Zyb21wYz10cnVlJyk7XG4gICAgICAgICAgICBleHBlY3QocmUpLnRvLmVxdWFsKHRydWUpO1xuXG4gICAgICAgICAgICByZSA9IFNLLnByb3RvdHlwZS5kZXRlY3RGcm9tKHVybCk7XG4gICAgICAgICAgICBleHBlY3QocmUpLnRvLmVxdWFsKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgZGVzY3JpYmUoJ1NLIE9iamVjdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBldnQ7XG4gICAgICAgIGJlZm9yZUVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50Jyk7XG4gICAgICAgICAgICBldnQuaW5pdEV2ZW50KCdjbGljaycsIHRydWUsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgZGVzY3JpYmUoJ1NLIENvbmZpZ3VyYXRpb24gVGVzdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpdCgnU2hvdWxkIGVtcHR5IG9iamVjdCBoYXMgZGVmYXVsdCBvcHRpb25zJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgc2sgPSBuZXcgU0soKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2spLnRvLm5vdC5iZS5hbigndW5kZWZpbmVkJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLnRpdGxlKS50by5lcXVhbChkb2N1bWVudC50aXRsZSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLmxpbmspLnRvLmVxdWFsKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChzay5iYXNlQ29uZi5kZXNjKS50by5lcXVhbChTSy5wcm90b3R5cGUuZmluZERlc2MoKSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLnR3aXR0ZXJOYW1lKS50by5iZS5hbigndW5kZWZpbmVkJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLnByZWZpeCkudG8uZXF1YWwoJ3NoYXJlS2l0Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdTaG91bGQgb2JqZWN0IHdpdGggY29uZmlndXJhdGlvbiBoYXMgc29tZSBvcHRpb25zJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICd0aXRsZScsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6ICdodHRwOi8vYmFpZHUuY29tJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzYzogJ1RvZGF5IGlzblxcJyBhbm90aGVyIGRheS4nLFxuICAgICAgICAgICAgICAgICAgICB0d2l0dGVyTmFtZTogJ3N1bmFpd2VuJ1xuICAgICAgICAgICAgICAgICAgICAvL3ByZWZpeDogJ3lveW95bydcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSyhvKTtcblxuICAgICAgICAgICAgICAgIGV4cGVjdChzay5iYXNlQ29uZi50aXRsZSkudG8uZXF1YWwoby50aXRsZSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLmxpbmspLnRvLmVxdWFsKG8ubGluayk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLmRlc2MpLnRvLmVxdWFsKG8uZGVzYyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLnR3aXR0ZXJOYW1lKS50by5lcXVhbChvLnR3aXR0ZXJOYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZGVzY3JpYmUoJ1NLIGluaXQgZnVuY3Rpb24gVGVzdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgc2sgPSBuZXcgU0soKTtcbiAgICAgICAgICAgIGl0KCdTaG91bGQgaGF2ZSBlbGVtZW50IGFuZCBjb3JyZWN0IHByZWZpeCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLndyYXBFbGUuY2xhc3NOYW1lLmluZGV4T2YoJ2pzLScrc2suYmFzZUNvbmYucHJlZml4KSkudG8ubm90LmVxdWFsKC0xKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2sucXpFbGUuY2xhc3NOYW1lLmluZGV4T2YoJ2pzLScrc2suYmFzZUNvbmYucHJlZml4KyctcXpvbmUnKSkudG8ubm90LmVxdWFsKC0xKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBiaW5kIGEgZXZlbnQgY29ycmVjdGx5JywgZnVuY3Rpb24oZG9uZSl7XG4gICAgICAgICAgICAgICAgdmFyIHIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgaGFuZGxlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHIgPSAnZmlyZSc7XG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdChyKS50by5lcXVhbCgnZmlyZScpO1xuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzay5iaW5kKHNrLnF6RWxlLCBoYW5kbGVyKTtcbiAgICAgICAgICAgICAgICBzay5xekVsZS5kaXNwYXRjaEV2ZW50KGV2dCwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRlc2NyaWJlKCdTSyBDb25zdHJ1Y3RvcicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpdCgnU2hvdWxkIHRoZSBiaW5kIGZ1bmN0aW9uIGJlIGludm9rZWQgMiB0aW1lcycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgLy8gd2VpYm8tc2hhcmluZyBmdW5jdGlvbiBkb24ndCBuZWVkIHRvIGJpbmQgYW4gZXZlbnQuXG4gICAgICAgICAgICAgICAgdmFyIHNweSA9IHNpbm9uLnNweShTSy5wcm90b3R5cGUsICdiaW5kJyk7XG4gICAgICAgICAgICAgICAgdmFyIHNrID0gbmV3IFNLKCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsQ291bnQpLnRvLmVxdWFsKDIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZXNjcmliZSgnU0sgZWxlbWVudHNcXCcgZXZlbnQgYmluZGluZycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpdCgnU2hvdWxkIGhhbmRsZXIgYmUgZmlyZWQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciBzdCA9IHNpbm9uLnN0dWIoU0sucHJvdG90eXBlLCAncXpvbmVGdW5jJyk7XG4gICAgICAgICAgICAgICAgdmFyIHNrID0gbmV3IFNLKCk7XG4gICAgICAgICAgICAgICAgc2sucXpFbGUuZGlzcGF0Y2hFdmVudChldnQsdHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHN0LmNhbGxDb3VudCkudG8uZXF1YWwoMSk7XG4gICAgICAgICAgICAgICAgc3QucmVzdG9yZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZXNjcmliZSgnU0sgb3BlbiB3aW5kb3cgZnVuY3Rpb24gdGVzdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpdCgnU2hvdWxkIG9wZW4gd2luZG93IHdpdGggY29ycmVjdCB1cmwsIHRpdGxlLCBhbmQgcHJvcHMnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFNLLnByb3RvdHlwZS5vcGVuV2luKHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnaHR0cDovL3d3dy5iYWlkdS5jb20nLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ29wZW4gYmFpZHUnLFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxiYXJzOiAnbm8nLFxuICAgICAgICAgICAgICAgICAgICBtZW51YmFyOiAnbm8nLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6ICdubycsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogNjAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogOTAwLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAzMDAsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZXNjcmliZSgnVGhlIFF6b25lIHNoYXJlIGZ1bmN0aW9uJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBhcmdzID0gbnVsbDtcbiAgICAgICAgICAgIHZhciBjYWNoZSA9IFNLLnByb3RvdHlwZS5vcGVuV2luO1xuICAgICAgICAgICAgYmVmb3JlRWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciBmYWtlT3BlbldpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBTSy5wcm90b3R5cGUub3BlbldpbiA9IGZha2VPcGVuV2luO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnU2hvdWxkIHF6b25lRnVuYyBvcGVuIGEgd2luZG93IHdpdGggY29ycmVjdCBvcHRpb25zJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgc2sgPSBuZXcgU0soe1xuICAgICAgICAgICAgICAgICAgICBsaW5rOiAnaHR0cDovL2JhaWR1LmNvbScsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAncXpvbmUgc2hhcmUgZnVuY3Rpb24gdGVzdCcsXG4gICAgICAgICAgICAgICAgICAgIHR3aXR0ZXJOYW1lOiAnc3VuYWl3ZW4nLFxuICAgICAgICAgICAgICAgICAgICBkZXNjOiAndGhpcyBpcyBhIHRlc3QgdGVzdGluZyBxem9uZSBzaGFyZSBmdW5jdGlvbi4nXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBzay5xekVsZS5kaXNwYXRjaEV2ZW50KGV2dCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICBleHBlY3QoYXJncy5tZW51YmFyKS50by5lcXVhbCgnbm8nKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYXJncy5yZXNpemFibGUpLnRvLmVxdWFsKCdubycpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLnN0YXR1cykudG8uZXF1YWwoJ25vJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3MudG9vbGJhcikudG8uZXF1YWwoJ25vJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3MudG9wKS50by5lcXVhbCg1MCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3MubGVmdCkudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYXJncy53aWR0aCkudG8uZXF1YWwoNjAwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYXJncy5oZWlnaHQpLnRvLmVxdWFsKDY1MCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3MudGl0bGUpLnRvLmVxdWFsKCdTaGFyaW5nIHRvIFF6b25lJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFmdGVyRWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFNLLnByb3RvdHlwZS5vcGVuV2luID0gY2FjaGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRlc2NyaWJlKCdUaGUgd2VjaGF0IHNoYXJlIGZ1bmN0aW9uJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGl0KCdTaG91bGQgY29uZHVjdCBjb3JyZWN0IGluZm8gaW4gd2VjaGF0IHNoYXJpbmcnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciBjYWNoZSA9IFNLLnByb3RvdHlwZS5kZXRlY3REZXZpY2U7XG4gICAgICAgICAgICAgICAgU0sucHJvdG90eXBlLmRldGVjdERldmljZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAncGhvbmUnO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIHNrID0gbmV3IFNLKHtcbiAgICAgICAgICAgICAgICAgICAgbGluazogbG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICd3ZWNoYXQgZnVuY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBkZXNjOiAnd2VjaGF0IGZ1bmN0aW9uIHRlc3QgeW91IHdldGhlciB5b3UgbG92ZSBtZS4nLFxuICAgICAgICAgICAgICAgICAgICBwb3J0cmFpdDogJ2h0dHBzOi8vZDEzeWFjdXJxamdhcmEuY2xvdWRmcm9udC5uZXQvdXNlcnMvNTIyNzcvc2NyZWVuc2hvdHMvMTgwNzMzMy9naWxsZV9kcmliYmJsZV9ib3JlYXNfdjAxLTAxLnBuZydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzay53eEVsZS5kaXNwYXRjaEV2ZW50KGV2dCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgU0sucHJvdG90eXBlLmRldGVjdERldmljZSA9IGNhY2hlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnU2hvdWxkIHNob3cgcXJjb2RlIHdoZW4gaW4gcGMgZW52JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgc2sgPSBuZXcgU0soe1xuICAgICAgICAgICAgICAgICAgICBsaW5rOiBsb2NhdGlvbi5ocmVmXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2sud3hFbGUuZGlzcGF0Y2hFdmVudChldnQsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7Il19
