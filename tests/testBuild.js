(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/sunaiwen/projects/shareKit/js/shareKit.js":[function(require,module,exports){
var QRCode = require('qrcode');
var doc = window.document;
var SK = function(options){
    this.baseConf = this.setOptions(options);
    this.isFromPC = this.detectFrom(location.href);
    this.initEle(this.baseConf.prefix);
    this.wechatFunc(this);
    this.bind();
};
SK.prototype.initEle = function(prefix) {
    var self = this;
    this.wrapEle = doc.getElementsByClassName('js-'+prefix)[0];
    this.qzEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-qzone')[0];
    this.wbEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-weibo')[0];
    this.twEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-twitter')[0];
    this.wxEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-wechat')[0];

    //    init weibo script
    var wbScript = doc.createElement('script');
    wbScript.src = 'http://tjs.sjs.sinajs.cn/open/api/js/wb.js';
    wbScript.charset = 'utf-8';
    doc.body.appendChild(wbScript);
    wbScript.onload = function(){
        self.weiboFunc(self);
    };
};

SK.prototype.bind = function(){
    var self = this;
    this.wrapEle.onclick = function(e){
        var className = e.target.className;
        e.preventDefault();
        if(className.indexOf('qzone') > -1) {
            self.qzoneFunc(self);
        } else if(className.indexOf('twitter') > -1) {
            self.twitterFunc(self);
        }
    }
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
            doc.addEventListener('WeixinJSBridgeReady', shareReady);
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
            self.wxEle.qrcode = qrcodeEle = doc.getElementsByClassName('js-'+self.baseConf.prefix+'-wechat-QRCode')[0];
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
    var anchor = doc.createElement('a');
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

//    for test
module.exports = SK;
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
            it('Should bind an event correctly', function(done){
                var r = false;
                var handler = function(){
                    r = 'fire';
                    expect(r).to.equal('fire');
                    SK.prototype.qzoneFunc = temp;
                    done();
                };
                var temp = SK.prototype.qzoneFunc;
                SK.prototype.qzoneFunc = handler;
                sk.qzEle.dispatchEvent(evt, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9zaGFyZUtpdC5qcyIsIm1vZHVsZXMvcXJjb2RlanMvcXJjb2RlLmpzIiwidGVzdHMvdGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3bUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUVJDb2RlID0gcmVxdWlyZSgncXJjb2RlJyk7XG52YXIgZG9jID0gd2luZG93LmRvY3VtZW50O1xudmFyIFNLID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgdGhpcy5iYXNlQ29uZiA9IHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLmlzRnJvbVBDID0gdGhpcy5kZXRlY3RGcm9tKGxvY2F0aW9uLmhyZWYpO1xuICAgIHRoaXMuaW5pdEVsZSh0aGlzLmJhc2VDb25mLnByZWZpeCk7XG4gICAgdGhpcy53ZWNoYXRGdW5jKHRoaXMpO1xuICAgIHRoaXMuYmluZCgpO1xufTtcblNLLnByb3RvdHlwZS5pbml0RWxlID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMud3JhcEVsZSA9IGRvYy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy0nK3ByZWZpeClbMF07XG4gICAgdGhpcy5xekVsZSA9IHRoaXMud3JhcEVsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy0nK3ByZWZpeCsnLXF6b25lJylbMF07XG4gICAgdGhpcy53YkVsZSA9IHRoaXMud3JhcEVsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy0nK3ByZWZpeCsnLXdlaWJvJylbMF07XG4gICAgdGhpcy50d0VsZSA9IHRoaXMud3JhcEVsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy0nK3ByZWZpeCsnLXR3aXR0ZXInKVswXTtcbiAgICB0aGlzLnd4RWxlID0gdGhpcy53cmFwRWxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLScrcHJlZml4Kyctd2VjaGF0JylbMF07XG5cbiAgICAvLyAgICBpbml0IHdlaWJvIHNjcmlwdFxuICAgIHZhciB3YlNjcmlwdCA9IGRvYy5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICB3YlNjcmlwdC5zcmMgPSAnaHR0cDovL3Rqcy5zanMuc2luYWpzLmNuL29wZW4vYXBpL2pzL3diLmpzJztcbiAgICB3YlNjcmlwdC5jaGFyc2V0ID0gJ3V0Zi04JztcbiAgICBkb2MuYm9keS5hcHBlbmRDaGlsZCh3YlNjcmlwdCk7XG4gICAgd2JTY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgc2VsZi53ZWlib0Z1bmMoc2VsZik7XG4gICAgfTtcbn07XG5cblNLLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy53cmFwRWxlLm9uY2xpY2sgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGUudGFyZ2V0LmNsYXNzTmFtZTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZihjbGFzc05hbWUuaW5kZXhPZigncXpvbmUnKSA+IC0xKSB7XG4gICAgICAgICAgICBzZWxmLnF6b25lRnVuYyhzZWxmKTtcbiAgICAgICAgfSBlbHNlIGlmKGNsYXNzTmFtZS5pbmRleE9mKCd0d2l0dGVyJykgPiAtMSkge1xuICAgICAgICAgICAgc2VsZi50d2l0dGVyRnVuYyhzZWxmKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblNLLnByb3RvdHlwZS5vcGVuV2luID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgLy8gdXJsIGNhbm5vdCBiZSBlbXB0eVxuICAgIGlmKG9wdGlvbnMudXJsID09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignVGhlIHVybCB0byBvcGVuIGhhdmUgdG8gYmUgcGFzc2VkIGluLicpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0ZW1wID0ge307XG4gICAgdmFyIHRpdGxlID0gb3B0aW9ucy50aXRsZSB8fCAnc2hhcmVLaXRcXCdzIHdpbmRvdyc7XG4gICAgdmFyIHVybCA9IG9wdGlvbnMudXJsO1xuICAgIHZhciB3aW5kb3dDb25mPScnO1xuICAgIGZvcih2YXIga2V5IGluIG9wdGlvbnMpIHtcbiAgICAgICAgdGVtcFtrZXldID0gb3B0aW9uc1trZXldO1xuICAgIH1cbiAgICBkZWxldGUgdGVtcC50aXRsZTtcbiAgICBkZWxldGUgdGVtcC51cmw7XG4gICAgaWYodGVtcC52aWEgIT0gbnVsbCkge1xuICAgICAgICBkZWxldGUgdGVtcC52aWE7XG4gICAgfVxuICAgIGlmKHRlbXAudGV4dCAhPSBudWxsKSB7XG4gICAgICAgIGRlbGV0ZSB0ZW1wLnRleHQ7XG4gICAgfVxuICAgIGlmKHRlbXAuY291bnRVcmwgIT0gbnVsbCl7XG4gICAgICAgIGRlbGV0ZSB0ZW1wLmNvdW50VXJsO1xuICAgIH1cbiAgICBmb3Ioa2V5IGluIHRlbXApIHtcbiAgICAgICAgd2luZG93Q29uZiArPSAoa2V5Kyc9Jyt0ZW1wW2tleV0rJywnKTtcbiAgICB9XG4gICAgd2luZG93Q29uZiA9IHdpbmRvd0NvbmYuc2xpY2UoMCwtMSk7XG4gICAgd2luZG93Lm9wZW4odXJsLCB0aXRsZSwgd2luZG93Q29uZik7XG59O1xuXG4vLyBxem9uZSBzaGFyZSBoYW5kbGVyXG5TSy5wcm90b3R5cGUucXpvbmVGdW5jID0gZnVuY3Rpb24oc2VsZil7XG4gICAgdmFyIGNvbmYgPSBzZWxmLmdldE9wdGlvbigpO1xuICAgIHZhciBwID0ge1xuICAgICAgICB1cmw6IGNvbmYubGluayxcbiAgICAgICAgc2hvd2NvdW50OicxJywvKuaYr+WQpuaYvuekuuWIhuS6q+aAu+aVsCzmmL7npLrvvJonMSfvvIzkuI3mmL7npLrvvJonMCcgKi9cbiAgICAgICAgZGVzYzogJycsLyrpu5jorqTliIbkuqvnkIbnlLEo5Y+v6YCJKSovXG4gICAgICAgIHN1bW1hcnk6IGNvbmYuZGVzYywvKuWIhuS6q+aRmOimgSjlj6/pgIkpKi9cbiAgICAgICAgdGl0bGU6IGNvbmYudGl0bGUsLyrliIbkuqvmoIfpopgo5Y+v6YCJKSovXG4gICAgICAgIHNpdGU6JycsLyrliIbkuqvmnaXmupAg5aaC77ya6IW+6K6v572RKOWPr+mAiSkqL1xuICAgICAgICBwaWNzOicnLCAvKuWIhuS6q+WbvueJh+eahOi3r+W+hCjlj6/pgIkpKi9cbiAgICAgICAgc3R5bGU6JzIwMycsXG4gICAgICAgIHdpZHRoOjk4LFxuICAgICAgICBoZWlnaHQ6MjJcbiAgICB9O1xuICAgIHZhciBsaW5rO1xuICAgIGxpbmsgPSBzZWxmLnVybENvbmNhdChwLCAnaHR0cDovL3Nucy5xem9uZS5xcS5jb20vY2dpLWJpbi9xenNoYXJlL2NnaV9xenNoYXJlX29uZWtleScpO1xuICAgIHNlbGYub3Blbldpbih7XG4gICAgICAgIHVybDogbGluayxcbiAgICAgICAgdGl0bGU6ICdTaGFyaW5nIHRvIFF6b25lJyxcbiAgICAgICAgdG9vbGJhcjogJ25vJyxcbiAgICAgICAgcmVzaXphYmxlOiAnbm8nLFxuICAgICAgICBzdGF0dXM6ICdubycsXG4gICAgICAgIG1lbnViYXI6ICdubycsXG4gICAgICAgIHNjcm9sbGJhcnM6ICdubycsXG4gICAgICAgIGhlaWdodDogNjUwLFxuICAgICAgICB3aWR0aDogNjAwLFxuICAgICAgICBsZWZ0OiAyMDAsXG4gICAgICAgIHRvcDogNTBcbiAgICB9KTtcbn07XG5cbi8vICAgIHdlaWJvIHNoYXJlIGhhbmRsZXJcblNLLnByb3RvdHlwZS53ZWlib0Z1bmMgPSBmdW5jdGlvbihzZWxmKXtcbiAgICB2YXIgY29uZiA9IHNlbGYuZ2V0T3B0aW9uKCk7XG4gICAgdmFyIGRlZmF1bHRUZXh0ID0gY29uZi50aXRsZSsnLS0nK2NvbmYuZGVzYysnOiAnK2NvbmYubGluaztcbiAgICAvLyAgICBpbml0IHdlaWJvIGVsZW1lbnQncyBpZFxuICAgIHNlbGYud2JFbGUuaWQgPSAnd2JfcHVibGlzaCc7XG4gICAgV0IyLmFueVdoZXJlKGZ1bmN0aW9uKFcpe1xuICAgICAgICBXLndpZGdldC5wdWJsaXNoKHtcbiAgICAgICAgICAgIGFjdGlvbjoncHVibGlzaCcsXG4gICAgICAgICAgICB0eXBlOid3ZWInLFxuICAgICAgICAgICAgcmVmZXI6J3knLFxuICAgICAgICAgICAgbGFuZ3VhZ2U6J3poX2NuJyxcbiAgICAgICAgICAgIGJ1dHRvbl90eXBlOidyZWQnLFxuICAgICAgICAgICAgYnV0dG9uX3NpemU6J21pZGRsZScsXG4gICAgICAgICAgICBhcHBrZXk6JzMxMjUyNjU3NDgnLFxuICAgICAgICAgICAgaWQ6ICd3Yl9wdWJsaXNoJyxcbiAgICAgICAgICAgIHVpZDogJzE2MjQxMTg3MTcnLFxuICAgICAgICAgICAgZGVmYXVsdF90ZXh0OiBkZWZhdWx0VGV4dFxuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8vICAgIHR3aXR0ZXIgc2hhcmUgaGFuZGxlclxuU0sucHJvdG90eXBlLnR3aXR0ZXJGdW5jID0gZnVuY3Rpb24oc2VsZil7XG4gICAgdmFyIGNvbmYgPSBzZWxmLmdldE9wdGlvbigpO1xuICAgIHZhciBzaGFyZVVybCA9ICdodHRwczovL3R3aXR0ZXIuY29tL3NoYXJlJztcbiAgICB2YXIgc2hhcmVPYmogPSB7XG4gICAgICAgIHVybDogY29uZi5saW5rLFxuICAgICAgICB0ZXh0OiBjb25mLnRpdGxlICsnIC0gJytjb25mLmRlc2MsXG4gICAgICAgIGNvdW50VXJsOiBjb25mLmxpbmssXG4gICAgICAgIHZpYTogY29uZi50d2l0dGVyTmFtZSB8fCAnJ1xuICAgIH07XG4gICAgc2hhcmVVcmwgPSBzZWxmLnVybENvbmNhdChzaGFyZU9iaiwgc2hhcmVVcmwpO1xuICAgIGNvbmYudGl0bGUgPSAnU2hhcmluZyB0byBUd2l0dGVyJztcbiAgICBzZWxmLm9wZW5XaW4oe1xuICAgICAgICB1cmw6IHNoYXJlVXJsLFxuICAgICAgICB0aXRsZTogY29uZi50aXRsZSxcbiAgICAgICAgdG9vbGJhcjogJ25vJyxcbiAgICAgICAgcmVzaXphYmxlOiAnbm8nLFxuICAgICAgICBtZW51YmFyOiAnbm8nLFxuICAgICAgICBzY3JvbGxiYXJzOiAnbm8nLFxuICAgICAgICBoZWlnaHQ6IDY1MCxcbiAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgbGVmdDogMjAwLFxuICAgICAgICB0b3A6IDUwXG4gICAgfSk7XG59O1xuXG4vLyAgICB3ZWNoYXQgc2hhcmUgSGFuZGxlclxuU0sucHJvdG90eXBlLndlY2hhdEZ1bmMgPSBmdW5jdGlvbihzZWxmKXtcbiAgICB2YXIgY29uZiA9IHNlbGYuYmFzZUNvbmY7XG4gICAgdmFyIHNoYXJlUmVhZHk7XG4gICAgdmFyIHd4T2JqO1xuICAgIHZhciBxcmNvZGVFbGU7XG4gICAgdmFyIHFTdHI7XG4gICAgaWYoc2VsZi5pc0Zyb21QQyA9PT0gdHJ1ZSkge1xuICAgICAgICB3eE9iaiA9IHt9O1xuICAgICAgICB3eE9iai50aXRsZSA9IGNvbmYudGl0bGU7XG4gICAgICAgIHd4T2JqLmxpbmsgPSBjb25mLmxpbms7XG4gICAgICAgIHd4T2JqLmRlc2MgPSBjb25mLmRlc2M7XG4gICAgICAgIHd4T2JqLmltZ191cmwgPSBjb25mLnBvcnRyYWl0O1xuICAgICAgICBzaGFyZVJlYWR5ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIFdlaXhpbkpTQnJpZGdlLm9uKCdtZW51OnNoYXJlOmFwcG1lc3NhZ2UnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFdlaXhpbkpTQnJpZGdlLmludm9rZSgnc2VuZEFwcE1lc3NhZ2UnLCB3eE9iaixmdW5jdGlvbigpe30pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFdlaXhpbkpTQnJpZGdlLm9uKCdtZW51OnNoYXJlOnRpbWVsaW5lJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBXZWl4aW5KU0JyaWRnZS5pbnZva2UoJ3NoYXJlVGltZWxpbmUnLCB3eE9iaiwgZnVuY3Rpb24oKXt9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBpZih0eXBlb2YgV2VpeGluSlNCcmlkZ2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignV2VpeGluSlNCcmlkZ2VSZWFkeScsIHNoYXJlUmVhZHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2hhcmVSZWFkeSgpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmKHNlbGYuaXNGcm9tUEMgPT09IGZhbHNlKSB7XG4gICAgICAgIHFTdHIgPSBsb2NhdGlvbi5ocmVmO1xuICAgICAgICBpZihxU3RyLmluZGV4T2YoJz8nKSA+IC0xKSB7XG4gICAgICAgICAgICBxU3RyICs9ICcmZnJvbXBjPXRydWUnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcVN0ciArPSAnP2Zyb21wYz10cnVlJztcbiAgICAgICAgfVxuICAgICAgICBpZihzZWxmLnd4RWxlLnFyY29kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBzZWxmLnd4RWxlLnFyY29kZSA9IHFyY29kZUVsZSA9IGRvYy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy0nK3NlbGYuYmFzZUNvbmYucHJlZml4Kyctd2VjaGF0LVFSQ29kZScpWzBdO1xuICAgICAgICAgICAgcXJjb2RlRWxlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBzZWxmLnd4RWxlLnFyY29kZSA9IG5ldyBRUkNvZGUocXJjb2RlRWxlLCB7XG4gICAgICAgICAgICAgICAgdGV4dDogcVN0cixcbiAgICAgICAgICAgICAgICB3aWR0aDogMjA0LFxuICAgICAgICAgICAgICAgIGhlaWdodDogMjA0LFxuICAgICAgICAgICAgICAgIGNvbG9yRGFyazogJyMwMDAwMDAnLFxuICAgICAgICAgICAgICAgIGNvbG9yTGlnaHQ6ICcjZmZmZmZmJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHFyY29kZUVsZS5vbmNsaWNrID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2VsZi53eEVsZS5vbmNsaWNrID0gbnVsbDtcbiAgICAgICAgICAgIHNlbGYud3hFbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGlmKHFyY29kZUVsZS5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScpIHtcbiAgICAgICAgICAgICAgICAgICAgcXJjb2RlRWxlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gICAgbWFrZSB0aGUgYmFzZSBkYXRhXG5TSy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdmFyIGJhc2VDb25mID0ge307XG4gICAgaWYodHlwZW9mIG9wdGlvbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG9wdGlvbnMgPSBiYXNlQ29uZjtcbiAgICB9XG4gICAgaWYodHlwZW9mIG9wdGlvbnMudGl0bGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGJhc2VDb25mLnRpdGxlID0gZG9jLnRpdGxlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGJhc2VDb25mLnRpdGxlID0gb3B0aW9ucy50aXRsZTtcbiAgICB9XG4gICAgaWYodHlwZW9mIG9wdGlvbnMubGluayA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgYmFzZUNvbmYubGluayA9IGxvY2F0aW9uLmhyZWY7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYmFzZUNvbmYubGluayA9IG9wdGlvbnMubGluaztcbiAgICB9XG4gICAgaWYodHlwZW9mIG9wdGlvbnMuZGVzYyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgYmFzZUNvbmYuZGVzYyA9IHRoaXMuZmluZERlc2MoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBiYXNlQ29uZi5kZXNjID0gb3B0aW9ucy5kZXNjO1xuICAgIH1cbiAgICBpZih0eXBlb2Ygb3B0aW9ucy50d2l0dGVyTmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgYmFzZUNvbmYudHdpdHRlck5hbWUgPSBvcHRpb25zLnR3aXR0ZXJOYW1lO1xuICAgIH1cbiAgICBpZih0eXBlb2Ygb3B0aW9ucy5wcmVmaXggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGJhc2VDb25mLnByZWZpeCA9ICdzaGFyZUtpdCc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYmFzZUNvbmYucHJlZml4ID0gb3B0aW9ucy5wcmVmaXg7XG4gICAgfVxuICAgIGlmKHR5cGVvZiBvcHRpb25zLnBvcnRyYWl0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBvcHRpb25zLnBvcnRyYWl0ID0gJ2h0dHA6Ly91c3VhbGltYWdlcy5xaW5pdWRuLmNvbS8xLmpwZWcnO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGJhc2VDb25mLnBvcnRyYWl0ID0gb3B0aW9ucy5wb3J0cmFpdDtcbiAgICB9XG4gICAgcmV0dXJuIGJhc2VDb25mO1xufTtcblxuLy8gcmV0dXJuIGEgY29weSBvZiBvcHRpb24gb2JqZWN0XG5TSy5wcm90b3R5cGUuZ2V0T3B0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgcmUgPSB7fTtcbiAgICBmb3IodmFyIGtleSBpbiB0aGlzLmJhc2VDb25mKSB7XG4gICAgICAgIHJlW2tleV0gPSB0aGlzLmJhc2VDb25mW2tleV07XG4gICAgfVxuICAgIHJldHVybiByZTtcbn07XG5cbi8vIGRldGVjdCBkZXZpY2UgdHlwZVxuU0sucHJvdG90eXBlLmRldGVjdEZyb20gPSBmdW5jdGlvbih1cmwpe1xuICAgIHZhciBhbmNob3IgPSBkb2MuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGFuY2hvci5ocmVmID0gdXJsO1xuICAgIHZhciBxU3RyID0gYW5jaG9yLnNlYXJjaC5zbGljZSgxKTtcbiAgICB2YXIgcUFyciA9IG51bGw7XG4gICAgaWYocVN0ci5pbmRleE9mKCdmcm9tcGMnKSA+IC0xKSB7XG4gICAgICAgIHFBcnIgPSBxU3RyLnNwbGl0KCcmJyk7XG4gICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHFBcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xuICAgICAgICAgICAgaWYocUFycltpXS5pbmRleE9mKCdmcm9tcGMnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHFBcnJbaV0uc3BsaXQoJz0nKVsxXSA9PT0gJ3RydWUnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxufTtcblxuU0sucHJvdG90eXBlLmZpbmREZXNjID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgbWV0YXMgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ldGEnKTtcbiAgICB2YXIgbWV0YTtcbiAgICBmb3IodmFyIGk9MDsgaTwgbWV0YXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbWV0YSA9IG1ldGFzW2ldO1xuICAgICAgICBpZihtZXRhLmdldEF0dHJpYnV0ZSgnbmFtZScpID09PSAnZGVzY3JpcHRpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gbWV0YS5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy8gICAgY29uY2F0IHVybCBhbmQgcXVlcnkgZGF0YVxuU0sucHJvdG90eXBlLnVybENvbmNhdCA9IGZ1bmN0aW9uKG8sIHVybCl7XG4gICAgdmFyIHMgPSBbXTtcbiAgICBmb3IodmFyIGkgaW4gbyl7XG4gICAgICAgIHMucHVzaChpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9baV18fCcnKSk7XG4gICAgfVxuICAgIHJldHVybiB1cmwgKyAnPycgKyBzLmpvaW4oJyYnKTtcbn07XG5cbi8vICAgIGZvciB0ZXN0XG5tb2R1bGUuZXhwb3J0cyA9IFNLOyIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbjtfX2Jyb3dzZXJpZnlfc2hpbV9yZXF1aXJlX189cmVxdWlyZTsoZnVuY3Rpb24gYnJvd3NlcmlmeVNoaW0obW9kdWxlLCBleHBvcnRzLCByZXF1aXJlLCBkZWZpbmUsIGJyb3dzZXJpZnlfc2hpbV9fZGVmaW5lX19tb2R1bGVfX2V4cG9ydF9fKSB7XG4vKipcbiAqIEBmaWxlb3ZlcnZpZXdcbiAqIC0gVXNpbmcgdGhlICdRUkNvZGUgZm9yIEphdmFzY3JpcHQgbGlicmFyeSdcbiAqIC0gRml4ZWQgZGF0YXNldCBvZiAnUVJDb2RlIGZvciBKYXZhc2NyaXB0IGxpYnJhcnknIGZvciBzdXBwb3J0IGZ1bGwtc3BlYy5cbiAqIC0gdGhpcyBsaWJyYXJ5IGhhcyBubyBkZXBlbmRlbmNpZXMuXG4gKiBcbiAqIEBhdXRob3IgZGF2aWRzaGltanNcbiAqIEBzZWUgPGEgaHJlZj1cImh0dHA6Ly93d3cuZC1wcm9qZWN0LmNvbS9cIiB0YXJnZXQ9XCJfYmxhbmtcIj5odHRwOi8vd3d3LmQtcHJvamVjdC5jb20vPC9hPlxuICogQHNlZSA8YSBocmVmPVwiaHR0cDovL2plcm9tZWV0aWVubmUuZ2l0aHViLmNvbS9qcXVlcnktcXJjb2RlL1wiIHRhcmdldD1cIl9ibGFua1wiPmh0dHA6Ly9qZXJvbWVldGllbm5lLmdpdGh1Yi5jb20vanF1ZXJ5LXFyY29kZS88L2E+XG4gKi9cbnZhciBRUkNvZGU7XG5cbihmdW5jdGlvbiAoKSB7XG5cdC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFFSQ29kZSBmb3IgSmF2YVNjcmlwdFxuXHQvL1xuXHQvLyBDb3B5cmlnaHQgKGMpIDIwMDkgS2F6dWhpa28gQXJhc2Vcblx0Ly9cblx0Ly8gVVJMOiBodHRwOi8vd3d3LmQtcHJvamVjdC5jb20vXG5cdC8vXG5cdC8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcblx0Ly8gICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHQvL1xuXHQvLyBUaGUgd29yZCBcIlFSIENvZGVcIiBpcyByZWdpc3RlcmVkIHRyYWRlbWFyayBvZiBcblx0Ly8gREVOU08gV0FWRSBJTkNPUlBPUkFURURcblx0Ly8gICBodHRwOi8vd3d3LmRlbnNvLXdhdmUuY29tL3FyY29kZS9mYXFwYXRlbnQtZS5odG1sXG5cdC8vXG5cdC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdGZ1bmN0aW9uIFFSOGJpdEJ5dGUoZGF0YSkge1xuXHRcdHRoaXMubW9kZSA9IFFSTW9kZS5NT0RFXzhCSVRfQllURTtcblx0XHR0aGlzLmRhdGEgPSBkYXRhO1xuXHRcdHRoaXMucGFyc2VkRGF0YSA9IFtdO1xuXG5cdFx0Ly8gQWRkZWQgdG8gc3VwcG9ydCBVVEYtOCBDaGFyYWN0ZXJzXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmRhdGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHR2YXIgYnl0ZUFycmF5ID0gW107XG5cdFx0XHR2YXIgY29kZSA9IHRoaXMuZGF0YS5jaGFyQ29kZUF0KGkpO1xuXG5cdFx0XHRpZiAoY29kZSA+IDB4MTAwMDApIHtcblx0XHRcdFx0Ynl0ZUFycmF5WzBdID0gMHhGMCB8ICgoY29kZSAmIDB4MUMwMDAwKSA+Pj4gMTgpO1xuXHRcdFx0XHRieXRlQXJyYXlbMV0gPSAweDgwIHwgKChjb2RlICYgMHgzRjAwMCkgPj4+IDEyKTtcblx0XHRcdFx0Ynl0ZUFycmF5WzJdID0gMHg4MCB8ICgoY29kZSAmIDB4RkMwKSA+Pj4gNik7XG5cdFx0XHRcdGJ5dGVBcnJheVszXSA9IDB4ODAgfCAoY29kZSAmIDB4M0YpO1xuXHRcdFx0fSBlbHNlIGlmIChjb2RlID4gMHg4MDApIHtcblx0XHRcdFx0Ynl0ZUFycmF5WzBdID0gMHhFMCB8ICgoY29kZSAmIDB4RjAwMCkgPj4+IDEyKTtcblx0XHRcdFx0Ynl0ZUFycmF5WzFdID0gMHg4MCB8ICgoY29kZSAmIDB4RkMwKSA+Pj4gNik7XG5cdFx0XHRcdGJ5dGVBcnJheVsyXSA9IDB4ODAgfCAoY29kZSAmIDB4M0YpO1xuXHRcdFx0fSBlbHNlIGlmIChjb2RlID4gMHg4MCkge1xuXHRcdFx0XHRieXRlQXJyYXlbMF0gPSAweEMwIHwgKChjb2RlICYgMHg3QzApID4+PiA2KTtcblx0XHRcdFx0Ynl0ZUFycmF5WzFdID0gMHg4MCB8IChjb2RlICYgMHgzRik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRieXRlQXJyYXlbMF0gPSBjb2RlO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnBhcnNlZERhdGEucHVzaChieXRlQXJyYXkpO1xuXHRcdH1cblxuXHRcdHRoaXMucGFyc2VkRGF0YSA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIHRoaXMucGFyc2VkRGF0YSk7XG5cblx0XHRpZiAodGhpcy5wYXJzZWREYXRhLmxlbmd0aCAhPSB0aGlzLmRhdGEubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLnBhcnNlZERhdGEudW5zaGlmdCgxOTEpO1xuXHRcdFx0dGhpcy5wYXJzZWREYXRhLnVuc2hpZnQoMTg3KTtcblx0XHRcdHRoaXMucGFyc2VkRGF0YS51bnNoaWZ0KDIzOSk7XG5cdFx0fVxuXHR9XG5cblx0UVI4Yml0Qnl0ZS5wcm90b3R5cGUgPSB7XG5cdFx0Z2V0TGVuZ3RoOiBmdW5jdGlvbiAoYnVmZmVyKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wYXJzZWREYXRhLmxlbmd0aDtcblx0XHR9LFxuXHRcdHdyaXRlOiBmdW5jdGlvbiAoYnVmZmVyKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMucGFyc2VkRGF0YS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHRcdFx0YnVmZmVyLnB1dCh0aGlzLnBhcnNlZERhdGFbaV0sIDgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRmdW5jdGlvbiBRUkNvZGVNb2RlbCh0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3RMZXZlbCkge1xuXHRcdHRoaXMudHlwZU51bWJlciA9IHR5cGVOdW1iZXI7XG5cdFx0dGhpcy5lcnJvckNvcnJlY3RMZXZlbCA9IGVycm9yQ29ycmVjdExldmVsO1xuXHRcdHRoaXMubW9kdWxlcyA9IG51bGw7XG5cdFx0dGhpcy5tb2R1bGVDb3VudCA9IDA7XG5cdFx0dGhpcy5kYXRhQ2FjaGUgPSBudWxsO1xuXHRcdHRoaXMuZGF0YUxpc3QgPSBbXTtcblx0fVxuXG5cdFFSQ29kZU1vZGVsLnByb3RvdHlwZT17YWRkRGF0YTpmdW5jdGlvbihkYXRhKXt2YXIgbmV3RGF0YT1uZXcgUVI4Yml0Qnl0ZShkYXRhKTt0aGlzLmRhdGFMaXN0LnB1c2gobmV3RGF0YSk7dGhpcy5kYXRhQ2FjaGU9bnVsbDt9LGlzRGFyazpmdW5jdGlvbihyb3csY29sKXtpZihyb3c8MHx8dGhpcy5tb2R1bGVDb3VudDw9cm93fHxjb2w8MHx8dGhpcy5tb2R1bGVDb3VudDw9Y29sKXt0aHJvdyBuZXcgRXJyb3Iocm93K1wiLFwiK2NvbCk7fVxuXHRyZXR1cm4gdGhpcy5tb2R1bGVzW3Jvd11bY29sXTt9LGdldE1vZHVsZUNvdW50OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubW9kdWxlQ291bnQ7fSxtYWtlOmZ1bmN0aW9uKCl7dGhpcy5tYWtlSW1wbChmYWxzZSx0aGlzLmdldEJlc3RNYXNrUGF0dGVybigpKTt9LG1ha2VJbXBsOmZ1bmN0aW9uKHRlc3QsbWFza1BhdHRlcm4pe3RoaXMubW9kdWxlQ291bnQ9dGhpcy50eXBlTnVtYmVyKjQrMTc7dGhpcy5tb2R1bGVzPW5ldyBBcnJheSh0aGlzLm1vZHVsZUNvdW50KTtmb3IodmFyIHJvdz0wO3Jvdzx0aGlzLm1vZHVsZUNvdW50O3JvdysrKXt0aGlzLm1vZHVsZXNbcm93XT1uZXcgQXJyYXkodGhpcy5tb2R1bGVDb3VudCk7Zm9yKHZhciBjb2w9MDtjb2w8dGhpcy5tb2R1bGVDb3VudDtjb2wrKyl7dGhpcy5tb2R1bGVzW3Jvd11bY29sXT1udWxsO319XG5cdHRoaXMuc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybigwLDApO3RoaXMuc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybih0aGlzLm1vZHVsZUNvdW50LTcsMCk7dGhpcy5zZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKDAsdGhpcy5tb2R1bGVDb3VudC03KTt0aGlzLnNldHVwUG9zaXRpb25BZGp1c3RQYXR0ZXJuKCk7dGhpcy5zZXR1cFRpbWluZ1BhdHRlcm4oKTt0aGlzLnNldHVwVHlwZUluZm8odGVzdCxtYXNrUGF0dGVybik7aWYodGhpcy50eXBlTnVtYmVyPj03KXt0aGlzLnNldHVwVHlwZU51bWJlcih0ZXN0KTt9XG5cdGlmKHRoaXMuZGF0YUNhY2hlPT1udWxsKXt0aGlzLmRhdGFDYWNoZT1RUkNvZGVNb2RlbC5jcmVhdGVEYXRhKHRoaXMudHlwZU51bWJlcix0aGlzLmVycm9yQ29ycmVjdExldmVsLHRoaXMuZGF0YUxpc3QpO31cblx0dGhpcy5tYXBEYXRhKHRoaXMuZGF0YUNhY2hlLG1hc2tQYXR0ZXJuKTt9LHNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm46ZnVuY3Rpb24ocm93LGNvbCl7Zm9yKHZhciByPS0xO3I8PTc7cisrKXtpZihyb3crcjw9LTF8fHRoaXMubW9kdWxlQ291bnQ8PXJvdytyKWNvbnRpbnVlO2Zvcih2YXIgYz0tMTtjPD03O2MrKyl7aWYoY29sK2M8PS0xfHx0aGlzLm1vZHVsZUNvdW50PD1jb2wrYyljb250aW51ZTtpZigoMDw9ciYmcjw9NiYmKGM9PTB8fGM9PTYpKXx8KDA8PWMmJmM8PTYmJihyPT0wfHxyPT02KSl8fCgyPD1yJiZyPD00JiYyPD1jJiZjPD00KSl7dGhpcy5tb2R1bGVzW3JvdytyXVtjb2wrY109dHJ1ZTt9ZWxzZXt0aGlzLm1vZHVsZXNbcm93K3JdW2NvbCtjXT1mYWxzZTt9fX19LGdldEJlc3RNYXNrUGF0dGVybjpmdW5jdGlvbigpe3ZhciBtaW5Mb3N0UG9pbnQ9MDt2YXIgcGF0dGVybj0wO2Zvcih2YXIgaT0wO2k8ODtpKyspe3RoaXMubWFrZUltcGwodHJ1ZSxpKTt2YXIgbG9zdFBvaW50PVFSVXRpbC5nZXRMb3N0UG9pbnQodGhpcyk7aWYoaT09MHx8bWluTG9zdFBvaW50Pmxvc3RQb2ludCl7bWluTG9zdFBvaW50PWxvc3RQb2ludDtwYXR0ZXJuPWk7fX1cblx0cmV0dXJuIHBhdHRlcm47fSxjcmVhdGVNb3ZpZUNsaXA6ZnVuY3Rpb24odGFyZ2V0X21jLGluc3RhbmNlX25hbWUsZGVwdGgpe3ZhciBxcl9tYz10YXJnZXRfbWMuY3JlYXRlRW1wdHlNb3ZpZUNsaXAoaW5zdGFuY2VfbmFtZSxkZXB0aCk7dmFyIGNzPTE7dGhpcy5tYWtlKCk7Zm9yKHZhciByb3c9MDtyb3c8dGhpcy5tb2R1bGVzLmxlbmd0aDtyb3crKyl7dmFyIHk9cm93KmNzO2Zvcih2YXIgY29sPTA7Y29sPHRoaXMubW9kdWxlc1tyb3ddLmxlbmd0aDtjb2wrKyl7dmFyIHg9Y29sKmNzO3ZhciBkYXJrPXRoaXMubW9kdWxlc1tyb3ddW2NvbF07aWYoZGFyayl7cXJfbWMuYmVnaW5GaWxsKDAsMTAwKTtxcl9tYy5tb3ZlVG8oeCx5KTtxcl9tYy5saW5lVG8oeCtjcyx5KTtxcl9tYy5saW5lVG8oeCtjcyx5K2NzKTtxcl9tYy5saW5lVG8oeCx5K2NzKTtxcl9tYy5lbmRGaWxsKCk7fX19XG5cdHJldHVybiBxcl9tYzt9LHNldHVwVGltaW5nUGF0dGVybjpmdW5jdGlvbigpe2Zvcih2YXIgcj04O3I8dGhpcy5tb2R1bGVDb3VudC04O3IrKyl7aWYodGhpcy5tb2R1bGVzW3JdWzZdIT1udWxsKXtjb250aW51ZTt9XG5cdHRoaXMubW9kdWxlc1tyXVs2XT0ociUyPT0wKTt9XG5cdGZvcih2YXIgYz04O2M8dGhpcy5tb2R1bGVDb3VudC04O2MrKyl7aWYodGhpcy5tb2R1bGVzWzZdW2NdIT1udWxsKXtjb250aW51ZTt9XG5cdHRoaXMubW9kdWxlc1s2XVtjXT0oYyUyPT0wKTt9fSxzZXR1cFBvc2l0aW9uQWRqdXN0UGF0dGVybjpmdW5jdGlvbigpe3ZhciBwb3M9UVJVdGlsLmdldFBhdHRlcm5Qb3NpdGlvbih0aGlzLnR5cGVOdW1iZXIpO2Zvcih2YXIgaT0wO2k8cG9zLmxlbmd0aDtpKyspe2Zvcih2YXIgaj0wO2o8cG9zLmxlbmd0aDtqKyspe3ZhciByb3c9cG9zW2ldO3ZhciBjb2w9cG9zW2pdO2lmKHRoaXMubW9kdWxlc1tyb3ddW2NvbF0hPW51bGwpe2NvbnRpbnVlO31cblx0Zm9yKHZhciByPS0yO3I8PTI7cisrKXtmb3IodmFyIGM9LTI7Yzw9MjtjKyspe2lmKHI9PS0yfHxyPT0yfHxjPT0tMnx8Yz09Mnx8KHI9PTAmJmM9PTApKXt0aGlzLm1vZHVsZXNbcm93K3JdW2NvbCtjXT10cnVlO31lbHNle3RoaXMubW9kdWxlc1tyb3crcl1bY29sK2NdPWZhbHNlO319fX19fSxzZXR1cFR5cGVOdW1iZXI6ZnVuY3Rpb24odGVzdCl7dmFyIGJpdHM9UVJVdGlsLmdldEJDSFR5cGVOdW1iZXIodGhpcy50eXBlTnVtYmVyKTtmb3IodmFyIGk9MDtpPDE4O2krKyl7dmFyIG1vZD0oIXRlc3QmJigoYml0cz4+aSkmMSk9PTEpO3RoaXMubW9kdWxlc1tNYXRoLmZsb29yKGkvMyldW2klMyt0aGlzLm1vZHVsZUNvdW50LTgtM109bW9kO31cblx0Zm9yKHZhciBpPTA7aTwxODtpKyspe3ZhciBtb2Q9KCF0ZXN0JiYoKGJpdHM+PmkpJjEpPT0xKTt0aGlzLm1vZHVsZXNbaSUzK3RoaXMubW9kdWxlQ291bnQtOC0zXVtNYXRoLmZsb29yKGkvMyldPW1vZDt9fSxzZXR1cFR5cGVJbmZvOmZ1bmN0aW9uKHRlc3QsbWFza1BhdHRlcm4pe3ZhciBkYXRhPSh0aGlzLmVycm9yQ29ycmVjdExldmVsPDwzKXxtYXNrUGF0dGVybjt2YXIgYml0cz1RUlV0aWwuZ2V0QkNIVHlwZUluZm8oZGF0YSk7Zm9yKHZhciBpPTA7aTwxNTtpKyspe3ZhciBtb2Q9KCF0ZXN0JiYoKGJpdHM+PmkpJjEpPT0xKTtpZihpPDYpe3RoaXMubW9kdWxlc1tpXVs4XT1tb2Q7fWVsc2UgaWYoaTw4KXt0aGlzLm1vZHVsZXNbaSsxXVs4XT1tb2Q7fWVsc2V7dGhpcy5tb2R1bGVzW3RoaXMubW9kdWxlQ291bnQtMTUraV1bOF09bW9kO319XG5cdGZvcih2YXIgaT0wO2k8MTU7aSsrKXt2YXIgbW9kPSghdGVzdCYmKChiaXRzPj5pKSYxKT09MSk7aWYoaTw4KXt0aGlzLm1vZHVsZXNbOF1bdGhpcy5tb2R1bGVDb3VudC1pLTFdPW1vZDt9ZWxzZSBpZihpPDkpe3RoaXMubW9kdWxlc1s4XVsxNS1pLTErMV09bW9kO31lbHNle3RoaXMubW9kdWxlc1s4XVsxNS1pLTFdPW1vZDt9fVxuXHR0aGlzLm1vZHVsZXNbdGhpcy5tb2R1bGVDb3VudC04XVs4XT0oIXRlc3QpO30sbWFwRGF0YTpmdW5jdGlvbihkYXRhLG1hc2tQYXR0ZXJuKXt2YXIgaW5jPS0xO3ZhciByb3c9dGhpcy5tb2R1bGVDb3VudC0xO3ZhciBiaXRJbmRleD03O3ZhciBieXRlSW5kZXg9MDtmb3IodmFyIGNvbD10aGlzLm1vZHVsZUNvdW50LTE7Y29sPjA7Y29sLT0yKXtpZihjb2w9PTYpY29sLS07d2hpbGUodHJ1ZSl7Zm9yKHZhciBjPTA7YzwyO2MrKyl7aWYodGhpcy5tb2R1bGVzW3Jvd11bY29sLWNdPT1udWxsKXt2YXIgZGFyaz1mYWxzZTtpZihieXRlSW5kZXg8ZGF0YS5sZW5ndGgpe2Rhcms9KCgoZGF0YVtieXRlSW5kZXhdPj4+Yml0SW5kZXgpJjEpPT0xKTt9XG5cdHZhciBtYXNrPVFSVXRpbC5nZXRNYXNrKG1hc2tQYXR0ZXJuLHJvdyxjb2wtYyk7aWYobWFzayl7ZGFyaz0hZGFyazt9XG5cdHRoaXMubW9kdWxlc1tyb3ddW2NvbC1jXT1kYXJrO2JpdEluZGV4LS07aWYoYml0SW5kZXg9PS0xKXtieXRlSW5kZXgrKztiaXRJbmRleD03O319fVxuXHRyb3crPWluYztpZihyb3c8MHx8dGhpcy5tb2R1bGVDb3VudDw9cm93KXtyb3ctPWluYztpbmM9LWluYzticmVhazt9fX19fTtRUkNvZGVNb2RlbC5QQUQwPTB4RUM7UVJDb2RlTW9kZWwuUEFEMT0weDExO1FSQ29kZU1vZGVsLmNyZWF0ZURhdGE9ZnVuY3Rpb24odHlwZU51bWJlcixlcnJvckNvcnJlY3RMZXZlbCxkYXRhTGlzdCl7dmFyIHJzQmxvY2tzPVFSUlNCbG9jay5nZXRSU0Jsb2Nrcyh0eXBlTnVtYmVyLGVycm9yQ29ycmVjdExldmVsKTt2YXIgYnVmZmVyPW5ldyBRUkJpdEJ1ZmZlcigpO2Zvcih2YXIgaT0wO2k8ZGF0YUxpc3QubGVuZ3RoO2krKyl7dmFyIGRhdGE9ZGF0YUxpc3RbaV07YnVmZmVyLnB1dChkYXRhLm1vZGUsNCk7YnVmZmVyLnB1dChkYXRhLmdldExlbmd0aCgpLFFSVXRpbC5nZXRMZW5ndGhJbkJpdHMoZGF0YS5tb2RlLHR5cGVOdW1iZXIpKTtkYXRhLndyaXRlKGJ1ZmZlcik7fVxuXHR2YXIgdG90YWxEYXRhQ291bnQ9MDtmb3IodmFyIGk9MDtpPHJzQmxvY2tzLmxlbmd0aDtpKyspe3RvdGFsRGF0YUNvdW50Kz1yc0Jsb2Nrc1tpXS5kYXRhQ291bnQ7fVxuXHRpZihidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCk+dG90YWxEYXRhQ291bnQqOCl7dGhyb3cgbmV3IEVycm9yKFwiY29kZSBsZW5ndGggb3ZlcmZsb3cuIChcIlxuXHQrYnVmZmVyLmdldExlbmd0aEluQml0cygpXG5cdCtcIj5cIlxuXHQrdG90YWxEYXRhQ291bnQqOFxuXHQrXCIpXCIpO31cblx0aWYoYnVmZmVyLmdldExlbmd0aEluQml0cygpKzQ8PXRvdGFsRGF0YUNvdW50Kjgpe2J1ZmZlci5wdXQoMCw0KTt9XG5cdHdoaWxlKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSU4IT0wKXtidWZmZXIucHV0Qml0KGZhbHNlKTt9XG5cdHdoaWxlKHRydWUpe2lmKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKT49dG90YWxEYXRhQ291bnQqOCl7YnJlYWs7fVxuXHRidWZmZXIucHV0KFFSQ29kZU1vZGVsLlBBRDAsOCk7aWYoYnVmZmVyLmdldExlbmd0aEluQml0cygpPj10b3RhbERhdGFDb3VudCo4KXticmVhazt9XG5cdGJ1ZmZlci5wdXQoUVJDb2RlTW9kZWwuUEFEMSw4KTt9XG5cdHJldHVybiBRUkNvZGVNb2RlbC5jcmVhdGVCeXRlcyhidWZmZXIscnNCbG9ja3MpO307UVJDb2RlTW9kZWwuY3JlYXRlQnl0ZXM9ZnVuY3Rpb24oYnVmZmVyLHJzQmxvY2tzKXt2YXIgb2Zmc2V0PTA7dmFyIG1heERjQ291bnQ9MDt2YXIgbWF4RWNDb3VudD0wO3ZhciBkY2RhdGE9bmV3IEFycmF5KHJzQmxvY2tzLmxlbmd0aCk7dmFyIGVjZGF0YT1uZXcgQXJyYXkocnNCbG9ja3MubGVuZ3RoKTtmb3IodmFyIHI9MDtyPHJzQmxvY2tzLmxlbmd0aDtyKyspe3ZhciBkY0NvdW50PXJzQmxvY2tzW3JdLmRhdGFDb3VudDt2YXIgZWNDb3VudD1yc0Jsb2Nrc1tyXS50b3RhbENvdW50LWRjQ291bnQ7bWF4RGNDb3VudD1NYXRoLm1heChtYXhEY0NvdW50LGRjQ291bnQpO21heEVjQ291bnQ9TWF0aC5tYXgobWF4RWNDb3VudCxlY0NvdW50KTtkY2RhdGFbcl09bmV3IEFycmF5KGRjQ291bnQpO2Zvcih2YXIgaT0wO2k8ZGNkYXRhW3JdLmxlbmd0aDtpKyspe2RjZGF0YVtyXVtpXT0weGZmJmJ1ZmZlci5idWZmZXJbaStvZmZzZXRdO31cblx0b2Zmc2V0Kz1kY0NvdW50O3ZhciByc1BvbHk9UVJVdGlsLmdldEVycm9yQ29ycmVjdFBvbHlub21pYWwoZWNDb3VudCk7dmFyIHJhd1BvbHk9bmV3IFFSUG9seW5vbWlhbChkY2RhdGFbcl0scnNQb2x5LmdldExlbmd0aCgpLTEpO3ZhciBtb2RQb2x5PXJhd1BvbHkubW9kKHJzUG9seSk7ZWNkYXRhW3JdPW5ldyBBcnJheShyc1BvbHkuZ2V0TGVuZ3RoKCktMSk7Zm9yKHZhciBpPTA7aTxlY2RhdGFbcl0ubGVuZ3RoO2krKyl7dmFyIG1vZEluZGV4PWkrbW9kUG9seS5nZXRMZW5ndGgoKS1lY2RhdGFbcl0ubGVuZ3RoO2VjZGF0YVtyXVtpXT0obW9kSW5kZXg+PTApP21vZFBvbHkuZ2V0KG1vZEluZGV4KTowO319XG5cdHZhciB0b3RhbENvZGVDb3VudD0wO2Zvcih2YXIgaT0wO2k8cnNCbG9ja3MubGVuZ3RoO2krKyl7dG90YWxDb2RlQ291bnQrPXJzQmxvY2tzW2ldLnRvdGFsQ291bnQ7fVxuXHR2YXIgZGF0YT1uZXcgQXJyYXkodG90YWxDb2RlQ291bnQpO3ZhciBpbmRleD0wO2Zvcih2YXIgaT0wO2k8bWF4RGNDb3VudDtpKyspe2Zvcih2YXIgcj0wO3I8cnNCbG9ja3MubGVuZ3RoO3IrKyl7aWYoaTxkY2RhdGFbcl0ubGVuZ3RoKXtkYXRhW2luZGV4KytdPWRjZGF0YVtyXVtpXTt9fX1cblx0Zm9yKHZhciBpPTA7aTxtYXhFY0NvdW50O2krKyl7Zm9yKHZhciByPTA7cjxyc0Jsb2Nrcy5sZW5ndGg7cisrKXtpZihpPGVjZGF0YVtyXS5sZW5ndGgpe2RhdGFbaW5kZXgrK109ZWNkYXRhW3JdW2ldO319fVxuXHRyZXR1cm4gZGF0YTt9O3ZhciBRUk1vZGU9e01PREVfTlVNQkVSOjE8PDAsTU9ERV9BTFBIQV9OVU06MTw8MSxNT0RFXzhCSVRfQllURToxPDwyLE1PREVfS0FOSkk6MTw8M307dmFyIFFSRXJyb3JDb3JyZWN0TGV2ZWw9e0w6MSxNOjAsUTozLEg6Mn07dmFyIFFSTWFza1BhdHRlcm49e1BBVFRFUk4wMDA6MCxQQVRURVJOMDAxOjEsUEFUVEVSTjAxMDoyLFBBVFRFUk4wMTE6MyxQQVRURVJOMTAwOjQsUEFUVEVSTjEwMTo1LFBBVFRFUk4xMTA6NixQQVRURVJOMTExOjd9O3ZhciBRUlV0aWw9e1BBVFRFUk5fUE9TSVRJT05fVEFCTEU6W1tdLFs2LDE4XSxbNiwyMl0sWzYsMjZdLFs2LDMwXSxbNiwzNF0sWzYsMjIsMzhdLFs2LDI0LDQyXSxbNiwyNiw0Nl0sWzYsMjgsNTBdLFs2LDMwLDU0XSxbNiwzMiw1OF0sWzYsMzQsNjJdLFs2LDI2LDQ2LDY2XSxbNiwyNiw0OCw3MF0sWzYsMjYsNTAsNzRdLFs2LDMwLDU0LDc4XSxbNiwzMCw1Niw4Ml0sWzYsMzAsNTgsODZdLFs2LDM0LDYyLDkwXSxbNiwyOCw1MCw3Miw5NF0sWzYsMjYsNTAsNzQsOThdLFs2LDMwLDU0LDc4LDEwMl0sWzYsMjgsNTQsODAsMTA2XSxbNiwzMiw1OCw4NCwxMTBdLFs2LDMwLDU4LDg2LDExNF0sWzYsMzQsNjIsOTAsMTE4XSxbNiwyNiw1MCw3NCw5OCwxMjJdLFs2LDMwLDU0LDc4LDEwMiwxMjZdLFs2LDI2LDUyLDc4LDEwNCwxMzBdLFs2LDMwLDU2LDgyLDEwOCwxMzRdLFs2LDM0LDYwLDg2LDExMiwxMzhdLFs2LDMwLDU4LDg2LDExNCwxNDJdLFs2LDM0LDYyLDkwLDExOCwxNDZdLFs2LDMwLDU0LDc4LDEwMiwxMjYsMTUwXSxbNiwyNCw1MCw3NiwxMDIsMTI4LDE1NF0sWzYsMjgsNTQsODAsMTA2LDEzMiwxNThdLFs2LDMyLDU4LDg0LDExMCwxMzYsMTYyXSxbNiwyNiw1NCw4MiwxMTAsMTM4LDE2Nl0sWzYsMzAsNTgsODYsMTE0LDE0MiwxNzBdXSxHMTU6KDE8PDEwKXwoMTw8OCl8KDE8PDUpfCgxPDw0KXwoMTw8Mil8KDE8PDEpfCgxPDwwKSxHMTg6KDE8PDEyKXwoMTw8MTEpfCgxPDwxMCl8KDE8PDkpfCgxPDw4KXwoMTw8NSl8KDE8PDIpfCgxPDwwKSxHMTVfTUFTSzooMTw8MTQpfCgxPDwxMil8KDE8PDEwKXwoMTw8NCl8KDE8PDEpLGdldEJDSFR5cGVJbmZvOmZ1bmN0aW9uKGRhdGEpe3ZhciBkPWRhdGE8PDEwO3doaWxlKFFSVXRpbC5nZXRCQ0hEaWdpdChkKS1RUlV0aWwuZ2V0QkNIRGlnaXQoUVJVdGlsLkcxNSk+PTApe2RePShRUlV0aWwuRzE1PDwoUVJVdGlsLmdldEJDSERpZ2l0KGQpLVFSVXRpbC5nZXRCQ0hEaWdpdChRUlV0aWwuRzE1KSkpO31cblx0cmV0dXJuKChkYXRhPDwxMCl8ZCleUVJVdGlsLkcxNV9NQVNLO30sZ2V0QkNIVHlwZU51bWJlcjpmdW5jdGlvbihkYXRhKXt2YXIgZD1kYXRhPDwxMjt3aGlsZShRUlV0aWwuZ2V0QkNIRGlnaXQoZCktUVJVdGlsLmdldEJDSERpZ2l0KFFSVXRpbC5HMTgpPj0wKXtkXj0oUVJVdGlsLkcxODw8KFFSVXRpbC5nZXRCQ0hEaWdpdChkKS1RUlV0aWwuZ2V0QkNIRGlnaXQoUVJVdGlsLkcxOCkpKTt9XG5cdHJldHVybihkYXRhPDwxMil8ZDt9LGdldEJDSERpZ2l0OmZ1bmN0aW9uKGRhdGEpe3ZhciBkaWdpdD0wO3doaWxlKGRhdGEhPTApe2RpZ2l0Kys7ZGF0YT4+Pj0xO31cblx0cmV0dXJuIGRpZ2l0O30sZ2V0UGF0dGVyblBvc2l0aW9uOmZ1bmN0aW9uKHR5cGVOdW1iZXIpe3JldHVybiBRUlV0aWwuUEFUVEVSTl9QT1NJVElPTl9UQUJMRVt0eXBlTnVtYmVyLTFdO30sZ2V0TWFzazpmdW5jdGlvbihtYXNrUGF0dGVybixpLGope3N3aXRjaChtYXNrUGF0dGVybil7Y2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMDA6cmV0dXJuKGkraiklMj09MDtjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAwMTpyZXR1cm4gaSUyPT0wO2Nhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDEwOnJldHVybiBqJTM9PTA7Y2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMTE6cmV0dXJuKGkraiklMz09MDtjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjEwMDpyZXR1cm4oTWF0aC5mbG9vcihpLzIpK01hdGguZmxvb3Ioai8zKSklMj09MDtjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjEwMTpyZXR1cm4oaSpqKSUyKyhpKmopJTM9PTA7Y2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMTA6cmV0dXJuKChpKmopJTIrKGkqaiklMyklMj09MDtjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjExMTpyZXR1cm4oKGkqaiklMysoaStqKSUyKSUyPT0wO2RlZmF1bHQ6dGhyb3cgbmV3IEVycm9yKFwiYmFkIG1hc2tQYXR0ZXJuOlwiK21hc2tQYXR0ZXJuKTt9fSxnZXRFcnJvckNvcnJlY3RQb2x5bm9taWFsOmZ1bmN0aW9uKGVycm9yQ29ycmVjdExlbmd0aCl7dmFyIGE9bmV3IFFSUG9seW5vbWlhbChbMV0sMCk7Zm9yKHZhciBpPTA7aTxlcnJvckNvcnJlY3RMZW5ndGg7aSsrKXthPWEubXVsdGlwbHkobmV3IFFSUG9seW5vbWlhbChbMSxRUk1hdGguZ2V4cChpKV0sMCkpO31cblx0cmV0dXJuIGE7fSxnZXRMZW5ndGhJbkJpdHM6ZnVuY3Rpb24obW9kZSx0eXBlKXtpZigxPD10eXBlJiZ0eXBlPDEwKXtzd2l0Y2gobW9kZSl7Y2FzZSBRUk1vZGUuTU9ERV9OVU1CRVI6cmV0dXJuIDEwO2Nhc2UgUVJNb2RlLk1PREVfQUxQSEFfTlVNOnJldHVybiA5O2Nhc2UgUVJNb2RlLk1PREVfOEJJVF9CWVRFOnJldHVybiA4O2Nhc2UgUVJNb2RlLk1PREVfS0FOSkk6cmV0dXJuIDg7ZGVmYXVsdDp0aHJvdyBuZXcgRXJyb3IoXCJtb2RlOlwiK21vZGUpO319ZWxzZSBpZih0eXBlPDI3KXtzd2l0Y2gobW9kZSl7Y2FzZSBRUk1vZGUuTU9ERV9OVU1CRVI6cmV0dXJuIDEyO2Nhc2UgUVJNb2RlLk1PREVfQUxQSEFfTlVNOnJldHVybiAxMTtjYXNlIFFSTW9kZS5NT0RFXzhCSVRfQllURTpyZXR1cm4gMTY7Y2FzZSBRUk1vZGUuTU9ERV9LQU5KSTpyZXR1cm4gMTA7ZGVmYXVsdDp0aHJvdyBuZXcgRXJyb3IoXCJtb2RlOlwiK21vZGUpO319ZWxzZSBpZih0eXBlPDQxKXtzd2l0Y2gobW9kZSl7Y2FzZSBRUk1vZGUuTU9ERV9OVU1CRVI6cmV0dXJuIDE0O2Nhc2UgUVJNb2RlLk1PREVfQUxQSEFfTlVNOnJldHVybiAxMztjYXNlIFFSTW9kZS5NT0RFXzhCSVRfQllURTpyZXR1cm4gMTY7Y2FzZSBRUk1vZGUuTU9ERV9LQU5KSTpyZXR1cm4gMTI7ZGVmYXVsdDp0aHJvdyBuZXcgRXJyb3IoXCJtb2RlOlwiK21vZGUpO319ZWxzZXt0aHJvdyBuZXcgRXJyb3IoXCJ0eXBlOlwiK3R5cGUpO319LGdldExvc3RQb2ludDpmdW5jdGlvbihxckNvZGUpe3ZhciBtb2R1bGVDb3VudD1xckNvZGUuZ2V0TW9kdWxlQ291bnQoKTt2YXIgbG9zdFBvaW50PTA7Zm9yKHZhciByb3c9MDtyb3c8bW9kdWxlQ291bnQ7cm93Kyspe2Zvcih2YXIgY29sPTA7Y29sPG1vZHVsZUNvdW50O2NvbCsrKXt2YXIgc2FtZUNvdW50PTA7dmFyIGRhcms9cXJDb2RlLmlzRGFyayhyb3csY29sKTtmb3IodmFyIHI9LTE7cjw9MTtyKyspe2lmKHJvdytyPDB8fG1vZHVsZUNvdW50PD1yb3crcil7Y29udGludWU7fVxuXHRmb3IodmFyIGM9LTE7Yzw9MTtjKyspe2lmKGNvbCtjPDB8fG1vZHVsZUNvdW50PD1jb2wrYyl7Y29udGludWU7fVxuXHRpZihyPT0wJiZjPT0wKXtjb250aW51ZTt9XG5cdGlmKGRhcms9PXFyQ29kZS5pc0Rhcmsocm93K3IsY29sK2MpKXtzYW1lQ291bnQrKzt9fX1cblx0aWYoc2FtZUNvdW50PjUpe2xvc3RQb2ludCs9KDMrc2FtZUNvdW50LTUpO319fVxuXHRmb3IodmFyIHJvdz0wO3Jvdzxtb2R1bGVDb3VudC0xO3JvdysrKXtmb3IodmFyIGNvbD0wO2NvbDxtb2R1bGVDb3VudC0xO2NvbCsrKXt2YXIgY291bnQ9MDtpZihxckNvZGUuaXNEYXJrKHJvdyxjb2wpKWNvdW50Kys7aWYocXJDb2RlLmlzRGFyayhyb3crMSxjb2wpKWNvdW50Kys7aWYocXJDb2RlLmlzRGFyayhyb3csY29sKzEpKWNvdW50Kys7aWYocXJDb2RlLmlzRGFyayhyb3crMSxjb2wrMSkpY291bnQrKztpZihjb3VudD09MHx8Y291bnQ9PTQpe2xvc3RQb2ludCs9Mzt9fX1cblx0Zm9yKHZhciByb3c9MDtyb3c8bW9kdWxlQ291bnQ7cm93Kyspe2Zvcih2YXIgY29sPTA7Y29sPG1vZHVsZUNvdW50LTY7Y29sKyspe2lmKHFyQ29kZS5pc0Rhcmsocm93LGNvbCkmJiFxckNvZGUuaXNEYXJrKHJvdyxjb2wrMSkmJnFyQ29kZS5pc0Rhcmsocm93LGNvbCsyKSYmcXJDb2RlLmlzRGFyayhyb3csY29sKzMpJiZxckNvZGUuaXNEYXJrKHJvdyxjb2wrNCkmJiFxckNvZGUuaXNEYXJrKHJvdyxjb2wrNSkmJnFyQ29kZS5pc0Rhcmsocm93LGNvbCs2KSl7bG9zdFBvaW50Kz00MDt9fX1cblx0Zm9yKHZhciBjb2w9MDtjb2w8bW9kdWxlQ291bnQ7Y29sKyspe2Zvcih2YXIgcm93PTA7cm93PG1vZHVsZUNvdW50LTY7cm93Kyspe2lmKHFyQ29kZS5pc0Rhcmsocm93LGNvbCkmJiFxckNvZGUuaXNEYXJrKHJvdysxLGNvbCkmJnFyQ29kZS5pc0Rhcmsocm93KzIsY29sKSYmcXJDb2RlLmlzRGFyayhyb3crMyxjb2wpJiZxckNvZGUuaXNEYXJrKHJvdys0LGNvbCkmJiFxckNvZGUuaXNEYXJrKHJvdys1LGNvbCkmJnFyQ29kZS5pc0Rhcmsocm93KzYsY29sKSl7bG9zdFBvaW50Kz00MDt9fX1cblx0dmFyIGRhcmtDb3VudD0wO2Zvcih2YXIgY29sPTA7Y29sPG1vZHVsZUNvdW50O2NvbCsrKXtmb3IodmFyIHJvdz0wO3Jvdzxtb2R1bGVDb3VudDtyb3crKyl7aWYocXJDb2RlLmlzRGFyayhyb3csY29sKSl7ZGFya0NvdW50Kys7fX19XG5cdHZhciByYXRpbz1NYXRoLmFicygxMDAqZGFya0NvdW50L21vZHVsZUNvdW50L21vZHVsZUNvdW50LTUwKS81O2xvc3RQb2ludCs9cmF0aW8qMTA7cmV0dXJuIGxvc3RQb2ludDt9fTt2YXIgUVJNYXRoPXtnbG9nOmZ1bmN0aW9uKG4pe2lmKG48MSl7dGhyb3cgbmV3IEVycm9yKFwiZ2xvZyhcIituK1wiKVwiKTt9XG5cdHJldHVybiBRUk1hdGguTE9HX1RBQkxFW25dO30sZ2V4cDpmdW5jdGlvbihuKXt3aGlsZShuPDApe24rPTI1NTt9XG5cdHdoaWxlKG4+PTI1Nil7bi09MjU1O31cblx0cmV0dXJuIFFSTWF0aC5FWFBfVEFCTEVbbl07fSxFWFBfVEFCTEU6bmV3IEFycmF5KDI1NiksTE9HX1RBQkxFOm5ldyBBcnJheSgyNTYpfTtmb3IodmFyIGk9MDtpPDg7aSsrKXtRUk1hdGguRVhQX1RBQkxFW2ldPTE8PGk7fVxuXHRmb3IodmFyIGk9ODtpPDI1NjtpKyspe1FSTWF0aC5FWFBfVEFCTEVbaV09UVJNYXRoLkVYUF9UQUJMRVtpLTRdXlFSTWF0aC5FWFBfVEFCTEVbaS01XV5RUk1hdGguRVhQX1RBQkxFW2ktNl1eUVJNYXRoLkVYUF9UQUJMRVtpLThdO31cblx0Zm9yKHZhciBpPTA7aTwyNTU7aSsrKXtRUk1hdGguTE9HX1RBQkxFW1FSTWF0aC5FWFBfVEFCTEVbaV1dPWk7fVxuXHRmdW5jdGlvbiBRUlBvbHlub21pYWwobnVtLHNoaWZ0KXtpZihudW0ubGVuZ3RoPT11bmRlZmluZWQpe3Rocm93IG5ldyBFcnJvcihudW0ubGVuZ3RoK1wiL1wiK3NoaWZ0KTt9XG5cdHZhciBvZmZzZXQ9MDt3aGlsZShvZmZzZXQ8bnVtLmxlbmd0aCYmbnVtW29mZnNldF09PTApe29mZnNldCsrO31cblx0dGhpcy5udW09bmV3IEFycmF5KG51bS5sZW5ndGgtb2Zmc2V0K3NoaWZ0KTtmb3IodmFyIGk9MDtpPG51bS5sZW5ndGgtb2Zmc2V0O2krKyl7dGhpcy5udW1baV09bnVtW2krb2Zmc2V0XTt9fVxuXHRRUlBvbHlub21pYWwucHJvdG90eXBlPXtnZXQ6ZnVuY3Rpb24oaW5kZXgpe3JldHVybiB0aGlzLm51bVtpbmRleF07fSxnZXRMZW5ndGg6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5udW0ubGVuZ3RoO30sbXVsdGlwbHk6ZnVuY3Rpb24oZSl7dmFyIG51bT1uZXcgQXJyYXkodGhpcy5nZXRMZW5ndGgoKStlLmdldExlbmd0aCgpLTEpO2Zvcih2YXIgaT0wO2k8dGhpcy5nZXRMZW5ndGgoKTtpKyspe2Zvcih2YXIgaj0wO2o8ZS5nZXRMZW5ndGgoKTtqKyspe251bVtpK2pdXj1RUk1hdGguZ2V4cChRUk1hdGguZ2xvZyh0aGlzLmdldChpKSkrUVJNYXRoLmdsb2coZS5nZXQoaikpKTt9fVxuXHRyZXR1cm4gbmV3IFFSUG9seW5vbWlhbChudW0sMCk7fSxtb2Q6ZnVuY3Rpb24oZSl7aWYodGhpcy5nZXRMZW5ndGgoKS1lLmdldExlbmd0aCgpPDApe3JldHVybiB0aGlzO31cblx0dmFyIHJhdGlvPVFSTWF0aC5nbG9nKHRoaXMuZ2V0KDApKS1RUk1hdGguZ2xvZyhlLmdldCgwKSk7dmFyIG51bT1uZXcgQXJyYXkodGhpcy5nZXRMZW5ndGgoKSk7Zm9yKHZhciBpPTA7aTx0aGlzLmdldExlbmd0aCgpO2krKyl7bnVtW2ldPXRoaXMuZ2V0KGkpO31cblx0Zm9yKHZhciBpPTA7aTxlLmdldExlbmd0aCgpO2krKyl7bnVtW2ldXj1RUk1hdGguZ2V4cChRUk1hdGguZ2xvZyhlLmdldChpKSkrcmF0aW8pO31cblx0cmV0dXJuIG5ldyBRUlBvbHlub21pYWwobnVtLDApLm1vZChlKTt9fTtmdW5jdGlvbiBRUlJTQmxvY2sodG90YWxDb3VudCxkYXRhQ291bnQpe3RoaXMudG90YWxDb3VudD10b3RhbENvdW50O3RoaXMuZGF0YUNvdW50PWRhdGFDb3VudDt9XG5cdFFSUlNCbG9jay5SU19CTE9DS19UQUJMRT1bWzEsMjYsMTldLFsxLDI2LDE2XSxbMSwyNiwxM10sWzEsMjYsOV0sWzEsNDQsMzRdLFsxLDQ0LDI4XSxbMSw0NCwyMl0sWzEsNDQsMTZdLFsxLDcwLDU1XSxbMSw3MCw0NF0sWzIsMzUsMTddLFsyLDM1LDEzXSxbMSwxMDAsODBdLFsyLDUwLDMyXSxbMiw1MCwyNF0sWzQsMjUsOV0sWzEsMTM0LDEwOF0sWzIsNjcsNDNdLFsyLDMzLDE1LDIsMzQsMTZdLFsyLDMzLDExLDIsMzQsMTJdLFsyLDg2LDY4XSxbNCw0MywyN10sWzQsNDMsMTldLFs0LDQzLDE1XSxbMiw5OCw3OF0sWzQsNDksMzFdLFsyLDMyLDE0LDQsMzMsMTVdLFs0LDM5LDEzLDEsNDAsMTRdLFsyLDEyMSw5N10sWzIsNjAsMzgsMiw2MSwzOV0sWzQsNDAsMTgsMiw0MSwxOV0sWzQsNDAsMTQsMiw0MSwxNV0sWzIsMTQ2LDExNl0sWzMsNTgsMzYsMiw1OSwzN10sWzQsMzYsMTYsNCwzNywxN10sWzQsMzYsMTIsNCwzNywxM10sWzIsODYsNjgsMiw4Nyw2OV0sWzQsNjksNDMsMSw3MCw0NF0sWzYsNDMsMTksMiw0NCwyMF0sWzYsNDMsMTUsMiw0NCwxNl0sWzQsMTAxLDgxXSxbMSw4MCw1MCw0LDgxLDUxXSxbNCw1MCwyMiw0LDUxLDIzXSxbMywzNiwxMiw4LDM3LDEzXSxbMiwxMTYsOTIsMiwxMTcsOTNdLFs2LDU4LDM2LDIsNTksMzddLFs0LDQ2LDIwLDYsNDcsMjFdLFs3LDQyLDE0LDQsNDMsMTVdLFs0LDEzMywxMDddLFs4LDU5LDM3LDEsNjAsMzhdLFs4LDQ0LDIwLDQsNDUsMjFdLFsxMiwzMywxMSw0LDM0LDEyXSxbMywxNDUsMTE1LDEsMTQ2LDExNl0sWzQsNjQsNDAsNSw2NSw0MV0sWzExLDM2LDE2LDUsMzcsMTddLFsxMSwzNiwxMiw1LDM3LDEzXSxbNSwxMDksODcsMSwxMTAsODhdLFs1LDY1LDQxLDUsNjYsNDJdLFs1LDU0LDI0LDcsNTUsMjVdLFsxMSwzNiwxMl0sWzUsMTIyLDk4LDEsMTIzLDk5XSxbNyw3Myw0NSwzLDc0LDQ2XSxbMTUsNDMsMTksMiw0NCwyMF0sWzMsNDUsMTUsMTMsNDYsMTZdLFsxLDEzNSwxMDcsNSwxMzYsMTA4XSxbMTAsNzQsNDYsMSw3NSw0N10sWzEsNTAsMjIsMTUsNTEsMjNdLFsyLDQyLDE0LDE3LDQzLDE1XSxbNSwxNTAsMTIwLDEsMTUxLDEyMV0sWzksNjksNDMsNCw3MCw0NF0sWzE3LDUwLDIyLDEsNTEsMjNdLFsyLDQyLDE0LDE5LDQzLDE1XSxbMywxNDEsMTEzLDQsMTQyLDExNF0sWzMsNzAsNDQsMTEsNzEsNDVdLFsxNyw0NywyMSw0LDQ4LDIyXSxbOSwzOSwxMywxNiw0MCwxNF0sWzMsMTM1LDEwNyw1LDEzNiwxMDhdLFszLDY3LDQxLDEzLDY4LDQyXSxbMTUsNTQsMjQsNSw1NSwyNV0sWzE1LDQzLDE1LDEwLDQ0LDE2XSxbNCwxNDQsMTE2LDQsMTQ1LDExN10sWzE3LDY4LDQyXSxbMTcsNTAsMjIsNiw1MSwyM10sWzE5LDQ2LDE2LDYsNDcsMTddLFsyLDEzOSwxMTEsNywxNDAsMTEyXSxbMTcsNzQsNDZdLFs3LDU0LDI0LDE2LDU1LDI1XSxbMzQsMzcsMTNdLFs0LDE1MSwxMjEsNSwxNTIsMTIyXSxbNCw3NSw0NywxNCw3Niw0OF0sWzExLDU0LDI0LDE0LDU1LDI1XSxbMTYsNDUsMTUsMTQsNDYsMTZdLFs2LDE0NywxMTcsNCwxNDgsMTE4XSxbNiw3Myw0NSwxNCw3NCw0Nl0sWzExLDU0LDI0LDE2LDU1LDI1XSxbMzAsNDYsMTYsMiw0NywxN10sWzgsMTMyLDEwNiw0LDEzMywxMDddLFs4LDc1LDQ3LDEzLDc2LDQ4XSxbNyw1NCwyNCwyMiw1NSwyNV0sWzIyLDQ1LDE1LDEzLDQ2LDE2XSxbMTAsMTQyLDExNCwyLDE0MywxMTVdLFsxOSw3NCw0Niw0LDc1LDQ3XSxbMjgsNTAsMjIsNiw1MSwyM10sWzMzLDQ2LDE2LDQsNDcsMTddLFs4LDE1MiwxMjIsNCwxNTMsMTIzXSxbMjIsNzMsNDUsMyw3NCw0Nl0sWzgsNTMsMjMsMjYsNTQsMjRdLFsxMiw0NSwxNSwyOCw0NiwxNl0sWzMsMTQ3LDExNywxMCwxNDgsMTE4XSxbMyw3Myw0NSwyMyw3NCw0Nl0sWzQsNTQsMjQsMzEsNTUsMjVdLFsxMSw0NSwxNSwzMSw0NiwxNl0sWzcsMTQ2LDExNiw3LDE0NywxMTddLFsyMSw3Myw0NSw3LDc0LDQ2XSxbMSw1MywyMywzNyw1NCwyNF0sWzE5LDQ1LDE1LDI2LDQ2LDE2XSxbNSwxNDUsMTE1LDEwLDE0NiwxMTZdLFsxOSw3NSw0NywxMCw3Niw0OF0sWzE1LDU0LDI0LDI1LDU1LDI1XSxbMjMsNDUsMTUsMjUsNDYsMTZdLFsxMywxNDUsMTE1LDMsMTQ2LDExNl0sWzIsNzQsNDYsMjksNzUsNDddLFs0Miw1NCwyNCwxLDU1LDI1XSxbMjMsNDUsMTUsMjgsNDYsMTZdLFsxNywxNDUsMTE1XSxbMTAsNzQsNDYsMjMsNzUsNDddLFsxMCw1NCwyNCwzNSw1NSwyNV0sWzE5LDQ1LDE1LDM1LDQ2LDE2XSxbMTcsMTQ1LDExNSwxLDE0NiwxMTZdLFsxNCw3NCw0NiwyMSw3NSw0N10sWzI5LDU0LDI0LDE5LDU1LDI1XSxbMTEsNDUsMTUsNDYsNDYsMTZdLFsxMywxNDUsMTE1LDYsMTQ2LDExNl0sWzE0LDc0LDQ2LDIzLDc1LDQ3XSxbNDQsNTQsMjQsNyw1NSwyNV0sWzU5LDQ2LDE2LDEsNDcsMTddLFsxMiwxNTEsMTIxLDcsMTUyLDEyMl0sWzEyLDc1LDQ3LDI2LDc2LDQ4XSxbMzksNTQsMjQsMTQsNTUsMjVdLFsyMiw0NSwxNSw0MSw0NiwxNl0sWzYsMTUxLDEyMSwxNCwxNTIsMTIyXSxbNiw3NSw0NywzNCw3Niw0OF0sWzQ2LDU0LDI0LDEwLDU1LDI1XSxbMiw0NSwxNSw2NCw0NiwxNl0sWzE3LDE1MiwxMjIsNCwxNTMsMTIzXSxbMjksNzQsNDYsMTQsNzUsNDddLFs0OSw1NCwyNCwxMCw1NSwyNV0sWzI0LDQ1LDE1LDQ2LDQ2LDE2XSxbNCwxNTIsMTIyLDE4LDE1MywxMjNdLFsxMyw3NCw0NiwzMiw3NSw0N10sWzQ4LDU0LDI0LDE0LDU1LDI1XSxbNDIsNDUsMTUsMzIsNDYsMTZdLFsyMCwxNDcsMTE3LDQsMTQ4LDExOF0sWzQwLDc1LDQ3LDcsNzYsNDhdLFs0Myw1NCwyNCwyMiw1NSwyNV0sWzEwLDQ1LDE1LDY3LDQ2LDE2XSxbMTksMTQ4LDExOCw2LDE0OSwxMTldLFsxOCw3NSw0NywzMSw3Niw0OF0sWzM0LDU0LDI0LDM0LDU1LDI1XSxbMjAsNDUsMTUsNjEsNDYsMTZdXTtRUlJTQmxvY2suZ2V0UlNCbG9ja3M9ZnVuY3Rpb24odHlwZU51bWJlcixlcnJvckNvcnJlY3RMZXZlbCl7dmFyIHJzQmxvY2s9UVJSU0Jsb2NrLmdldFJzQmxvY2tUYWJsZSh0eXBlTnVtYmVyLGVycm9yQ29ycmVjdExldmVsKTtpZihyc0Jsb2NrPT11bmRlZmluZWQpe3Rocm93IG5ldyBFcnJvcihcImJhZCBycyBibG9jayBAIHR5cGVOdW1iZXI6XCIrdHlwZU51bWJlcitcIi9lcnJvckNvcnJlY3RMZXZlbDpcIitlcnJvckNvcnJlY3RMZXZlbCk7fVxuXHR2YXIgbGVuZ3RoPXJzQmxvY2subGVuZ3RoLzM7dmFyIGxpc3Q9W107Zm9yKHZhciBpPTA7aTxsZW5ndGg7aSsrKXt2YXIgY291bnQ9cnNCbG9ja1tpKjMrMF07dmFyIHRvdGFsQ291bnQ9cnNCbG9ja1tpKjMrMV07dmFyIGRhdGFDb3VudD1yc0Jsb2NrW2kqMysyXTtmb3IodmFyIGo9MDtqPGNvdW50O2orKyl7bGlzdC5wdXNoKG5ldyBRUlJTQmxvY2sodG90YWxDb3VudCxkYXRhQ291bnQpKTt9fVxuXHRyZXR1cm4gbGlzdDt9O1FSUlNCbG9jay5nZXRSc0Jsb2NrVGFibGU9ZnVuY3Rpb24odHlwZU51bWJlcixlcnJvckNvcnJlY3RMZXZlbCl7c3dpdGNoKGVycm9yQ29ycmVjdExldmVsKXtjYXNlIFFSRXJyb3JDb3JyZWN0TGV2ZWwuTDpyZXR1cm4gUVJSU0Jsb2NrLlJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyLTEpKjQrMF07Y2FzZSBRUkVycm9yQ29ycmVjdExldmVsLk06cmV0dXJuIFFSUlNCbG9jay5SU19CTE9DS19UQUJMRVsodHlwZU51bWJlci0xKSo0KzFdO2Nhc2UgUVJFcnJvckNvcnJlY3RMZXZlbC5ROnJldHVybiBRUlJTQmxvY2suUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXItMSkqNCsyXTtjYXNlIFFSRXJyb3JDb3JyZWN0TGV2ZWwuSDpyZXR1cm4gUVJSU0Jsb2NrLlJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyLTEpKjQrM107ZGVmYXVsdDpyZXR1cm4gdW5kZWZpbmVkO319O2Z1bmN0aW9uIFFSQml0QnVmZmVyKCl7dGhpcy5idWZmZXI9W107dGhpcy5sZW5ndGg9MDt9XG5cdFFSQml0QnVmZmVyLnByb3RvdHlwZT17Z2V0OmZ1bmN0aW9uKGluZGV4KXt2YXIgYnVmSW5kZXg9TWF0aC5mbG9vcihpbmRleC84KTtyZXR1cm4oKHRoaXMuYnVmZmVyW2J1ZkluZGV4XT4+Pig3LWluZGV4JTgpKSYxKT09MTt9LHB1dDpmdW5jdGlvbihudW0sbGVuZ3RoKXtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKyspe3RoaXMucHV0Qml0KCgobnVtPj4+KGxlbmd0aC1pLTEpKSYxKT09MSk7fX0sZ2V0TGVuZ3RoSW5CaXRzOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubGVuZ3RoO30scHV0Qml0OmZ1bmN0aW9uKGJpdCl7dmFyIGJ1ZkluZGV4PU1hdGguZmxvb3IodGhpcy5sZW5ndGgvOCk7aWYodGhpcy5idWZmZXIubGVuZ3RoPD1idWZJbmRleCl7dGhpcy5idWZmZXIucHVzaCgwKTt9XG5cdGlmKGJpdCl7dGhpcy5idWZmZXJbYnVmSW5kZXhdfD0oMHg4MD4+Pih0aGlzLmxlbmd0aCU4KSk7fVxuXHR0aGlzLmxlbmd0aCsrO319O3ZhciBRUkNvZGVMaW1pdExlbmd0aD1bWzE3LDE0LDExLDddLFszMiwyNiwyMCwxNF0sWzUzLDQyLDMyLDI0XSxbNzgsNjIsNDYsMzRdLFsxMDYsODQsNjAsNDRdLFsxMzQsMTA2LDc0LDU4XSxbMTU0LDEyMiw4Niw2NF0sWzE5MiwxNTIsMTA4LDg0XSxbMjMwLDE4MCwxMzAsOThdLFsyNzEsMjEzLDE1MSwxMTldLFszMjEsMjUxLDE3NywxMzddLFszNjcsMjg3LDIwMywxNTVdLFs0MjUsMzMxLDI0MSwxNzddLFs0NTgsMzYyLDI1OCwxOTRdLFs1MjAsNDEyLDI5MiwyMjBdLFs1ODYsNDUwLDMyMiwyNTBdLFs2NDQsNTA0LDM2NCwyODBdLFs3MTgsNTYwLDM5NCwzMTBdLFs3OTIsNjI0LDQ0MiwzMzhdLFs4NTgsNjY2LDQ4MiwzODJdLFs5MjksNzExLDUwOSw0MDNdLFsxMDAzLDc3OSw1NjUsNDM5XSxbMTA5MSw4NTcsNjExLDQ2MV0sWzExNzEsOTExLDY2MSw1MTFdLFsxMjczLDk5Nyw3MTUsNTM1XSxbMTM2NywxMDU5LDc1MSw1OTNdLFsxNDY1LDExMjUsODA1LDYyNV0sWzE1MjgsMTE5MCw4NjgsNjU4XSxbMTYyOCwxMjY0LDkwOCw2OThdLFsxNzMyLDEzNzAsOTgyLDc0Ml0sWzE4NDAsMTQ1MiwxMDMwLDc5MF0sWzE5NTIsMTUzOCwxMTEyLDg0Ml0sWzIwNjgsMTYyOCwxMTY4LDg5OF0sWzIxODgsMTcyMiwxMjI4LDk1OF0sWzIzMDMsMTgwOSwxMjgzLDk4M10sWzI0MzEsMTkxMSwxMzUxLDEwNTFdLFsyNTYzLDE5ODksMTQyMywxMDkzXSxbMjY5OSwyMDk5LDE0OTksMTEzOV0sWzI4MDksMjIxMywxNTc5LDEyMTldLFsyOTUzLDIzMzEsMTY2MywxMjczXV07XG5cdFxuXHRmdW5jdGlvbiBfaXNTdXBwb3J0Q2FudmFzKCkge1xuXHRcdHJldHVybiB0eXBlb2YgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEICE9IFwidW5kZWZpbmVkXCI7XG5cdH1cblx0XG5cdC8vIGFuZHJvaWQgMi54IGRvZXNuJ3Qgc3VwcG9ydCBEYXRhLVVSSSBzcGVjXG5cdGZ1bmN0aW9uIF9nZXRBbmRyb2lkKCkge1xuXHRcdHZhciBhbmRyb2lkID0gZmFsc2U7XG5cdFx0dmFyIHNBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG5cdFx0XG5cdFx0aWYgKC9hbmRyb2lkL2kudGVzdChzQWdlbnQpKSB7IC8vIGFuZHJvaWRcblx0XHRcdGFuZHJvaWQgPSB0cnVlO1xuXHRcdFx0dmFyIGFNYXQgPSBzQWdlbnQudG9TdHJpbmcoKS5tYXRjaCgvYW5kcm9pZCAoWzAtOV1cXC5bMC05XSkvaSk7XG5cdFx0XHRcblx0XHRcdGlmIChhTWF0ICYmIGFNYXRbMV0pIHtcblx0XHRcdFx0YW5kcm9pZCA9IHBhcnNlRmxvYXQoYU1hdFsxXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBhbmRyb2lkO1xuXHR9XG5cdFxuXHR2YXIgc3ZnRHJhd2VyID0gKGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIERyYXdpbmcgPSBmdW5jdGlvbiAoZWwsIGh0T3B0aW9uKSB7XG5cdFx0XHR0aGlzLl9lbCA9IGVsO1xuXHRcdFx0dGhpcy5faHRPcHRpb24gPSBodE9wdGlvbjtcblx0XHR9O1xuXG5cdFx0RHJhd2luZy5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChvUVJDb2RlKSB7XG5cdFx0XHR2YXIgX2h0T3B0aW9uID0gdGhpcy5faHRPcHRpb247XG5cdFx0XHR2YXIgX2VsID0gdGhpcy5fZWw7XG5cdFx0XHR2YXIgbkNvdW50ID0gb1FSQ29kZS5nZXRNb2R1bGVDb3VudCgpO1xuXHRcdFx0dmFyIG5XaWR0aCA9IE1hdGguZmxvb3IoX2h0T3B0aW9uLndpZHRoIC8gbkNvdW50KTtcblx0XHRcdHZhciBuSGVpZ2h0ID0gTWF0aC5mbG9vcihfaHRPcHRpb24uaGVpZ2h0IC8gbkNvdW50KTtcblxuXHRcdFx0dGhpcy5jbGVhcigpO1xuXG5cdFx0XHRmdW5jdGlvbiBtYWtlU1ZHKHRhZywgYXR0cnMpIHtcblx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIHRhZyk7XG5cdFx0XHRcdGZvciAodmFyIGsgaW4gYXR0cnMpXG5cdFx0XHRcdFx0aWYgKGF0dHJzLmhhc093blByb3BlcnR5KGspKSBlbC5zZXRBdHRyaWJ1dGUoaywgYXR0cnNba10pO1xuXHRcdFx0XHRyZXR1cm4gZWw7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzdmcgPSBtYWtlU1ZHKFwic3ZnXCIgLCB7J3ZpZXdCb3gnOiAnMCAwICcgKyBTdHJpbmcobkNvdW50KSArIFwiIFwiICsgU3RyaW5nKG5Db3VudCksICd3aWR0aCc6ICcxMDAlJywgJ2hlaWdodCc6ICcxMDAlJywgJ2ZpbGwnOiBfaHRPcHRpb24uY29sb3JMaWdodH0pO1xuXHRcdFx0c3ZnLnNldEF0dHJpYnV0ZU5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC94bWxucy9cIiwgXCJ4bWxuczp4bGlua1wiLCBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIik7XG5cdFx0XHRfZWwuYXBwZW5kQ2hpbGQoc3ZnKTtcblxuXHRcdFx0c3ZnLmFwcGVuZENoaWxkKG1ha2VTVkcoXCJyZWN0XCIsIHtcImZpbGxcIjogX2h0T3B0aW9uLmNvbG9yTGlnaHQsIFwid2lkdGhcIjogXCIxMDAlXCIsIFwiaGVpZ2h0XCI6IFwiMTAwJVwifSkpO1xuXHRcdFx0c3ZnLmFwcGVuZENoaWxkKG1ha2VTVkcoXCJyZWN0XCIsIHtcImZpbGxcIjogX2h0T3B0aW9uLmNvbG9yRGFyaywgXCJ3aWR0aFwiOiBcIjFcIiwgXCJoZWlnaHRcIjogXCIxXCIsIFwiaWRcIjogXCJ0ZW1wbGF0ZVwifSkpO1xuXG5cdFx0XHRmb3IgKHZhciByb3cgPSAwOyByb3cgPCBuQ291bnQ7IHJvdysrKSB7XG5cdFx0XHRcdGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG5Db3VudDsgY29sKyspIHtcblx0XHRcdFx0XHRpZiAob1FSQ29kZS5pc0Rhcmsocm93LCBjb2wpKSB7XG5cdFx0XHRcdFx0XHR2YXIgY2hpbGQgPSBtYWtlU1ZHKFwidXNlXCIsIHtcInhcIjogU3RyaW5nKHJvdyksIFwieVwiOiBTdHJpbmcoY29sKX0pO1xuXHRcdFx0XHRcdFx0Y2hpbGQuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIFwiaHJlZlwiLCBcIiN0ZW1wbGF0ZVwiKVxuXHRcdFx0XHRcdFx0c3ZnLmFwcGVuZENoaWxkKGNoaWxkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdERyYXdpbmcucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0d2hpbGUgKHRoaXMuX2VsLmhhc0NoaWxkTm9kZXMoKSlcblx0XHRcdFx0dGhpcy5fZWwucmVtb3ZlQ2hpbGQodGhpcy5fZWwubGFzdENoaWxkKTtcblx0XHR9O1xuXHRcdHJldHVybiBEcmF3aW5nO1xuXHR9KSgpO1xuXG5cdHZhciB1c2VTVkcgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcInN2Z1wiO1xuXG5cdC8vIERyYXdpbmcgaW4gRE9NIGJ5IHVzaW5nIFRhYmxlIHRhZ1xuXHR2YXIgRHJhd2luZyA9IHVzZVNWRyA/IHN2Z0RyYXdlciA6ICFfaXNTdXBwb3J0Q2FudmFzKCkgPyAoZnVuY3Rpb24gKCkge1xuXHRcdHZhciBEcmF3aW5nID0gZnVuY3Rpb24gKGVsLCBodE9wdGlvbikge1xuXHRcdFx0dGhpcy5fZWwgPSBlbDtcblx0XHRcdHRoaXMuX2h0T3B0aW9uID0gaHRPcHRpb247XG5cdFx0fTtcblx0XHRcdFxuXHRcdC8qKlxuXHRcdCAqIERyYXcgdGhlIFFSQ29kZVxuXHRcdCAqIFxuXHRcdCAqIEBwYXJhbSB7UVJDb2RlfSBvUVJDb2RlXG5cdFx0ICovXG5cdFx0RHJhd2luZy5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChvUVJDb2RlKSB7XG4gICAgICAgICAgICB2YXIgX2h0T3B0aW9uID0gdGhpcy5faHRPcHRpb247XG4gICAgICAgICAgICB2YXIgX2VsID0gdGhpcy5fZWw7XG5cdFx0XHR2YXIgbkNvdW50ID0gb1FSQ29kZS5nZXRNb2R1bGVDb3VudCgpO1xuXHRcdFx0dmFyIG5XaWR0aCA9IE1hdGguZmxvb3IoX2h0T3B0aW9uLndpZHRoIC8gbkNvdW50KTtcblx0XHRcdHZhciBuSGVpZ2h0ID0gTWF0aC5mbG9vcihfaHRPcHRpb24uaGVpZ2h0IC8gbkNvdW50KTtcblx0XHRcdHZhciBhSFRNTCA9IFsnPHRhYmxlIHN0eWxlPVwiYm9yZGVyOjA7Ym9yZGVyLWNvbGxhcHNlOmNvbGxhcHNlO1wiPiddO1xuXHRcdFx0XG5cdFx0XHRmb3IgKHZhciByb3cgPSAwOyByb3cgPCBuQ291bnQ7IHJvdysrKSB7XG5cdFx0XHRcdGFIVE1MLnB1c2goJzx0cj4nKTtcblx0XHRcdFx0XG5cdFx0XHRcdGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG5Db3VudDsgY29sKyspIHtcblx0XHRcdFx0XHRhSFRNTC5wdXNoKCc8dGQgc3R5bGU9XCJib3JkZXI6MDtib3JkZXItY29sbGFwc2U6Y29sbGFwc2U7cGFkZGluZzowO21hcmdpbjowO3dpZHRoOicgKyBuV2lkdGggKyAncHg7aGVpZ2h0OicgKyBuSGVpZ2h0ICsgJ3B4O2JhY2tncm91bmQtY29sb3I6JyArIChvUVJDb2RlLmlzRGFyayhyb3csIGNvbCkgPyBfaHRPcHRpb24uY29sb3JEYXJrIDogX2h0T3B0aW9uLmNvbG9yTGlnaHQpICsgJztcIj48L3RkPicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRhSFRNTC5wdXNoKCc8L3RyPicpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRhSFRNTC5wdXNoKCc8L3RhYmxlPicpO1xuXHRcdFx0X2VsLmlubmVySFRNTCA9IGFIVE1MLmpvaW4oJycpO1xuXHRcdFx0XG5cdFx0XHQvLyBGaXggdGhlIG1hcmdpbiB2YWx1ZXMgYXMgcmVhbCBzaXplLlxuXHRcdFx0dmFyIGVsVGFibGUgPSBfZWwuY2hpbGROb2Rlc1swXTtcblx0XHRcdHZhciBuTGVmdE1hcmdpblRhYmxlID0gKF9odE9wdGlvbi53aWR0aCAtIGVsVGFibGUub2Zmc2V0V2lkdGgpIC8gMjtcblx0XHRcdHZhciBuVG9wTWFyZ2luVGFibGUgPSAoX2h0T3B0aW9uLmhlaWdodCAtIGVsVGFibGUub2Zmc2V0SGVpZ2h0KSAvIDI7XG5cdFx0XHRcblx0XHRcdGlmIChuTGVmdE1hcmdpblRhYmxlID4gMCAmJiBuVG9wTWFyZ2luVGFibGUgPiAwKSB7XG5cdFx0XHRcdGVsVGFibGUuc3R5bGUubWFyZ2luID0gblRvcE1hcmdpblRhYmxlICsgXCJweCBcIiArIG5MZWZ0TWFyZ2luVGFibGUgKyBcInB4XCI7XHRcblx0XHRcdH1cblx0XHR9O1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIENsZWFyIHRoZSBRUkNvZGVcblx0XHQgKi9cblx0XHREcmF3aW5nLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHRoaXMuX2VsLmlubmVySFRNTCA9ICcnO1xuXHRcdH07XG5cdFx0XG5cdFx0cmV0dXJuIERyYXdpbmc7XG5cdH0pKCkgOiAoZnVuY3Rpb24gKCkgeyAvLyBEcmF3aW5nIGluIENhbnZhc1xuXHRcdGZ1bmN0aW9uIF9vbk1ha2VJbWFnZSgpIHtcblx0XHRcdHRoaXMuX2VsSW1hZ2Uuc3JjID0gdGhpcy5fZWxDYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuXHRcdFx0dGhpcy5fZWxJbWFnZS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuXHRcdFx0dGhpcy5fZWxDYW52YXMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1x0XHRcdFxuXHRcdH1cblx0XHRcblx0XHQvLyBBbmRyb2lkIDIuMSBidWcgd29ya2Fyb3VuZFxuXHRcdC8vIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9hbmRyb2lkL2lzc3Vlcy9kZXRhaWw/aWQ9NTE0MVxuXHRcdGlmICh0aGlzLl9hbmRyb2lkICYmIHRoaXMuX2FuZHJvaWQgPD0gMi4xKSB7XG5cdCAgICBcdHZhciBmYWN0b3IgPSAxIC8gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG5cdCAgICAgICAgdmFyIGRyYXdJbWFnZSA9IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC5wcm90b3R5cGUuZHJhd0ltYWdlOyBcblx0ICAgIFx0Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJELnByb3RvdHlwZS5kcmF3SW1hZ2UgPSBmdW5jdGlvbiAoaW1hZ2UsIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCkge1xuXHQgICAgXHRcdGlmICgoXCJub2RlTmFtZVwiIGluIGltYWdlKSAmJiAvaW1nL2kudGVzdChpbWFnZS5ub2RlTmFtZSkpIHtcblx0XHQgICAgICAgIFx0Zm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpID49IDE7IGktLSkge1xuXHRcdCAgICAgICAgICAgIFx0YXJndW1lbnRzW2ldID0gYXJndW1lbnRzW2ldICogZmFjdG9yO1xuXHRcdCAgICAgICAgXHR9XG5cdCAgICBcdFx0fSBlbHNlIGlmICh0eXBlb2YgZHcgPT0gXCJ1bmRlZmluZWRcIikge1xuXHQgICAgXHRcdFx0YXJndW1lbnRzWzFdICo9IGZhY3Rvcjtcblx0ICAgIFx0XHRcdGFyZ3VtZW50c1syXSAqPSBmYWN0b3I7XG5cdCAgICBcdFx0XHRhcmd1bWVudHNbM10gKj0gZmFjdG9yO1xuXHQgICAgXHRcdFx0YXJndW1lbnRzWzRdICo9IGZhY3Rvcjtcblx0ICAgIFx0XHR9XG5cdCAgICBcdFx0XG5cdCAgICAgICAgXHRkcmF3SW1hZ2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgXG5cdCAgICBcdH07XG5cdFx0fVxuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIENoZWNrIHdoZXRoZXIgdGhlIHVzZXIncyBicm93c2VyIHN1cHBvcnRzIERhdGEgVVJJIG9yIG5vdFxuXHRcdCAqIFxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICogQHBhcmFtIHtGdW5jdGlvbn0gZlN1Y2Nlc3MgT2NjdXJzIGlmIGl0IHN1cHBvcnRzIERhdGEgVVJJXG5cdFx0ICogQHBhcmFtIHtGdW5jdGlvbn0gZkZhaWwgT2NjdXJzIGlmIGl0IGRvZXNuJ3Qgc3VwcG9ydCBEYXRhIFVSSVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9zYWZlU2V0RGF0YVVSSShmU3VjY2VzcywgZkZhaWwpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHNlbGYuX2ZGYWlsID0gZkZhaWw7XG4gICAgICAgICAgICBzZWxmLl9mU3VjY2VzcyA9IGZTdWNjZXNzO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBpdCBqdXN0IG9uY2VcbiAgICAgICAgICAgIGlmIChzZWxmLl9iU3VwcG9ydERhdGFVUkkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICAgICAgICAgIHZhciBmT25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9iU3VwcG9ydERhdGFVUkkgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5fZkZhaWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2ZGYWlsLmNhbGwoc2VsZik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBmT25TdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2JTdXBwb3J0RGF0YVVSSSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuX2ZTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9mU3VjY2Vzcy5jYWxsKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGVsLm9uYWJvcnQgPSBmT25FcnJvcjtcbiAgICAgICAgICAgICAgICBlbC5vbmVycm9yID0gZk9uRXJyb3I7XG4gICAgICAgICAgICAgICAgZWwub25sb2FkID0gZk9uU3VjY2VzcztcbiAgICAgICAgICAgICAgICBlbC5zcmMgPSBcImRhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQVVBQUFBRkNBWUFBQUNOYnlibEFBQUFIRWxFUVZRSTEyUDQvLzgvdzM4R0lBWERJQktFMERIeGdsak5CQUFPOVRYTDBZNE9Id0FBQUFCSlJVNUVya0pnZ2c9PVwiOyAvLyB0aGUgSW1hZ2UgY29udGFpbnMgMXB4IGRhdGEuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzZWxmLl9iU3VwcG9ydERhdGFVUkkgPT09IHRydWUgJiYgc2VsZi5fZlN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9mU3VjY2Vzcy5jYWxsKHNlbGYpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzZWxmLl9iU3VwcG9ydERhdGFVUkkgPT09IGZhbHNlICYmIHNlbGYuX2ZGYWlsKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZkZhaWwuY2FsbChzZWxmKTtcbiAgICAgICAgICAgIH1cblx0XHR9O1xuXHRcdFxuXHRcdC8qKlxuXHRcdCAqIERyYXdpbmcgUVJDb2RlIGJ5IHVzaW5nIGNhbnZhc1xuXHRcdCAqIFxuXHRcdCAqIEBjb25zdHJ1Y3RvclxuXHRcdCAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IGh0T3B0aW9uIFFSQ29kZSBPcHRpb25zIFxuXHRcdCAqL1xuXHRcdHZhciBEcmF3aW5nID0gZnVuY3Rpb24gKGVsLCBodE9wdGlvbikge1xuICAgIFx0XHR0aGlzLl9iSXNQYWludGVkID0gZmFsc2U7XG4gICAgXHRcdHRoaXMuX2FuZHJvaWQgPSBfZ2V0QW5kcm9pZCgpO1xuXHRcdFxuXHRcdFx0dGhpcy5faHRPcHRpb24gPSBodE9wdGlvbjtcblx0XHRcdHRoaXMuX2VsQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0XHRcdHRoaXMuX2VsQ2FudmFzLndpZHRoID0gaHRPcHRpb24ud2lkdGg7XG5cdFx0XHR0aGlzLl9lbENhbnZhcy5oZWlnaHQgPSBodE9wdGlvbi5oZWlnaHQ7XG5cdFx0XHRlbC5hcHBlbmRDaGlsZCh0aGlzLl9lbENhbnZhcyk7XG5cdFx0XHR0aGlzLl9lbCA9IGVsO1xuXHRcdFx0dGhpcy5fb0NvbnRleHQgPSB0aGlzLl9lbENhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cdFx0XHR0aGlzLl9iSXNQYWludGVkID0gZmFsc2U7XG5cdFx0XHR0aGlzLl9lbEltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcblx0XHRcdHRoaXMuX2VsSW1hZ2UuYWx0ID0gXCJTY2FuIG1lIVwiO1xuXHRcdFx0dGhpcy5fZWxJbWFnZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cdFx0XHR0aGlzLl9lbC5hcHBlbmRDaGlsZCh0aGlzLl9lbEltYWdlKTtcblx0XHRcdHRoaXMuX2JTdXBwb3J0RGF0YVVSSSA9IG51bGw7XG5cdFx0fTtcblx0XHRcdFxuXHRcdC8qKlxuXHRcdCAqIERyYXcgdGhlIFFSQ29kZVxuXHRcdCAqIFxuXHRcdCAqIEBwYXJhbSB7UVJDb2RlfSBvUVJDb2RlIFxuXHRcdCAqL1xuXHRcdERyYXdpbmcucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAob1FSQ29kZSkge1xuICAgICAgICAgICAgdmFyIF9lbEltYWdlID0gdGhpcy5fZWxJbWFnZTtcbiAgICAgICAgICAgIHZhciBfb0NvbnRleHQgPSB0aGlzLl9vQ29udGV4dDtcbiAgICAgICAgICAgIHZhciBfaHRPcHRpb24gPSB0aGlzLl9odE9wdGlvbjtcbiAgICAgICAgICAgIFxuXHRcdFx0dmFyIG5Db3VudCA9IG9RUkNvZGUuZ2V0TW9kdWxlQ291bnQoKTtcblx0XHRcdHZhciBuV2lkdGggPSBfaHRPcHRpb24ud2lkdGggLyBuQ291bnQ7XG5cdFx0XHR2YXIgbkhlaWdodCA9IF9odE9wdGlvbi5oZWlnaHQgLyBuQ291bnQ7XG5cdFx0XHR2YXIgblJvdW5kZWRXaWR0aCA9IE1hdGgucm91bmQobldpZHRoKTtcblx0XHRcdHZhciBuUm91bmRlZEhlaWdodCA9IE1hdGgucm91bmQobkhlaWdodCk7XG5cblx0XHRcdF9lbEltYWdlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblx0XHRcdHRoaXMuY2xlYXIoKTtcblx0XHRcdFxuXHRcdFx0Zm9yICh2YXIgcm93ID0gMDsgcm93IDwgbkNvdW50OyByb3crKykge1xuXHRcdFx0XHRmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBuQ291bnQ7IGNvbCsrKSB7XG5cdFx0XHRcdFx0dmFyIGJJc0RhcmsgPSBvUVJDb2RlLmlzRGFyayhyb3csIGNvbCk7XG5cdFx0XHRcdFx0dmFyIG5MZWZ0ID0gY29sICogbldpZHRoO1xuXHRcdFx0XHRcdHZhciBuVG9wID0gcm93ICogbkhlaWdodDtcblx0XHRcdFx0XHRfb0NvbnRleHQuc3Ryb2tlU3R5bGUgPSBiSXNEYXJrID8gX2h0T3B0aW9uLmNvbG9yRGFyayA6IF9odE9wdGlvbi5jb2xvckxpZ2h0O1xuXHRcdFx0XHRcdF9vQ29udGV4dC5saW5lV2lkdGggPSAxO1xuXHRcdFx0XHRcdF9vQ29udGV4dC5maWxsU3R5bGUgPSBiSXNEYXJrID8gX2h0T3B0aW9uLmNvbG9yRGFyayA6IF9odE9wdGlvbi5jb2xvckxpZ2h0O1x0XHRcdFx0XHRcblx0XHRcdFx0XHRfb0NvbnRleHQuZmlsbFJlY3QobkxlZnQsIG5Ub3AsIG5XaWR0aCwgbkhlaWdodCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8g7JWI7YuwIOyVqOumrOyWtOyLsSDrsKnsp4Ag7LKY66asXG5cdFx0XHRcdFx0X29Db250ZXh0LnN0cm9rZVJlY3QoXG5cdFx0XHRcdFx0XHRNYXRoLmZsb29yKG5MZWZ0KSArIDAuNSxcblx0XHRcdFx0XHRcdE1hdGguZmxvb3IoblRvcCkgKyAwLjUsXG5cdFx0XHRcdFx0XHRuUm91bmRlZFdpZHRoLFxuXHRcdFx0XHRcdFx0blJvdW5kZWRIZWlnaHRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdF9vQ29udGV4dC5zdHJva2VSZWN0KFxuXHRcdFx0XHRcdFx0TWF0aC5jZWlsKG5MZWZ0KSAtIDAuNSxcblx0XHRcdFx0XHRcdE1hdGguY2VpbChuVG9wKSAtIDAuNSxcblx0XHRcdFx0XHRcdG5Sb3VuZGVkV2lkdGgsXG5cdFx0XHRcdFx0XHRuUm91bmRlZEhlaWdodFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dGhpcy5fYklzUGFpbnRlZCA9IHRydWU7XG5cdFx0fTtcblx0XHRcdFxuXHRcdC8qKlxuXHRcdCAqIE1ha2UgdGhlIGltYWdlIGZyb20gQ2FudmFzIGlmIHRoZSBicm93c2VyIHN1cHBvcnRzIERhdGEgVVJJLlxuXHRcdCAqL1xuXHRcdERyYXdpbmcucHJvdG90eXBlLm1ha2VJbWFnZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICh0aGlzLl9iSXNQYWludGVkKSB7XG5cdFx0XHRcdF9zYWZlU2V0RGF0YVVSSS5jYWxsKHRoaXMsIF9vbk1ha2VJbWFnZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRcdFxuXHRcdC8qKlxuXHRcdCAqIFJldHVybiB3aGV0aGVyIHRoZSBRUkNvZGUgaXMgcGFpbnRlZCBvciBub3Rcblx0XHQgKiBcblx0XHQgKiBAcmV0dXJuIHtCb29sZWFufVxuXHRcdCAqL1xuXHRcdERyYXdpbmcucHJvdG90eXBlLmlzUGFpbnRlZCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiB0aGlzLl9iSXNQYWludGVkO1xuXHRcdH07XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogQ2xlYXIgdGhlIFFSQ29kZVxuXHRcdCAqL1xuXHRcdERyYXdpbmcucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0dGhpcy5fb0NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuX2VsQ2FudmFzLndpZHRoLCB0aGlzLl9lbENhbnZhcy5oZWlnaHQpO1xuXHRcdFx0dGhpcy5fYklzUGFpbnRlZCA9IGZhbHNlO1xuXHRcdH07XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKiBAcGFyYW0ge051bWJlcn0gbk51bWJlclxuXHRcdCAqL1xuXHRcdERyYXdpbmcucHJvdG90eXBlLnJvdW5kID0gZnVuY3Rpb24gKG5OdW1iZXIpIHtcblx0XHRcdGlmICghbk51bWJlcikge1xuXHRcdFx0XHRyZXR1cm4gbk51bWJlcjtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIE1hdGguZmxvb3Iobk51bWJlciAqIDEwMDApIC8gMTAwMDtcblx0XHR9O1xuXHRcdFxuXHRcdHJldHVybiBEcmF3aW5nO1xuXHR9KSgpO1xuXHRcblx0LyoqXG5cdCAqIEdldCB0aGUgdHlwZSBieSBzdHJpbmcgbGVuZ3RoXG5cdCAqIFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc1RleHRcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG5Db3JyZWN0TGV2ZWxcblx0ICogQHJldHVybiB7TnVtYmVyfSB0eXBlXG5cdCAqL1xuXHRmdW5jdGlvbiBfZ2V0VHlwZU51bWJlcihzVGV4dCwgbkNvcnJlY3RMZXZlbCkge1x0XHRcdFxuXHRcdHZhciBuVHlwZSA9IDE7XG5cdFx0dmFyIGxlbmd0aCA9IF9nZXRVVEY4TGVuZ3RoKHNUZXh0KTtcblx0XHRcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gUVJDb2RlTGltaXRMZW5ndGgubGVuZ3RoOyBpIDw9IGxlbjsgaSsrKSB7XG5cdFx0XHR2YXIgbkxpbWl0ID0gMDtcblx0XHRcdFxuXHRcdFx0c3dpdGNoIChuQ29ycmVjdExldmVsKSB7XG5cdFx0XHRcdGNhc2UgUVJFcnJvckNvcnJlY3RMZXZlbC5MIDpcblx0XHRcdFx0XHRuTGltaXQgPSBRUkNvZGVMaW1pdExlbmd0aFtpXVswXTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBRUkVycm9yQ29ycmVjdExldmVsLk0gOlxuXHRcdFx0XHRcdG5MaW1pdCA9IFFSQ29kZUxpbWl0TGVuZ3RoW2ldWzFdO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFFSRXJyb3JDb3JyZWN0TGV2ZWwuUSA6XG5cdFx0XHRcdFx0bkxpbWl0ID0gUVJDb2RlTGltaXRMZW5ndGhbaV1bMl07XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgUVJFcnJvckNvcnJlY3RMZXZlbC5IIDpcblx0XHRcdFx0XHRuTGltaXQgPSBRUkNvZGVMaW1pdExlbmd0aFtpXVszXTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKGxlbmd0aCA8PSBuTGltaXQpIHtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRuVHlwZSsrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRpZiAoblR5cGUgPiBRUkNvZGVMaW1pdExlbmd0aC5sZW5ndGgpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlRvbyBsb25nIGRhdGFcIik7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBuVHlwZTtcblx0fVxuXG5cdGZ1bmN0aW9uIF9nZXRVVEY4TGVuZ3RoKHNUZXh0KSB7XG5cdFx0dmFyIHJlcGxhY2VkVGV4dCA9IGVuY29kZVVSSShzVGV4dCkudG9TdHJpbmcoKS5yZXBsYWNlKC9cXCVbMC05YS1mQS1GXXsyfS9nLCAnYScpO1xuXHRcdHJldHVybiByZXBsYWNlZFRleHQubGVuZ3RoICsgKHJlcGxhY2VkVGV4dC5sZW5ndGggIT0gc1RleHQgPyAzIDogMCk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBAY2xhc3MgUVJDb2RlXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAZXhhbXBsZSBcblx0ICogbmV3IFFSQ29kZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRlc3RcIiksIFwiaHR0cDovL2ppbmRvLmRldi5uYXZlci5jb20vY29sbGllXCIpO1xuXHQgKlxuXHQgKiBAZXhhbXBsZVxuXHQgKiB2YXIgb1FSQ29kZSA9IG5ldyBRUkNvZGUoXCJ0ZXN0XCIsIHtcblx0ICogICAgdGV4dCA6IFwiaHR0cDovL25hdmVyLmNvbVwiLFxuXHQgKiAgICB3aWR0aCA6IDEyOCxcblx0ICogICAgaGVpZ2h0IDogMTI4XG5cdCAqIH0pO1xuXHQgKiBcblx0ICogb1FSQ29kZS5jbGVhcigpOyAvLyBDbGVhciB0aGUgUVJDb2RlLlxuXHQgKiBvUVJDb2RlLm1ha2VDb2RlKFwiaHR0cDovL21hcC5uYXZlci5jb21cIik7IC8vIFJlLWNyZWF0ZSB0aGUgUVJDb2RlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0hUTUxFbGVtZW50fFN0cmluZ30gZWwgdGFyZ2V0IGVsZW1lbnQgb3IgJ2lkJyBhdHRyaWJ1dGUgb2YgZWxlbWVudC5cblx0ICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2T3B0aW9uXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB2T3B0aW9uLnRleHQgUVJDb2RlIGxpbmsgZGF0YVxuXHQgKiBAcGFyYW0ge051bWJlcn0gW3ZPcHRpb24ud2lkdGg9MjU2XVxuXHQgKiBAcGFyYW0ge051bWJlcn0gW3ZPcHRpb24uaGVpZ2h0PTI1Nl1cblx0ICogQHBhcmFtIHtTdHJpbmd9IFt2T3B0aW9uLmNvbG9yRGFyaz1cIiMwMDAwMDBcIl1cblx0ICogQHBhcmFtIHtTdHJpbmd9IFt2T3B0aW9uLmNvbG9yTGlnaHQ9XCIjZmZmZmZmXCJdXG5cdCAqIEBwYXJhbSB7UVJDb2RlLkNvcnJlY3RMZXZlbH0gW3ZPcHRpb24uY29ycmVjdExldmVsPVFSQ29kZS5Db3JyZWN0TGV2ZWwuSF0gW0x8TXxRfEhdIFxuXHQgKi9cblx0UVJDb2RlID0gZnVuY3Rpb24gKGVsLCB2T3B0aW9uKSB7XG5cdFx0dGhpcy5faHRPcHRpb24gPSB7XG5cdFx0XHR3aWR0aCA6IDI1NiwgXG5cdFx0XHRoZWlnaHQgOiAyNTYsXG5cdFx0XHR0eXBlTnVtYmVyIDogNCxcblx0XHRcdGNvbG9yRGFyayA6IFwiIzAwMDAwMFwiLFxuXHRcdFx0Y29sb3JMaWdodCA6IFwiI2ZmZmZmZlwiLFxuXHRcdFx0Y29ycmVjdExldmVsIDogUVJFcnJvckNvcnJlY3RMZXZlbC5IXG5cdFx0fTtcblx0XHRcblx0XHRpZiAodHlwZW9mIHZPcHRpb24gPT09ICdzdHJpbmcnKSB7XG5cdFx0XHR2T3B0aW9uXHQ9IHtcblx0XHRcdFx0dGV4dCA6IHZPcHRpb25cblx0XHRcdH07XG5cdFx0fVxuXHRcdFxuXHRcdC8vIE92ZXJ3cml0ZXMgb3B0aW9uc1xuXHRcdGlmICh2T3B0aW9uKSB7XG5cdFx0XHRmb3IgKHZhciBpIGluIHZPcHRpb24pIHtcblx0XHRcdFx0dGhpcy5faHRPcHRpb25baV0gPSB2T3B0aW9uW2ldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRpZiAodHlwZW9mIGVsID09IFwic3RyaW5nXCIpIHtcblx0XHRcdGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWwpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9odE9wdGlvbi51c2VTVkcpIHtcblx0XHRcdERyYXdpbmcgPSBzdmdEcmF3ZXI7XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuX2FuZHJvaWQgPSBfZ2V0QW5kcm9pZCgpO1xuXHRcdHRoaXMuX2VsID0gZWw7XG5cdFx0dGhpcy5fb1FSQ29kZSA9IG51bGw7XG5cdFx0dGhpcy5fb0RyYXdpbmcgPSBuZXcgRHJhd2luZyh0aGlzLl9lbCwgdGhpcy5faHRPcHRpb24pO1xuXHRcdFxuXHRcdGlmICh0aGlzLl9odE9wdGlvbi50ZXh0KSB7XG5cdFx0XHR0aGlzLm1ha2VDb2RlKHRoaXMuX2h0T3B0aW9uLnRleHQpO1x0XG5cdFx0fVxuXHR9O1xuXHRcblx0LyoqXG5cdCAqIE1ha2UgdGhlIFFSQ29kZVxuXHQgKiBcblx0ICogQHBhcmFtIHtTdHJpbmd9IHNUZXh0IGxpbmsgZGF0YVxuXHQgKi9cblx0UVJDb2RlLnByb3RvdHlwZS5tYWtlQ29kZSA9IGZ1bmN0aW9uIChzVGV4dCkge1xuXHRcdHRoaXMuX29RUkNvZGUgPSBuZXcgUVJDb2RlTW9kZWwoX2dldFR5cGVOdW1iZXIoc1RleHQsIHRoaXMuX2h0T3B0aW9uLmNvcnJlY3RMZXZlbCksIHRoaXMuX2h0T3B0aW9uLmNvcnJlY3RMZXZlbCk7XG5cdFx0dGhpcy5fb1FSQ29kZS5hZGREYXRhKHNUZXh0KTtcblx0XHR0aGlzLl9vUVJDb2RlLm1ha2UoKTtcblx0XHR0aGlzLl9lbC50aXRsZSA9IHNUZXh0O1xuXHRcdHRoaXMuX29EcmF3aW5nLmRyYXcodGhpcy5fb1FSQ29kZSk7XHRcdFx0XG5cdFx0dGhpcy5tYWtlSW1hZ2UoKTtcblx0fTtcblx0XG5cdC8qKlxuXHQgKiBNYWtlIHRoZSBJbWFnZSBmcm9tIENhbnZhcyBlbGVtZW50XG5cdCAqIC0gSXQgb2NjdXJzIGF1dG9tYXRpY2FsbHlcblx0ICogLSBBbmRyb2lkIGJlbG93IDMgZG9lc24ndCBzdXBwb3J0IERhdGEtVVJJIHNwZWMuXG5cdCAqIFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0UVJDb2RlLnByb3RvdHlwZS5tYWtlSW1hZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHR5cGVvZiB0aGlzLl9vRHJhd2luZy5tYWtlSW1hZ2UgPT0gXCJmdW5jdGlvblwiICYmICghdGhpcy5fYW5kcm9pZCB8fCB0aGlzLl9hbmRyb2lkID49IDMpKSB7XG5cdFx0XHR0aGlzLl9vRHJhd2luZy5tYWtlSW1hZ2UoKTtcblx0XHR9XG5cdH07XG5cdFxuXHQvKipcblx0ICogQ2xlYXIgdGhlIFFSQ29kZVxuXHQgKi9cblx0UVJDb2RlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9vRHJhd2luZy5jbGVhcigpO1xuXHR9O1xuXHRcblx0LyoqXG5cdCAqIEBuYW1lIFFSQ29kZS5Db3JyZWN0TGV2ZWxcblx0ICovXG5cdFFSQ29kZS5Db3JyZWN0TGV2ZWwgPSBRUkVycm9yQ29ycmVjdExldmVsO1xufSkoKTtcblxuOyBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXyh0eXBlb2YgUVJDb2RlICE9IFwidW5kZWZpbmVkXCIgPyBRUkNvZGUgOiB3aW5kb3cuUVJDb2RlKTtcblxufSkuY2FsbChnbG9iYWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZnVuY3Rpb24gZGVmaW5lRXhwb3J0KGV4KSB7IG1vZHVsZS5leHBvcnRzID0gZXg7IH0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJ2YXIgZXhwZWN0ID0gY2hhaS5leHBlY3Q7XG52YXIgU0sgPSByZXF1aXJlKCcuLi9qcy9zaGFyZUtpdC5qcycpO1xuZGVzY3JpYmUoJ1NoYXJlIEtpdCcsIGZ1bmN0aW9uKCl7XG4gICAgZGVzY3JpYmUoJ1Rlc3QgVXJsIENvbmNhdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIGVuY29kZSB1cmwnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHNyYyA9IFNLLnByb3RvdHlwZS51cmxDb25jYXQoe1xuICAgICAgICAgICAgICAgIGE6J2EnLFxuICAgICAgICAgICAgICAgIGI6J2JiXFwvXFwvJyxcbiAgICAgICAgICAgICAgICBjOiAnMTIzPz8lJyxcbiAgICAgICAgICAgICAgICBkOiA3NzcsXG4gICAgICAgICAgICAgICAgZTonODg4J1xuICAgICAgICAgICAgfSwgJ2h0dHA6Ly93d3cuYmFpZHUuY29tJyk7XG4gICAgICAgICAgICB2YXIgZGVzdCA9ICdodHRwOi8vd3d3LmJhaWR1LmNvbT8nKydhPWEmYj1iYlxcL1xcLyZjPTEyMz8/JSZkPTc3NyZlPTg4OCc7XG5cbiAgICAgICAgICAgIGV4cGVjdChzcmMpLnRvLm5vdC5lcXVhbChkZXN0KTtcbiAgICAgICAgICAgIGV4cGVjdChkZWNvZGVVUklDb21wb25lbnQoc3JjKSkudG8uZXF1YWwoZGVzdCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3Jlc291cmNlIGRldGVjdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGl0KCdzaG91bGQgZGV0ZWN0IHVybCBoYXMgZnJvbXBjIHF1ZXJ5IHN0cmluZyBvciBub3QgJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciB1cmwgPSBsb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdXJsLmluZGV4T2YoJz8nKTtcbiAgICAgICAgICAgIGlmKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJlID0gU0sucHJvdG90eXBlLmRldGVjdEZyb20odXJsKyc/ZnJvbXBjPXRydWUnKTtcbiAgICAgICAgICAgIGV4cGVjdChyZSkudG8uZXF1YWwodHJ1ZSk7XG5cbiAgICAgICAgICAgIHJlID0gU0sucHJvdG90eXBlLmRldGVjdEZyb20odXJsKTtcbiAgICAgICAgICAgIGV4cGVjdChyZSkudG8uZXF1YWwoZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgnU0sgT2JqZWN0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGV2dDtcbiAgICAgICAgYmVmb3JlRWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcbiAgICAgICAgICAgIGV2dC5pbml0RXZlbnQoJ2NsaWNrJywgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZXNjcmliZSgnU0sgQ29uZmlndXJhdGlvbiBUZXN0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGl0KCdTaG91bGQgZW1wdHkgb2JqZWN0IGhhcyBkZWZhdWx0IG9wdGlvbnMnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSygpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChzaykudG8ubm90LmJlLmFuKCd1bmRlZmluZWQnKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYudGl0bGUpLnRvLmVxdWFsKGRvY3VtZW50LnRpdGxlKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYubGluaykudG8uZXF1YWwobG9jYXRpb24uaHJlZik7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLmRlc2MpLnRvLmVxdWFsKFNLLnByb3RvdHlwZS5maW5kRGVzYygpKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYudHdpdHRlck5hbWUpLnRvLmJlLmFuKCd1bmRlZmluZWQnKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYucHJlZml4KS50by5lcXVhbCgnc2hhcmVLaXQnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBvYmplY3Qgd2l0aCBjb25maWd1cmF0aW9uIGhhcyBzb21lIG9wdGlvbnMnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciBvID0ge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ3RpdGxlJyxcbiAgICAgICAgICAgICAgICAgICAgbGluazogJ2h0dHA6Ly9iYWlkdS5jb20nLFxuICAgICAgICAgICAgICAgICAgICBkZXNjOiAnVG9kYXkgaXNuXFwnIGFub3RoZXIgZGF5LicsXG4gICAgICAgICAgICAgICAgICAgIHR3aXR0ZXJOYW1lOiAnc3VuYWl3ZW4nXG4gICAgICAgICAgICAgICAgICAgIC8vcHJlZml4OiAneW95b3lvJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIHNrID0gbmV3IFNLKG8pO1xuXG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLnRpdGxlKS50by5lcXVhbChvLnRpdGxlKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYubGluaykudG8uZXF1YWwoby5saW5rKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYuZGVzYykudG8uZXF1YWwoby5kZXNjKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYudHdpdHRlck5hbWUpLnRvLmVxdWFsKG8udHdpdHRlck5hbWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZXNjcmliZSgnU0sgaW5pdCBmdW5jdGlvbiBUZXN0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSygpO1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBoYXZlIGVsZW1lbnQgYW5kIGNvcnJlY3QgcHJlZml4JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2sud3JhcEVsZS5jbGFzc05hbWUuaW5kZXhPZignanMtJytzay5iYXNlQ29uZi5wcmVmaXgpKS50by5ub3QuZXF1YWwoLTEpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChzay5xekVsZS5jbGFzc05hbWUuaW5kZXhPZignanMtJytzay5iYXNlQ29uZi5wcmVmaXgrJy1xem9uZScpKS50by5ub3QuZXF1YWwoLTEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnU2hvdWxkIGJpbmQgYW4gZXZlbnQgY29ycmVjdGx5JywgZnVuY3Rpb24oZG9uZSl7XG4gICAgICAgICAgICAgICAgdmFyIHIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgaGFuZGxlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHIgPSAnZmlyZSc7XG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdChyKS50by5lcXVhbCgnZmlyZScpO1xuICAgICAgICAgICAgICAgICAgICBTSy5wcm90b3R5cGUucXpvbmVGdW5jID0gdGVtcDtcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIHRlbXAgPSBTSy5wcm90b3R5cGUucXpvbmVGdW5jO1xuICAgICAgICAgICAgICAgIFNLLnByb3RvdHlwZS5xem9uZUZ1bmMgPSBoYW5kbGVyO1xuICAgICAgICAgICAgICAgIHNrLnF6RWxlLmRpc3BhdGNoRXZlbnQoZXZ0LCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZGVzY3JpYmUoJ1NLIGVsZW1lbnRzXFwnIGV2ZW50IGJpbmRpbmcnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBoYW5kbGVyIGJlIGZpcmVkJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgc3QgPSBzaW5vbi5zdHViKFNLLnByb3RvdHlwZSwgJ3F6b25lRnVuYycpO1xuICAgICAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSygpO1xuICAgICAgICAgICAgICAgIHNrLnF6RWxlLmRpc3BhdGNoRXZlbnQoZXZ0LHRydWUpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChzdC5jYWxsQ291bnQpLnRvLmVxdWFsKDEpO1xuICAgICAgICAgICAgICAgIHN0LnJlc3RvcmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZGVzY3JpYmUoJ1NLIG9wZW4gd2luZG93IGZ1bmN0aW9uIHRlc3QnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBvcGVuIHdpbmRvdyB3aXRoIGNvcnJlY3QgdXJsLCB0aXRsZSwgYW5kIHByb3BzJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBTSy5wcm90b3R5cGUub3Blbldpbih7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJ2h0dHA6Ly93d3cuYmFpZHUuY29tJyxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdvcGVuIGJhaWR1JyxcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsYmFyczogJ25vJyxcbiAgICAgICAgICAgICAgICAgICAgbWVudWJhcjogJ25vJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnbm8nLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDYwMCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDkwMCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogMzAwLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IDBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZGVzY3JpYmUoJ1RoZSBRem9uZSBzaGFyZSBmdW5jdGlvbicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgYXJncyA9IG51bGw7XG4gICAgICAgICAgICB2YXIgY2FjaGUgPSBTSy5wcm90b3R5cGUub3BlbldpbjtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgZmFrZU9wZW5XaW4gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgU0sucHJvdG90eXBlLm9wZW5XaW4gPSBmYWtlT3BlbldpbjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBxem9uZUZ1bmMgb3BlbiBhIHdpbmRvdyB3aXRoIGNvcnJlY3Qgb3B0aW9ucycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIHNrID0gbmV3IFNLKHtcbiAgICAgICAgICAgICAgICAgICAgbGluazogJ2h0dHA6Ly9iYWlkdS5jb20nLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ3F6b25lIHNoYXJlIGZ1bmN0aW9uIHRlc3QnLFxuICAgICAgICAgICAgICAgICAgICB0d2l0dGVyTmFtZTogJ3N1bmFpd2VuJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzYzogJ3RoaXMgaXMgYSB0ZXN0IHRlc3RpbmcgcXpvbmUgc2hhcmUgZnVuY3Rpb24uJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgc2sucXpFbGUuZGlzcGF0Y2hFdmVudChldnQsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3MubWVudWJhcikudG8uZXF1YWwoJ25vJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3MucmVzaXphYmxlKS50by5lcXVhbCgnbm8nKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYXJncy5zdGF0dXMpLnRvLmVxdWFsKCdubycpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLnRvb2xiYXIpLnRvLmVxdWFsKCdubycpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLnRvcCkudG8uZXF1YWwoNTApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLmxlZnQpLnRvLmVxdWFsKDIwMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3Mud2lkdGgpLnRvLmVxdWFsKDYwMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3MuaGVpZ2h0KS50by5lcXVhbCg2NTApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLnRpdGxlKS50by5lcXVhbCgnU2hhcmluZyB0byBRem9uZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhZnRlckVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBTSy5wcm90b3R5cGUub3BlbldpbiA9IGNhY2hlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZXNjcmliZSgnVGhlIHdlY2hhdCBzaGFyZSBmdW5jdGlvbicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpdCgnU2hvdWxkIGNvbmR1Y3QgY29ycmVjdCBpbmZvIGluIHdlY2hhdCBzaGFyaW5nJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgY2FjaGUgPSBTSy5wcm90b3R5cGUuZGV0ZWN0RGV2aWNlO1xuICAgICAgICAgICAgICAgIFNLLnByb3RvdHlwZS5kZXRlY3REZXZpY2UgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3Bob25lJztcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSyh7XG4gICAgICAgICAgICAgICAgICAgIGxpbms6IGxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnd2VjaGF0IGZ1bmN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzYzogJ3dlY2hhdCBmdW5jdGlvbiB0ZXN0IHlvdSB3ZXRoZXIgeW91IGxvdmUgbWUuJyxcbiAgICAgICAgICAgICAgICAgICAgcG9ydHJhaXQ6ICdodHRwczovL2QxM3lhY3VycWpnYXJhLmNsb3VkZnJvbnQubmV0L3VzZXJzLzUyMjc3L3NjcmVlbnNob3RzLzE4MDczMzMvZ2lsbGVfZHJpYmJibGVfYm9yZWFzX3YwMS0wMS5wbmcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2sud3hFbGUuZGlzcGF0Y2hFdmVudChldnQsIHRydWUpO1xuICAgICAgICAgICAgICAgIFNLLnByb3RvdHlwZS5kZXRlY3REZXZpY2UgPSBjYWNoZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBzaG93IHFyY29kZSB3aGVuIGluIHBjIGVudicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIHNrID0gbmV3IFNLKHtcbiAgICAgICAgICAgICAgICAgICAgbGluazogbG9jYXRpb24uaHJlZlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNrLnd4RWxlLmRpc3BhdGNoRXZlbnQoZXZ0LCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pOyJdfQ==
