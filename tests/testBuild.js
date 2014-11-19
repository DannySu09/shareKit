(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/sunaiwen/projects/shareKit/js/shareKit.js":[function(require,module,exports){
;(function(){
    var QRCode = require('qrcode/qrcodeclient.js');
    var SK = function(options){
        this.baseConf = this.setOptions(options);
        this.device = this.detectDevice(navigator.userAgent);
        this.initEle(this.baseConf.prefix);
        this.bind(this.qzEle, this.qzoneFunc);
        this.bind(this.twEle, this.twitterFunc);
        this.bind(this.wxEle, this.wechatFunc);
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
    SK.prototype.detectDevice = function(ua){
        if(ua.match(/iphone|ipad|android/gi) != null) {
            return 'phone';
        } else {
            return 'pc';
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
},{"qrcode/qrcodeclient.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/qrcodeclient.js"}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/lib/qrcapacitytable.js":[function(require,module,exports){
/**
this contains the max string length for all qr code Versions in Binary Safe / Byte Mode
each entry is in the order of error correct level
	[L,M,Q,H]

the qrcode lib sets strange values for QRErrorCorrectLevel having to do with masking against patterns
the maximum string length for error correct level H is 1273 characters long.
*/

exports.QRCapacityTable = [
[17,14,11,7]
,[32,26,20,14]
,[53,42,32,24]
,[78,62,46,34]
,[106,84,60,44]
,[134,106,74,58]
,[154,122,86,64]
,[192,152,108,84]
,[230,180,130,98]
,[271,213,151,119]
,[321,251,177,137]//11
,[367,287,203,155]
,[425,331,241,177]
,[458,362,258,194]
,[520,412,292,220]
,[586,450,322,250]
,[644,504,364,280]
,[718,560,394,310]
,[792,624,442,338]
,[858,666,482,382]
,[929,711,509,403]
,[1003,779,565,439]
,[1091,857,611,461]
,[1171,911,661,511]//24
,[1273,997,715,535]
,[1367,1059,751,593]
,[1465,1125,805,625]
,[1528,1190,868,658]//28
,[1628,1264,908,698]
,[1732,1370,982,742]
,[1840,1452,1030,790]
,[1952,1538,1112,842]//32
,[2068,1628,1168,898]
,[2188,1722,1228,958]
,[2303,1809,1283,983]
,[2431,1911,1351,1051]//36
,[2563,1989,1423,1093]
,[2699,2099,1499,1139]
,[2809,2213,1579,1219]
,[2953,2331,1663,1273]//40
];

},{}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/lib/qrcode-draw.js":[function(require,module,exports){
/*
* copyright 2010-2012 Ryan Day
* http://github.com/soldair/node-qrcode
*
* Licensed under the MIT license:
*   http://www.opensource.org/licenses/mit-license.php
*
* canvas example and fallback support example provided by Joshua Koo
*	http://jabtunes.com/labs/qrcode.html
*	"Instant QRCode Mashup by Joshua Koo!"
*	as far as i can tell the page and the code on the page are public domain 
*	
* original table example and library provided by Kazuhiko Arase
*	http://d-project.googlecode.com/svn/trunk/misc/qrcode/js/
*
*/

var bops = require('bops')
var QRCodeLib = require('./qrcode.js');
var QRVersionCapacityTable = require('./qrcapacitytable.js').QRCapacityTable;
var QRCode = QRCodeLib.QRCode;

exports.QRCodeDraw = QRCodeDraw;
exports.QRVersionCapacityTable = QRVersionCapacityTable;
exports.QRErrorCorrectLevel = QRCodeLib.QRErrorCorrectLevel;
exports.QRCode = QRCodeLib.QRCode;

function QRCodeDraw(){}

QRCodeDraw.prototype = {
  scale:4,//4 px module size
  defaultMargin:20,
  marginScaleFactor:5,
  Array:(typeof Uint32Array == 'undefined'?Uint32Array:Array),
  // you may configure the error behavior for input string too long
  errorBehavior:{
    length:'trim'
  },
  color:{
    dark:'black',
    light:'white'
  },
  defaultErrorCorrectLevel:QRCodeLib.QRErrorCorrectLevel.H,
  QRErrorCorrectLevel:QRCodeLib.QRErrorCorrectLevel,
  draw:function(canvas,text,options,cb){

    var level,
    error,
    errorCorrectLevel;
    
    var args = Array.prototype.slice.call(arguments);
    cb = args.pop(); 
    canvas = args.shift();
    text = args.shift();
    options = args.shift()||{};

    
    if(typeof cb != 'function') {
      //enforce callback api just in case the processing can be made async in the future
      // or support proc open to libqrencode
      throw new Error('callback required');
    }
    
    if(typeof options !== "object"){
      options.errorCorrectLevel = options;
    }
    

    this.QRVersion(
      text
      ,options.errorCorrectLevel||this.QRErrorCorrectLevel.H
      ,options.version
    ,function(e,t,l,ec){

      text = t,level = l,error = e,errorCorrectLevel = ec;
    });

    this.scale = options.scale||this.scale;
    this.margin = typeof(options.margin) === 'undefined' ? this.defaultMargin : options.margin;
    
    if(!level) {
      //if we are unable to find an appropriate qr level error out
      cb(error,canvas);
      return;
    }

    //create qrcode!
    try{
      
      var qr = new QRCodeLib.QRCode(level, errorCorrectLevel)
      , scale = this.scale||4
      , ctx = canvas.getContext('2d')
      , width = 0;

      qr.addData(text);
      qr.make();

      var margin = this.marginWidth();
      var currenty = margin;
      width = this.dataWidth(qr)+ margin*2;
      
      this.resetCanvas(canvas,ctx,width);

      for (var r = 0,rl=qr.getModuleCount(); r < rl; r++) {
        var currentx = margin;
        for (var c = 0,cl=qr.getModuleCount(); c < cl; c++) {
          if (qr.isDark(r, c) ) {
            ctx.fillStyle = this.color.dark;
            ctx.fillRect (currentx, currenty, scale, scale);
          } else if(this.color.light){
            //if falsy configured color
            ctx.fillStyle = this.color.light;
            ctx.fillRect (currentx, currenty, scale, scale);
          }
          currentx += scale;
        }
        currenty += scale;
      }
    } catch (e) {
      error = e;
    }
    
    cb(error,canvas,width);    
  },
  drawBitArray:function(text/*,errorCorrectLevel,options,cb*/) {

    var args = Array.prototype.slice.call(arguments),
      cb = args.pop(),
      text = args.shift(),
      errorCorrectLevel = args.shift(),
      options = args.shift() || {};

    //argument processing
    if(typeof cb != 'function') {
      //enforce callback api just in case the processing can be made async in the future
      // or support proc open to libqrencode
      throw new Error('callback required as last argument');
    }
    
    cb = arguments[arguments.length-1]; 
    
    if(arguments.length > 2){
      errorCorrectLevel = arguments[2];
    }


    //this interface kinda sucks - there is very small likelyhood of this ever being async
    this.QRVersion(text,errorCorrectLevel,(options||{}).version,function(e,t,l,ec){
      text = t,level = l,error = e,errorCorrectLevel = ec;
    });


    if(!level) {
      //if we are unable to find an appropriate qr level error out
      cb(error,[],0);
      return;
    }

    //create qrcode!
    try{

      var qr = new QRCodeLib.QRCode(level, errorCorrectLevel)
      , scale = this.scale||4
      , width = 0,bits,bitc=0,currenty=0;
      
      qr.addData(text);
      qr.make();
      
      width = this.dataWidth(qr,1);
      bits = new this.Array(width*width);

      
      for (var r = 0,rl=qr.getModuleCount(); r < rl; r++) {
        for (var c = 0,cl=qr.getModuleCount(); c < cl; c++) {
          if (qr.isDark(r, c) ) {
            bits[bitc] = 1;
          } else {
            bits[bitc] = 0;
          }
          bitc++;
        }
      }
    } catch (e) {
      error = e;
      console.log(e.stack);
    }
    
    cb(error,bits,width);
  },
  QRVersion:function(text,errorCorrectLevel,version,cb){
    var c = bops.from(text).length,// BINARY LENGTH!
        error,
        errorCorrectLevel = this.QRErrorCorrectLevel[errorCorrectLevel]||this.defaultErrorCorrectLevel,
        errorCorrectIndex = [1,0,3,2],//fix odd mapping to order in table
        keys = ['L','M','Q','H'],
        capacity = 0,
        versionSpecified = false;
        
    if(typeof version !== "undefined" && version !== null) {
      versionSpecified = true;
    }
    //TODO ADD THROW FOR INVALID errorCorrectLevel...?
    
    if(versionSpecified){
      //console.log('SPECIFIED VERSION! ',version);
      //i have specified a version. this will give me a fixed size qr code. version must be valid. 1-40
      capacity = QRVersionCapacityTable[version][errorCorrectIndex[errorCorrectLevel]];
      
    } else {
      //figure out what version can hold the amount of text
      for(var i=0,j=QRVersionCapacityTable.length;i<j;i++) {
        capacity = QRVersionCapacityTable[i][errorCorrectIndex[errorCorrectLevel]];
        if(c < QRVersionCapacityTable[i][errorCorrectIndex[errorCorrectLevel]]){
          version = i+1;
          break;
        }
      }
      //if not version set to max
      if(!version) {
        version = QRVersionCapacityTable.length-1;
      }
    }
    
    if(capacity < c){
      if(this.errorBehavior.length == 'trim'){
        text = text.substr(0,capacity);
        level = QRVersionCapacityTable.length; 
      } else {
        error = new Error('input string too long for error correction '
          +keys[errorCorrectIndex[errorCorrectLevel]]
          +' max length '
          + capacity
          +' for qrcode version '+version
        );
      }
    }
  
    if(cb) {
      cb(error,text,version,errorCorrectLevel);
    }
    return version;
  },
  marginWidth:function(){
    var margin = this.margin;
    this.scale = this.scale||4;
    //elegant white space next to code is required by spec
    if ((this.scale * this.marginScaleFactor > margin) && margin > 0){
      margin = this.scale * this.marginScaleFactor;
    }
    return margin;
  },
  dataWidth:function(qr,scale){
    return qr.getModuleCount()*(scale||this.scale||4);
  },
  resetCanvas:function(canvas,ctx,width){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!canvas.style) canvas.style = {};
    canvas.style.height = canvas.height = width;//square!
    canvas.style.width = canvas.width = width;
    
    if(this.color.light){
      ctx.fillStyle = this.color.light; 
      ctx.fillRect(0,0,canvas.width,canvas.height);
    } else {
      //support transparent backgrounds?
      //not exactly to spec but i really would like someone to be able to add a background with heavily reduced luminosity for simple branding
      //i could just ditch this because you could also just set #******00 as the color =P
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  }
};


},{"./qrcapacitytable.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/lib/qrcapacitytable.js","./qrcode.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/lib/qrcode.js","bops":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/index.js"}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/lib/qrcode.js":[function(require,module,exports){
var bops = require('bops');

/**
 * QRCode for JavaScript
 *
 * modified by Ryan Day for nodejs support
 * Copyright (c) 2011 Ryan Day
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * EXPORTS:
 *	{
 *	QRCode:QRCode
 *	QRErrorCorrectLevel:QRErrorCorrectLevel
 *	}
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
*/

//---------------------------------------------------------------------
// QRCode
//---------------------------------------------------------------------

exports.QRCode = QRCode;

var QRDataArray = (typeof Uint32Array == 'undefined'?Uint32Array:Array);

function QRCode(typeNumber, errorCorrectLevel) {
	this.typeNumber = typeNumber;
	this.errorCorrectLevel = errorCorrectLevel;
	this.modules = null;
	this.moduleCount = 0;
	this.dataCache = null;
	this.dataList = new QRDataArray();
}

QRCode.prototype = {
	
	addData : function(data) {
		var newData = new QR8bitByte(data);

		this.dataList.push(newData);
		this.dataCache = null;
	},
	
	isDark : function(row, col) {
		if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
			throw new Error(row + "," + col);
		}
		return this.modules[row][col];
	},

	getModuleCount : function() {
		return this.moduleCount;
	},
	
	make : function() {
		this.makeImpl(false, this.getBestMaskPattern() );
	},
	
	makeImpl : function(test, maskPattern) {
		
		this.moduleCount = this.typeNumber * 4 + 17;
		this.modules = new QRDataArray(this.moduleCount);
		
		for (var row = 0; row < this.moduleCount; row++) {
			
			this.modules[row] = new QRDataArray(this.moduleCount);
			
			for (var col = 0; col < this.moduleCount; col++) {
				this.modules[row][col] = null;//(col + row) % 3;
			}
		}
	
		this.setupPositionProbePattern(0, 0);
		this.setupPositionProbePattern(this.moduleCount - 7, 0);
		this.setupPositionProbePattern(0, this.moduleCount - 7);
		this.setupPositionAdjustPattern();
		this.setupTimingPattern();
		this.setupTypeInfo(test, maskPattern);
		
		if (this.typeNumber >= 7) {
			this.setupTypeNumber(test);
		}
	
		if (this.dataCache == null) {
			this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
		}
	
		this.mapData(this.dataCache, maskPattern);
	},

	setupPositionProbePattern : function(row, col)  {
		
		for (var r = -1; r <= 7; r++) {
			
			if (row + r <= -1 || this.moduleCount <= row + r) continue;
			
			for (var c = -1; c <= 7; c++) {
				
				if (col + c <= -1 || this.moduleCount <= col + c) continue;
				
				if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
						|| (0 <= c && c <= 6 && (r == 0 || r == 6) )
						|| (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
					this.modules[row + r][col + c] = true;
				} else {
					this.modules[row + r][col + c] = false;
				}
			}		
		}		
	},
	
	getBestMaskPattern : function() {
	
		var minLostPoint = 0;
		var pattern = 0;
	
		for (var i = 0; i < 8; i++) {
			
			this.makeImpl(true, i);
	
			var lostPoint = QRUtil.getLostPoint(this);
	
			if (i == 0 || minLostPoint >  lostPoint) {
				minLostPoint = lostPoint;
				pattern = i;
			}
		}
	
		return pattern;
	},

	setupTimingPattern : function() {
		
		for (var r = 8; r < this.moduleCount - 8; r++) {
			if (this.modules[r][6] != null) {
				continue;
			}
			this.modules[r][6] = (r % 2 == 0);
		}
	
		for (var c = 8; c < this.moduleCount - 8; c++) {
			if (this.modules[6][c] != null) {
				continue;
			}
			this.modules[6][c] = (c % 2 == 0);
		}
	},
	
	setupPositionAdjustPattern : function() {
	
		var pos = QRUtil.getPatternPosition(this.typeNumber);
		pos = pos || '';
		for (var i = 0; i < pos.length; i++) {
		
			for (var j = 0; j < pos.length; j++) {
			
				var row = pos[i];
				var col = pos[j];
				
				if (this.modules[row][col] != null) {
					continue;
				}
				
				for (var r = -2; r <= 2; r++) {
				
					for (var c = -2; c <= 2; c++) {
					
						if (r == -2 || r == 2 || c == -2 || c == 2 
								|| (r == 0 && c == 0) ) {
							this.modules[row + r][col + c] = true;
						} else {
							this.modules[row + r][col + c] = false;
						}
					}
				}
			}
		}
	},
	
	setupTypeNumber : function(test) {
	
		var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
	
		for (var i = 0; i < 18; i++) {
			var mod = (!test && ( (bits >> i) & 1) == 1);
			this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
		}
	
		for (var i = 0; i < 18; i++) {
			var mod = (!test && ( (bits >> i) & 1) == 1);
			this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
		}
	},
	
	setupTypeInfo : function(test, maskPattern) {
	
		var data = (this.errorCorrectLevel << 3) | maskPattern;
		var bits = QRUtil.getBCHTypeInfo(data);
	
		// vertical		
		for (var i = 0; i < 15; i++) {
	
			var mod = (!test && ( (bits >> i) & 1) == 1);
	
			if (i < 6) {
				this.modules[i][8] = mod;
			} else if (i < 8) {
				this.modules[i + 1][8] = mod;
			} else {
				this.modules[this.moduleCount - 15 + i][8] = mod;
			}
		}
	
		// horizontal
		for (var i = 0; i < 15; i++) {
	
			var mod = (!test && ( (bits >> i) & 1) == 1);
			
			if (i < 8) {
				this.modules[8][this.moduleCount - i - 1] = mod;
			} else if (i < 9) {
				this.modules[8][15 - i - 1 + 1] = mod;
			} else {
				this.modules[8][15 - i - 1] = mod;
			}
		}
	
		// fixed module
		this.modules[this.moduleCount - 8][8] = (!test);
	
	},
	
	mapData : function(data, maskPattern) {
		
		var inc = -1;
		var row = this.moduleCount - 1;
		var bitIndex = 7;
		var byteIndex = 0;
		
		for (var col = this.moduleCount - 1; col > 0; col -= 2) {
	
			if (col == 6) col--;
	
			while (true) {
	
				for (var c = 0; c < 2; c++) {
					
					if (this.modules[row][col - c] == null) {
						
						var dark = false;
	
						if (byteIndex < data.length) {
							dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
						}
	
						var mask = QRUtil.getMask(maskPattern, row, col - c);
	
						if (mask) {
							dark = !dark;
						}
						
						this.modules[row][col - c] = dark;
						bitIndex--;
	
						if (bitIndex == -1) {
							byteIndex++;
							bitIndex = 7;
						}
					}
				}
								
				row += inc;
	
				if (row < 0 || this.moduleCount <= row) {
					row -= inc;
					inc = -inc;
					break;
				}
			}
		}
		
	}

};

QRCode.PAD0 = 0xEC;
QRCode.PAD1 = 0x11;

QRCode.createData = function(typeNumber, errorCorrectLevel, dataList) {
	
	var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
	
	var buffer = new QRBitBuffer();
	
	for (var i = 0; i < dataList.length; i++) {
		var data = dataList[i];
		buffer.put(data.mode, 4);
		buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber) );
		data.write(buffer);
	}

	// calc num max data.
	var totalDataCount = 0;
	for (var i = 0; i < rsBlocks.length; i++) {
		totalDataCount += rsBlocks[i].dataCount;
	}

	if (buffer.getLengthInBits() > totalDataCount * 8) {
		throw new Error("code length overflow. ("
			+ buffer.getLengthInBits()
			+ ">"
			+  totalDataCount * 8
			+ ")");
	}

	// end code
	if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
		buffer.put(0, 4);
	}

	// padding
	while (buffer.getLengthInBits() % 8 != 0) {
		buffer.putBit(false);
	}

	// padding
	while (true) {
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD0, 8);
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD1, 8);
	}

	return QRCode.createBytes(buffer, rsBlocks);
};

QRCode.createBytes = function(buffer, rsBlocks) {

	var offset = 0;
	
	var maxDcCount = 0;
	var maxEcCount = 0;
	
	var dcdata = new QRDataArray(rsBlocks.length);
	var ecdata = new QRDataArray(rsBlocks.length);
	
	for (var r = 0; r < rsBlocks.length; r++) {

		var dcCount = rsBlocks[r].dataCount;
		var ecCount = rsBlocks[r].totalCount - dcCount;

		maxDcCount = Math.max(maxDcCount, dcCount);
		maxEcCount = Math.max(maxEcCount, ecCount);
		
		dcdata[r] = new QRDataArray(dcCount);
		
		for (var i = 0; i < dcdata[r].length; i++) {
			dcdata[r][i] = 0xff & buffer.buffer[i + offset];
		}
		offset += dcCount;
		
		var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
		var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);

		var modPoly = rawPoly.mod(rsPoly);
		ecdata[r] = new QRDataArray(rsPoly.getLength() - 1);
		for (var i = 0; i < ecdata[r].length; i++) {
            var modIndex = i + modPoly.getLength() - ecdata[r].length;
			ecdata[r][i] = (modIndex >= 0)? modPoly.get(modIndex) : 0;
		}

	}
	
	var totalCodeCount = 0;
	for (var i = 0; i < rsBlocks.length; i++) {
		totalCodeCount += rsBlocks[i].totalCount;
	}

	var data = new QRDataArray(totalCodeCount);
	var index = 0;

	for (var i = 0; i < maxDcCount; i++) {
		for (var r = 0; r < rsBlocks.length; r++) {
			if (i < dcdata[r].length) {
				data[index++] = dcdata[r][i];
			}
		}
	}

	for (var i = 0; i < maxEcCount; i++) {
		for (var r = 0; r < rsBlocks.length; r++) {
			if (i < ecdata[r].length) {
				data[index++] = ecdata[r][i];
			}
		}
	}

	return data;

};

//---------------------------------------------------------------------
// QR8bitByte
//---------------------------------------------------------------------
function QR8bitByte(data) {
  this.mode = QRMode.MODE_8BIT_BYTE;
  this.data = data;
  var byteArray = [];
  
  this.parsedData = bops.from(data);
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


//---------------------------------------------------------------------
// QRMode
//---------------------------------------------------------------------

var QRMode = {
	MODE_NUMBER :		1 << 0,
	MODE_ALPHA_NUM : 	1 << 1,
	MODE_8BIT_BYTE : 	1 << 2,
	MODE_KANJI :		1 << 3
};

//---------------------------------------------------------------------
// QRErrorCorrectLevel
//---------------------------------------------------------------------
//exported

var QRErrorCorrectLevel = exports.QRErrorCorrectLevel = {
	L : 1,
	M : 0,
	Q : 3,
	H : 2
};

//---------------------------------------------------------------------
// QRMaskPattern
//---------------------------------------------------------------------

var QRMaskPattern =  {
	PATTERN000 : 0,
	PATTERN001 : 1,
	PATTERN010 : 2,
	PATTERN011 : 3,
	PATTERN100 : 4,
	PATTERN101 : 5,
	PATTERN110 : 6,
	PATTERN111 : 7
};

//---------------------------------------------------------------------
// QRUtil
//---------------------------------------------------------------------
 
var QRUtil = {

    PATTERN_POSITION_TABLE : [
	    [],
	    [6, 18],
	    [6, 22],
	    [6, 26],
	    [6, 30],
	    [6, 34],
	    [6, 22, 38],
	    [6, 24, 42],
	    [6, 26, 46],
	    [6, 28, 50],
	    [6, 30, 54],		
	    [6, 32, 58],
	    [6, 34, 62],
	    [6, 26, 46, 66],
	    [6, 26, 48, 70],
	    [6, 26, 50, 74],
	    [6, 30, 54, 78],
	    [6, 30, 56, 82],
	    [6, 30, 58, 86],
	    [6, 34, 62, 90],
	    [6, 28, 50, 72, 94],
	    [6, 26, 50, 74, 98],
	    [6, 30, 54, 78, 102],
	    [6, 28, 54, 80, 106],
	    [6, 32, 58, 84, 110],
	    [6, 30, 58, 86, 114],
	    [6, 34, 62, 90, 118],
	    [6, 26, 50, 74, 98, 122],
	    [6, 30, 54, 78, 102, 126],
	    [6, 26, 52, 78, 104, 130],
	    [6, 30, 56, 82, 108, 134],
	    [6, 34, 60, 86, 112, 138],
	    [6, 30, 58, 86, 114, 142],
	    [6, 34, 62, 90, 118, 146],
	    [6, 30, 54, 78, 102, 126, 150],
	    [6, 24, 50, 76, 102, 128, 154],
	    [6, 28, 54, 80, 106, 132, 158],
	    [6, 32, 58, 84, 110, 136, 162],
	    [6, 26, 54, 82, 110, 138, 166],
	    [6, 30, 58, 86, 114, 142, 170]
    ],

    G15 : (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
    G18 : (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
    G15_MASK : (1 << 14) | (1 << 12) | (1 << 10)	| (1 << 4) | (1 << 1),

    getBCHTypeInfo : function(data) {
	    var d = data << 10;
	    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
		    d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) ) ); 	
	    }
	    return ( (data << 10) | d) ^ QRUtil.G15_MASK;
    },

    getBCHTypeNumber : function(data) {
	    var d = data << 12;
	    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
		    d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) ) ); 	
	    }
	    return (data << 12) | d;
    },

    getBCHDigit : function(data) {

	    var digit = 0;

	    while (data != 0) {
		    digit++;
		    data >>>= 1;
	    }

	    return digit;
    },

    getPatternPosition : function(typeNumber) {
	    return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },

    getMask : function(maskPattern, i, j) {
	    
	    switch (maskPattern) {
		    
	    case QRMaskPattern.PATTERN000 : return (i + j) % 2 == 0;
	    case QRMaskPattern.PATTERN001 : return i % 2 == 0;
	    case QRMaskPattern.PATTERN010 : return j % 3 == 0;
	    case QRMaskPattern.PATTERN011 : return (i + j) % 3 == 0;
	    case QRMaskPattern.PATTERN100 : return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0;
	    case QRMaskPattern.PATTERN101 : return (i * j) % 2 + (i * j) % 3 == 0;
	    case QRMaskPattern.PATTERN110 : return ( (i * j) % 2 + (i * j) % 3) % 2 == 0;
	    case QRMaskPattern.PATTERN111 : return ( (i * j) % 3 + (i + j) % 2) % 2 == 0;

	    default :
		    throw new Error("bad maskPattern:" + maskPattern);
	    }
    },

    getErrorCorrectPolynomial : function(errorCorrectLength) {

	    var a = new QRPolynomial([1], 0);

	    for (var i = 0; i < errorCorrectLength; i++) {
		    a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0) );
	    }

	    return a;
    },

    getLengthInBits : function(mode, type) {

	    if (1 <= type && type < 10) {

		    // 1 - 9

		    switch(mode) {
		    case QRMode.MODE_NUMBER 	: return 10;
		    case QRMode.MODE_ALPHA_NUM 	: return 9;
		    case QRMode.MODE_8BIT_BYTE	: return 8;
		    case QRMode.MODE_KANJI  	: return 8;
		    default :
			    throw new Error("mode:" + mode);
		    }

	    } else if (type < 27) {

		    // 10 - 26

		    switch(mode) {
		    case QRMode.MODE_NUMBER 	: return 12;
		    case QRMode.MODE_ALPHA_NUM 	: return 11;
		    case QRMode.MODE_8BIT_BYTE	: return 16;
		    case QRMode.MODE_KANJI  	: return 10;
		    default :
			    throw new Error("mode:" + mode);
		    }

	    } else if (type < 41) {

		    // 27 - 40

		    switch(mode) {
		    case QRMode.MODE_NUMBER 	: return 14;
		    case QRMode.MODE_ALPHA_NUM	: return 13;
		    case QRMode.MODE_8BIT_BYTE	: return 16;
		    case QRMode.MODE_KANJI  	: return 12;
		    default :
			    throw new Error("mode:" + mode);
		    }

	    } else {
		    throw new Error("type:" + type);
	    }
    },

    getLostPoint : function(qrCode) {
	    
	    var moduleCount = qrCode.getModuleCount();
	    
	    var lostPoint = 0;
	    
	    // LEVEL1
	    
	    for (var row = 0; row < moduleCount; row++) {

		    for (var col = 0; col < moduleCount; col++) {

			    var sameCount = 0;
			    var dark = qrCode.isDark(row, col);

				for (var r = -1; r <= 1; r++) {

				    if (row + r < 0 || moduleCount <= row + r) {
					    continue;
				    }

				    for (var c = -1; c <= 1; c++) {

					    if (col + c < 0 || moduleCount <= col + c) {
						    continue;
					    }

					    if (r == 0 && c == 0) {
						    continue;
					    }

					    if (dark == qrCode.isDark(row + r, col + c) ) {
						    sameCount++;
					    }
				    }
			    }

			    if (sameCount > 5) {
				    lostPoint += (3 + sameCount - 5);
			    }
		    }
	    }

	    // LEVEL2

	    for (var row = 0; row < moduleCount - 1; row++) {
		    for (var col = 0; col < moduleCount - 1; col++) {
			    var count = 0;
			    if (qrCode.isDark(row,     col    ) ) count++;
			    if (qrCode.isDark(row + 1, col    ) ) count++;
			    if (qrCode.isDark(row,     col + 1) ) count++;
			    if (qrCode.isDark(row + 1, col + 1) ) count++;
			    if (count == 0 || count == 4) {
				    lostPoint += 3;
			    }
		    }
	    }

	    // LEVEL3

	    for (var row = 0; row < moduleCount; row++) {
		    for (var col = 0; col < moduleCount - 6; col++) {
			    if (qrCode.isDark(row, col)
					    && !qrCode.isDark(row, col + 1)
					    &&  qrCode.isDark(row, col + 2)
					    &&  qrCode.isDark(row, col + 3)
					    &&  qrCode.isDark(row, col + 4)
					    && !qrCode.isDark(row, col + 5)
					    &&  qrCode.isDark(row, col + 6) ) {
				    lostPoint += 40;
			    }
		    }
	    }

	    for (var col = 0; col < moduleCount; col++) {
		    for (var row = 0; row < moduleCount - 6; row++) {
			    if (qrCode.isDark(row, col)
					    && !qrCode.isDark(row + 1, col)
					    &&  qrCode.isDark(row + 2, col)
					    &&  qrCode.isDark(row + 3, col)
					    &&  qrCode.isDark(row + 4, col)
					    && !qrCode.isDark(row + 5, col)
					    &&  qrCode.isDark(row + 6, col) ) {
				    lostPoint += 40;
			    }
		    }
	    }

	    // LEVEL4
	    
	    var darkCount = 0;

	    for (var col = 0; col < moduleCount; col++) {
		    for (var row = 0; row < moduleCount; row++) {
			    if (qrCode.isDark(row, col) ) {
				    darkCount++;
			    }
		    }
	    }
	    
	    var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
	    lostPoint += ratio * 10;

	    return lostPoint;		
    }

};


//---------------------------------------------------------------------
// QRMath
//---------------------------------------------------------------------

var QRMath = {

	glog : function(n) {
	
		if (n < 1) {
			throw new Error("glog(" + n + ")");
		}
		
		return QRMath.LOG_TABLE[n];
	},
	
	gexp : function(n) {
	
		while (n < 0) {
			n += 255;
		}
	
		while (n >= 256) {
			n -= 255;
		}
	
		return QRMath.EXP_TABLE[n];
	},
	
	EXP_TABLE : new Array(256),
	
	LOG_TABLE : new Array(256)

};
	
for (var i = 0; i < 8; i++) {
	QRMath.EXP_TABLE[i] = 1 << i;
}
for (var i = 8; i < 256; i++) {
	QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4]
		^ QRMath.EXP_TABLE[i - 5]
		^ QRMath.EXP_TABLE[i - 6]
		^ QRMath.EXP_TABLE[i - 8];
}
for (var i = 0; i < 255; i++) {
	QRMath.LOG_TABLE[QRMath.EXP_TABLE[i] ] = i;
}

//---------------------------------------------------------------------
// QRPolynomial
//---------------------------------------------------------------------

function QRPolynomial(num, shift) {

	if (num.length == undefined) {
		throw new Error(num.length + "/" + shift);
	}

	var offset = 0;

	while (offset < num.length && num[offset] == 0) {
		offset++;
	}

	this.num = new Array(num.length - offset + shift);
	for (var i = 0; i < num.length - offset; i++) {
		this.num[i] = num[i + offset];
	}
}

QRPolynomial.prototype = {

	get : function(index) {
		return this.num[index];
	},
	
	getLength : function() {
		return this.num.length;
	},
	
	multiply : function(e) {
	
		var num = new Array(this.getLength() + e.getLength() - 1);
	
		for (var i = 0; i < this.getLength(); i++) {
			for (var j = 0; j < e.getLength(); j++) {
				num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i) ) + QRMath.glog(e.get(j) ) );
			}
		}
	
		return new QRPolynomial(num, 0);
	},
	
	mod : function(e) {
	
		if (this.getLength() - e.getLength() < 0) {
			return this;
		}
	
		var ratio = QRMath.glog(this.get(0) ) - QRMath.glog(e.get(0) );
	
		var num = new Array(this.getLength() );
		
		for (var i = 0; i < this.getLength(); i++) {
			num[i] = this.get(i);
		}
		
		for (var i = 0; i < e.getLength(); i++) {
			num[i] ^= QRMath.gexp(QRMath.glog(e.get(i) ) + ratio);
		}
	
		// recursive call
		return new QRPolynomial(num, 0).mod(e);
	}
};

//---------------------------------------------------------------------
// QRRSBlock
//---------------------------------------------------------------------

function QRRSBlock(totalCount, dataCount) {
	this.totalCount = totalCount;
	this.dataCount  = dataCount;
}

QRRSBlock.RS_BLOCK_TABLE = [
// L
// M
// Q
// H

// 1
[1, 26, 19],
[1, 26, 16],
[1, 26, 13],
[1, 26, 9],
// 2
[1, 44, 34],
[1, 44, 28],
[1, 44, 22],
[1, 44, 16],
// 3
[1, 70, 55],
[1, 70, 44],
[2, 35, 17],
[2, 35, 13],
// 4		
[1, 100, 80],
[2, 50, 32],
[2, 50, 24],
[4, 25, 9],
// 5
[1, 134, 108],
[2, 67, 43],
[2, 33, 15, 2, 34, 16],
[2, 33, 11, 2, 34, 12],
// 6
[2, 86, 68],
[4, 43, 27],
[4, 43, 19],
[4, 43, 15],
// 7		
[2, 98, 78],
[4, 49, 31],
[2, 32, 14, 4, 33, 15],
[4, 39, 13, 1, 40, 14],
// 8
[2, 121, 97],
[2, 60, 38, 2, 61, 39],
[4, 40, 18, 2, 41, 19],
[4, 40, 14, 2, 41, 15],
// 9
[2, 146, 116],
[3, 58, 36, 2, 59, 37],
[4, 36, 16, 4, 37, 17],
[4, 36, 12, 4, 37, 13],
// 10		
[2, 86, 68, 2, 87, 69],
[4, 69, 43, 1, 70, 44],
[6, 43, 19, 2, 44, 20],
[6, 43, 15, 2, 44, 16]
//NOTE added by Ryan Day.to make greater than version 10 qrcodes
// this table starts on page 40 of the spec PDF. google ISO/IEC 18004
// 11
,[4,101,81]
,[1,80,50,4,81,51]
,[4,50,22,4,51,23]
,[3,36,12,8,37,13]
//12
,[2,116,92,2,117,93]
,[6,58,36,2,59,37]
,[4,46,20,6,47,21]
,[7,42,14,4,43,15]
//13
,[4,133,107]
,[8,59,37,1,60,38]
,[8,44,20,4,45,21]
,[12,33,11,4,34,12]
//14
,[3,145,115,1,146,116]
,[4,64,40,5,65,41]
,[11,36,16,5,37,17]
,[11,36,12,5,37,13]
//15
,[5,109,87,1,110,88]
,[5,65,41,5,66,42]
,[5,54,24,7,55,25]
,[11,36,12,7,37,13]
//16
,[5,122,98,1,123,99]
,[7,73,45,3,74,46]
,[15,43,19,2,44,20]
,[3,45,15,13,46,16]
//17
,[1,135,107,5,136,108]
,[10,74,46,1,75,47]
,[1,50,22,15,51,23]
,[2,42,14,17,43,15]
//18
,[5,150,120,1,151,121]
,[9,69,43,4,70,44]
,[17,50,22,1,51,23]
,[2,42,14,19,43,15]
//19
,[3,141,113,4,142,114]
,[3,70,44,11,71,45]
,[17,47,21,4,48,22]
,[9,39,13,16,40,14]
//20
,[3,135,107,5,136,108]
,[3,67,41,13,68,42]
,[15,54,24,5,55,25]
,[15,43,15,10,44,16]
//21
,[4,144,116,4,145,117]
,[17,68,42]
,[17,50,22,6,51,23]
,[19,46,16,6,47,17]
//22
,[2,139,111,7,140,112]
,[17,74,46]
,[7,54,24,16,55,25]
,[34,37,13]
//23
,[4,151,121,5,152,122]
,[4,75,47,14,76,48]
,[11,54,24,14,55,25]
,[16,45,15,14,46,16]
//24
,[6,147,117,4,148,118]
,[6,73,45,14,74,46]
,[11,54,24,16,55,25]
,[30,46,16,2,47,17]
//25
,[8,132,106,4,133,107]
,[8,75,47,13,76,48]
,[7,54,24,22,55,25]
,[22,45,15,13,46,16]
//26
,[10,142,114,2,143,115]
,[19,74,46,4,75,47]
,[28,50,22,6,51,23]
,[33,46,16,4,47,17]
//27
,[8,152,122,4,153,123]
,[22,73,45,3,74,46]
,[8,53,23,26,54,24]
,[12,45,15,28,46,16]
//28
,[3,147,117,10,148,118]
,[3,73,45,23,74,46]
,[4,54,24,31,55,25]
,[11,45,15,31,46,16]
//29
,[7,146,116,7,147,117]
,[21,73,45,7,74,46]
,[1,53,23,37,54,24]
,[19,45,15,26,46,16]
//30
,[5,145,115,10,146,116]
,[19,75,47,10,76,48]
,[15,54,24,25,55,25]
,[23,45,15,25,46,16]
//31
,[13,145,115,3,146,116]
,[2,74,46,29,75,47]
,[42,54,24,1,55,25]
,[23,45,15,28,46,16]
//32
,[17,145,115]
,[10,74,46,23,75,47]
,[10,54,24,35,55,25]
,[19,45,15,35,46,16]
//33
,[17,145,115,1,146,116]
,[14,74,46,21,75,47]
,[29,54,24,19,55,25]
,[11,45,15,46,46,16]
//34
,[13,145,115,6,146,116]
,[14,74,46,23,75,47]
,[44,54,24,7,55,25]
,[59,46,16,1,47,17]
//35
,[12,151,121,7,152,122]
,[12,75,47,26,76,48]
,[39,54,24,14,55,25]
,[22,45,15,41,46,16]
//36
,[6,151,121,14,152,122]
,[6,75,47,34,76,48]
,[46,54,24,10,55,25]
,[2,45,15,64,46,16]
//37
,[17,152,122,4,153,123]
,[29,74,46,14,75,47]
,[49,54,24,10,55,25]
,[24,45,15,46,46,16]
//38
,[4,152,122,18,153,123]
,[13,74,46,32,75,47]
,[48,54,24,14,55,25]
,[42,45,15,32,46,16]
//39
,[20,147,117,4,148,118]
,[40,75,47,7,76,48]
,[43,54,24,22,55,25]
,[10,45,15,67,46,16]
//40
,[19,148,118,6,149,119]
,[18,75,47,31,76,48]
,[34,54,24,34,55,25]
,[20,45,15,61,46,16]	
];

QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
	
	var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
	
	if (rsBlock == undefined) {
		throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
	}

	var length = rsBlock.length / 3;
	
	var list = new Array();
	
	for (var i = 0; i < length; i++) {

		var count = rsBlock[i * 3 + 0];
		var totalCount = rsBlock[i * 3 + 1];
		var dataCount  = rsBlock[i * 3 + 2];

		for (var j = 0; j < count; j++) {
			list.push(new QRRSBlock(totalCount, dataCount) );	
		}
	}
	
	return list;
}

QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {

	switch(errorCorrectLevel) {
	case QRErrorCorrectLevel.L :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
	case QRErrorCorrectLevel.M :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
	case QRErrorCorrectLevel.Q :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
	case QRErrorCorrectLevel.H :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
	default :
		return undefined;
	}
}

//---------------------------------------------------------------------
// QRBitBuffer
//---------------------------------------------------------------------

function QRBitBuffer() {
	this.buffer = new Array();
	this.length = 0;
}

QRBitBuffer.prototype = {

	get : function(index) {
		var bufIndex = Math.floor(index / 8);
		return ( (this.buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
	},
	
	put : function(num, length) {
		for (var i = 0; i < length; i++) {
			this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
		}
	},
	
	getLengthInBits : function() {
		return this.length;
	},
	
	putBit : function(bit) {
	
		var bufIndex = Math.floor(this.length / 8);
		if (this.buffer.length <= bufIndex) {
			this.buffer.push(0);
		}
	
		if (bit) {
			this.buffer[bufIndex] |= (0x80 >>> (this.length % 8) );
		}
	
		this.length++;
	}
};

},{"bops":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/index.js"}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/index.js":[function(require,module,exports){
var proto = {}
module.exports = proto

proto.from = require('./from.js')
proto.to = require('./to.js')
proto.is = require('./is.js')
proto.subarray = require('./subarray.js')
proto.join = require('./join.js')
proto.copy = require('./copy.js')
proto.create = require('./create.js')

mix(require('./read.js'), proto)
mix(require('./write.js'), proto)

function mix(from, into) {
  for(var key in from) {
    into[key] = from[key]
  }
}

},{"./copy.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/copy.js","./create.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/create.js","./from.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/from.js","./is.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/is.js","./join.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/join.js","./read.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/read.js","./subarray.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/subarray.js","./to.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/to.js","./write.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/write.js"}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/node_modules/base64-js/lib/b64.js":[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/node_modules/to-utf8/index.js":[function(require,module,exports){
module.exports = to_utf8

var out = []
  , col = []
  , fcc = String.fromCharCode
  , mask = [0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01]
  , unmask = [
      0x00
    , 0x01
    , 0x02 | 0x01
    , 0x04 | 0x02 | 0x01
    , 0x08 | 0x04 | 0x02 | 0x01
    , 0x10 | 0x08 | 0x04 | 0x02 | 0x01
    , 0x20 | 0x10 | 0x08 | 0x04 | 0x02 | 0x01
    , 0x40 | 0x20 | 0x10 | 0x08 | 0x04 | 0x02 | 0x01
  ]

function to_utf8(bytes, start, end) {
  start = start === undefined ? 0 : start
  end = end === undefined ? bytes.length : end

  var idx = 0
    , hi = 0x80
    , collecting = 0
    , pos
    , by

  col.length =
  out.length = 0

  while(idx < bytes.length) {
    by = bytes[idx]
    if(!collecting && by & hi) {
      pos = find_pad_position(by)
      collecting += pos
      if(pos < 8) {
        col[col.length] = by & unmask[6 - pos]
      }
    } else if(collecting) {
      col[col.length] = by & unmask[6]
      --collecting
      if(!collecting && col.length) {
        out[out.length] = fcc(reduced(col, pos))
        col.length = 0
      }
    } else { 
      out[out.length] = fcc(by)
    }
    ++idx
  }
  if(col.length && !collecting) {
    out[out.length] = fcc(reduced(col, pos))
    col.length = 0
  }
  return out.join('')
}

function find_pad_position(byt) {
  for(var i = 0; i < 7; ++i) {
    if(!(byt & mask[i])) {
      break
    }
  }
  return i
}

function reduced(list) {
  var out = 0
  for(var i = 0, len = list.length; i < len; ++i) {
    out |= list[i] << ((len - i - 1) * 6)
  }
  return out
}

},{}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/copy.js":[function(require,module,exports){
module.exports = copy

var slice = [].slice

function copy(source, target, target_start, source_start, source_end) {
  target_start = arguments.length < 3 ? 0 : target_start
  source_start = arguments.length < 4 ? 0 : source_start
  source_end = arguments.length < 5 ? source.length : source_end

  if(source_end === source_start) {
    return
  }

  if(target.length === 0 || source.length === 0) {
    return
  }

  if(source_end > source.length) {
    source_end = source.length
  }

  if(target.length - target_start < source_end - source_start) {
    source_end = target.length - target_start + start
  }

  if(source.buffer !== target.buffer) {
    return fast_copy(source, target, target_start, source_start, source_end)
  }
  return slow_copy(source, target, target_start, source_start, source_end)
}

function fast_copy(source, target, target_start, source_start, source_end) {
  var len = (source_end - source_start) + target_start

  for(var i = target_start, j = source_start;
      i < len;
      ++i,
      ++j) {
    target[i] = source[j]
  }
}

function slow_copy(from, to, j, i, jend) {
  // the buffers could overlap.
  var iend = jend + i
    , tmp = new Uint8Array(slice.call(from, i, iend))
    , x = 0

  for(; i < iend; ++i, ++x) {
    to[j++] = tmp[x]
  }
}

},{}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/create.js":[function(require,module,exports){
module.exports = function(size) {
  return new Uint8Array(size)
}

},{}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/from.js":[function(require,module,exports){
module.exports = from

var base64 = require('base64-js')

var decoders = {
    hex: from_hex
  , utf8: from_utf
  , base64: from_base64
}

function from(source, encoding) {
  if(Array.isArray(source)) {
    return new Uint8Array(source)
  }

  return decoders[encoding || 'utf8'](source)
}

function from_hex(str) {
  var size = str.length / 2
    , buf = new Uint8Array(size)
    , character = ''

  for(var i = 0, len = str.length; i < len; ++i) {
    character += str.charAt(i)

    if(i > 0 && (i % 2) === 1) {
      buf[i>>>1] = parseInt(character, 16)
      character = '' 
    }
  }

  return buf 
}

function from_utf(str) {
  var bytes = []
    , tmp
    , ch

  for(var i = 0, len = str.length; i < len; ++i) {
    ch = str.charCodeAt(i)
    if(ch & 0x80) {
      tmp = encodeURIComponent(str.charAt(i)).substr(1).split('%')
      for(var j = 0, jlen = tmp.length; j < jlen; ++j) {
        bytes[bytes.length] = parseInt(tmp[j], 16)
      }
    } else {
      bytes[bytes.length] = ch 
    }
  }

  return new Uint8Array(bytes)
}

function from_base64(str) {
  return new Uint8Array(base64.toByteArray(str)) 
}

},{"base64-js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/node_modules/base64-js/lib/b64.js"}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/is.js":[function(require,module,exports){

module.exports = function(buffer) {
  return buffer instanceof Uint8Array;
}

},{}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/join.js":[function(require,module,exports){
module.exports = join

function join(targets, hint) {
  if(!targets.length) {
    return new Uint8Array(0)
  }

  var len = hint !== undefined ? hint : get_length(targets)
    , out = new Uint8Array(len)
    , cur = targets[0]
    , curlen = cur.length
    , curidx = 0
    , curoff = 0
    , i = 0

  while(i < len) {
    if(curoff === curlen) {
      curoff = 0
      ++curidx
      cur = targets[curidx]
      curlen = cur && cur.length
      continue
    }
    out[i++] = cur[curoff++] 
  }

  return out
}

function get_length(targets) {
  var size = 0
  for(var i = 0, len = targets.length; i < len; ++i) {
    size += targets[i].byteLength
  }
  return size
}

},{}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/mapped.js":[function(require,module,exports){
var proto
  , map

module.exports = proto = {}

map = typeof WeakMap === 'undefined' ? null : new WeakMap

proto.get = !map ? no_weakmap_get : get

function no_weakmap_get(target) {
  return new DataView(target.buffer, 0)
}

function get(target) {
  var out = map.get(target.buffer)
  if(!out) {
    map.set(target.buffer, out = new DataView(target.buffer, 0))
  }
  return out
}

},{}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/read.js":[function(require,module,exports){
module.exports = {
    readUInt8:      read_uint8
  , readInt8:       read_int8
  , readUInt16LE:   read_uint16_le
  , readUInt32LE:   read_uint32_le
  , readInt16LE:    read_int16_le
  , readInt32LE:    read_int32_le
  , readFloatLE:    read_float_le
  , readDoubleLE:   read_double_le
  , readUInt16BE:   read_uint16_be
  , readUInt32BE:   read_uint32_be
  , readInt16BE:    read_int16_be
  , readInt32BE:    read_int32_be
  , readFloatBE:    read_float_be
  , readDoubleBE:   read_double_be
}

var map = require('./mapped.js')

function read_uint8(target, at) {
  return target[at]
}

function read_int8(target, at) {
  var v = target[at];
  return v < 0x80 ? v : v - 0x100
}

function read_uint16_le(target, at) {
  var dv = map.get(target);
  return dv.getUint16(at + target.byteOffset, true)
}

function read_uint32_le(target, at) {
  var dv = map.get(target);
  return dv.getUint32(at + target.byteOffset, true)
}

function read_int16_le(target, at) {
  var dv = map.get(target);
  return dv.getInt16(at + target.byteOffset, true)
}

function read_int32_le(target, at) {
  var dv = map.get(target);
  return dv.getInt32(at + target.byteOffset, true)
}

function read_float_le(target, at) {
  var dv = map.get(target);
  return dv.getFloat32(at + target.byteOffset, true)
}

function read_double_le(target, at) {
  var dv = map.get(target);
  return dv.getFloat64(at + target.byteOffset, true)
}

function read_uint16_be(target, at) {
  var dv = map.get(target);
  return dv.getUint16(at + target.byteOffset, false)
}

function read_uint32_be(target, at) {
  var dv = map.get(target);
  return dv.getUint32(at + target.byteOffset, false)
}

function read_int16_be(target, at) {
  var dv = map.get(target);
  return dv.getInt16(at + target.byteOffset, false)
}

function read_int32_be(target, at) {
  var dv = map.get(target);
  return dv.getInt32(at + target.byteOffset, false)
}

function read_float_be(target, at) {
  var dv = map.get(target);
  return dv.getFloat32(at + target.byteOffset, false)
}

function read_double_be(target, at) {
  var dv = map.get(target);
  return dv.getFloat64(at + target.byteOffset, false)
}

},{"./mapped.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/mapped.js"}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/subarray.js":[function(require,module,exports){
module.exports = subarray

function subarray(buf, from, to) {
  return buf.subarray(from || 0, to || buf.length)
}

},{}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/to.js":[function(require,module,exports){
module.exports = to

var base64 = require('base64-js')
  , toutf8 = require('to-utf8')

var encoders = {
    hex: to_hex
  , utf8: to_utf
  , base64: to_base64
}

function to(buf, encoding) {
  return encoders[encoding || 'utf8'](buf)
}

function to_hex(buf) {
  var str = ''
    , byt

  for(var i = 0, len = buf.length; i < len; ++i) {
    byt = buf[i]
    str += ((byt & 0xF0) >>> 4).toString(16)
    str += (byt & 0x0F).toString(16)
  }

  return str
}

function to_utf(buf) {
  return toutf8(buf)
}

function to_base64(buf) {
  return base64.fromByteArray(buf)
}


},{"base64-js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/node_modules/base64-js/lib/b64.js","to-utf8":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/node_modules/to-utf8/index.js"}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/write.js":[function(require,module,exports){
module.exports = {
    writeUInt8:      write_uint8
  , writeInt8:       write_int8
  , writeUInt16LE:   write_uint16_le
  , writeUInt32LE:   write_uint32_le
  , writeInt16LE:    write_int16_le
  , writeInt32LE:    write_int32_le
  , writeFloatLE:    write_float_le
  , writeDoubleLE:   write_double_le
  , writeUInt16BE:   write_uint16_be
  , writeUInt32BE:   write_uint32_be
  , writeInt16BE:    write_int16_be
  , writeInt32BE:    write_int32_be
  , writeFloatBE:    write_float_be
  , writeDoubleBE:   write_double_be
}

var map = require('./mapped.js')

function write_uint8(target, value, at) {
  return target[at] = value
}

function write_int8(target, value, at) {
  return target[at] = value < 0 ? value + 0x100 : value
}

function write_uint16_le(target, value, at) {
  var dv = map.get(target);
  return dv.setUint16(at + target.byteOffset, value, true)
}

function write_uint32_le(target, value, at) {
  var dv = map.get(target);
  return dv.setUint32(at + target.byteOffset, value, true)
}

function write_int16_le(target, value, at) {
  var dv = map.get(target);
  return dv.setInt16(at + target.byteOffset, value, true)
}

function write_int32_le(target, value, at) {
  var dv = map.get(target);
  return dv.setInt32(at + target.byteOffset, value, true)
}

function write_float_le(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat32(at + target.byteOffset, value, true)
}

function write_double_le(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat64(at + target.byteOffset, value, true)
}

function write_uint16_be(target, value, at) {
  var dv = map.get(target);
  return dv.setUint16(at + target.byteOffset, value, false)
}

function write_uint32_be(target, value, at) {
  var dv = map.get(target);
  return dv.setUint32(at + target.byteOffset, value, false)
}

function write_int16_be(target, value, at) {
  var dv = map.get(target);
  return dv.setInt16(at + target.byteOffset, value, false)
}

function write_int32_be(target, value, at) {
  var dv = map.get(target);
  return dv.setInt32(at + target.byteOffset, value, false)
}

function write_float_be(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat32(at + target.byteOffset, value, false)
}

function write_double_be(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat64(at + target.byteOffset, value, false)
}

},{"./mapped.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/node_modules/bops/typedarray/mapped.js"}],"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/qrcodeclient.js":[function(require,module,exports){

module.exports = require('./lib/qrcode-draw.js');
},{"./lib/qrcode-draw.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/lib/qrcode-draw.js"}],"/Users/sunaiwen/projects/shareKit/tests/test.js":[function(require,module,exports){
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

    describe('Device Detecting', function(){
        it('should device detection getting right', function(){
            var ua_1 = 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30';
            var ua_2 = 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36';
            var ua_3 = 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25';
            var re_1 = SK.prototype.detectDevice(ua_1);
            var re_2 = SK.prototype.detectDevice(ua_2);
            var re_3 = SK.prototype.detectDevice(ua_3);
            expect(re_1).to.equal('phone');
            expect(re_2).to.equal('pc');
            expect(re_3).to.equal('phone');
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
            it('Should the bind function be invoked 3 times', function(){
                // weibo-sharing function don't need to bind an event.
                var spy = sinon.spy(SK.prototype, 'bind');
                var sk = new SK();
                expect(spy.callCount).to.equal(3);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9qcy9zaGFyZUtpdC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3FyY2FwYWNpdHl0YWJsZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3FyY29kZS1kcmF3LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvcXJjb2RlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy9ub2RlX21vZHVsZXMvdG8tdXRmOC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvdHlwZWRhcnJheS9jb3B5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy90eXBlZGFycmF5L2NyZWF0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvdHlwZWRhcnJheS9mcm9tLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy90eXBlZGFycmF5L2lzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy90eXBlZGFycmF5L2pvaW4uanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL25vZGVfbW9kdWxlcy9ib3BzL3R5cGVkYXJyYXkvbWFwcGVkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy90eXBlZGFycmF5L3JlYWQuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL25vZGVfbW9kdWxlcy9ib3BzL3R5cGVkYXJyYXkvc3ViYXJyYXkuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL25vZGVfbW9kdWxlcy9ib3BzL3R5cGVkYXJyYXkvdG8uanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL25vZGVfbW9kdWxlcy9ib3BzL3R5cGVkYXJyYXkvd3JpdGUuanMiLCIuLi9ub2RlX21vZHVsZXMvcXJjb2RlL3FyY29kZWNsaWVudC5qcyIsInRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDanBDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCI7KGZ1bmN0aW9uKCl7XG4gICAgdmFyIFFSQ29kZSA9IHJlcXVpcmUoJ3FyY29kZS9xcmNvZGVjbGllbnQuanMnKTtcbiAgICB2YXIgU0sgPSBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgICAgdGhpcy5iYXNlQ29uZiA9IHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgdGhpcy5kZXZpY2UgPSB0aGlzLmRldGVjdERldmljZShuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgICAgdGhpcy5pbml0RWxlKHRoaXMuYmFzZUNvbmYucHJlZml4KTtcbiAgICAgICAgdGhpcy5iaW5kKHRoaXMucXpFbGUsIHRoaXMucXpvbmVGdW5jKTtcbiAgICAgICAgdGhpcy5iaW5kKHRoaXMudHdFbGUsIHRoaXMudHdpdHRlckZ1bmMpO1xuICAgICAgICB0aGlzLmJpbmQodGhpcy53eEVsZSwgdGhpcy53ZWNoYXRGdW5jKTtcbiAgICB9O1xuICAgIFNLLnByb3RvdHlwZS5pbml0RWxlID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy53cmFwRWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtJytwcmVmaXgpWzBdO1xuICAgICAgICB0aGlzLnF6RWxlID0gdGhpcy53cmFwRWxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLScrcHJlZml4KyctcXpvbmUnKVswXTtcbiAgICAgICAgdGhpcy53YkVsZSA9IHRoaXMud3JhcEVsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy0nK3ByZWZpeCsnLXdlaWJvJylbMF07XG4gICAgICAgIHRoaXMudHdFbGUgPSB0aGlzLndyYXBFbGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtJytwcmVmaXgrJy10d2l0dGVyJylbMF07XG4gICAgICAgIHRoaXMud3hFbGUgPSB0aGlzLndyYXBFbGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtJytwcmVmaXgrJy13ZWNoYXQnKVswXTtcblxuICAgIC8vICAgIGluaXQgd2VpYm8gc2NyaXB0XG4gICAgICAgIHZhciB3YlNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICB3YlNjcmlwdC5zcmMgPSAnaHR0cDovL3Rqcy5zanMuc2luYWpzLmNuL29wZW4vYXBpL2pzL3diLmpzJztcbiAgICAgICAgd2JTY3JpcHQuY2hhcnNldCA9ICd1dGYtOCc7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQod2JTY3JpcHQpO1xuICAgICAgICB3YlNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgc2VsZi53ZWlib0Z1bmMoc2VsZik7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIFNLLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24oZWxlLCBoYW5kbGVyKXtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBlbGUub25jbGljayA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaGFuZGxlcihzZWxmKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgU0sucHJvdG90eXBlLm9wZW5XaW4gPSBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgICAgLy8gdXJsIGNhbm5vdCBiZSBlbXB0eVxuICAgICAgICBpZihvcHRpb25zLnVybCA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUaGUgdXJsIHRvIG9wZW4gaGF2ZSB0byBiZSBwYXNzZWQgaW4uJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRlbXAgPSB7fTtcbiAgICAgICAgdmFyIHRpdGxlID0gb3B0aW9ucy50aXRsZSB8fCAnc2hhcmVLaXRcXCdzIHdpbmRvdyc7XG4gICAgICAgIHZhciB1cmwgPSBvcHRpb25zLnVybDtcbiAgICAgICAgdmFyIHdpbmRvd0NvbmY9Jyc7XG4gICAgICAgIGZvcih2YXIga2V5IGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHRlbXBba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkZWxldGUgdGVtcC50aXRsZTtcbiAgICAgICAgZGVsZXRlIHRlbXAudXJsO1xuICAgICAgICBpZih0ZW1wLnZpYSAhPSBudWxsKSB7XG4gICAgICAgICAgICBkZWxldGUgdGVtcC52aWE7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGVtcC50ZXh0ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0ZW1wLnRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGVtcC5jb3VudFVybCAhPSBudWxsKXtcbiAgICAgICAgICAgIGRlbGV0ZSB0ZW1wLmNvdW50VXJsO1xuICAgICAgICB9XG4gICAgICAgIGZvcihrZXkgaW4gdGVtcCkge1xuICAgICAgICAgICAgd2luZG93Q29uZiArPSAoa2V5Kyc9Jyt0ZW1wW2tleV0rJywnKTtcbiAgICAgICAgfVxuICAgICAgICB3aW5kb3dDb25mID0gd2luZG93Q29uZi5zbGljZSgwLC0xKTtcbiAgICAgICAgd2luZG93Lm9wZW4odXJsLCB0aXRsZSwgd2luZG93Q29uZik7XG4gICAgfTtcblxuICAgIC8vIHF6b25lIHNoYXJlIGhhbmRsZXJcbiAgICBTSy5wcm90b3R5cGUucXpvbmVGdW5jID0gZnVuY3Rpb24oc2VsZil7XG4gICAgICAgIHZhciBjb25mID0gc2VsZi5nZXRPcHRpb24oKTtcbiAgICAgICAgdmFyIHAgPSB7XG4gICAgICAgICAgICB1cmw6IGNvbmYubGluayxcbiAgICAgICAgICAgIHNob3djb3VudDonMScsLyrmmK/lkKbmmL7npLrliIbkuqvmgLvmlbAs5pi+56S677yaJzEn77yM5LiN5pi+56S677yaJzAnICovXG4gICAgICAgICAgICBkZXNjOiAnJywvKum7mOiupOWIhuS6q+eQhueUsSjlj6/pgIkpKi9cbiAgICAgICAgICAgIHN1bW1hcnk6IGNvbmYuZGVzYywvKuWIhuS6q+aRmOimgSjlj6/pgIkpKi9cbiAgICAgICAgICAgIHRpdGxlOiBjb25mLnRpdGxlLC8q5YiG5Lqr5qCH6aKYKOWPr+mAiSkqL1xuICAgICAgICAgICAgc2l0ZTonJywvKuWIhuS6q+adpea6kCDlpoLvvJrohb7orq/nvZEo5Y+v6YCJKSovXG4gICAgICAgICAgICBwaWNzOicnLCAvKuWIhuS6q+WbvueJh+eahOi3r+W+hCjlj6/pgIkpKi9cbiAgICAgICAgICAgIHN0eWxlOicyMDMnLFxuICAgICAgICAgICAgd2lkdGg6OTgsXG4gICAgICAgICAgICBoZWlnaHQ6MjJcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGxpbms7XG4gICAgICAgIGxpbmsgPSBzZWxmLnVybENvbmNhdChwLCAnaHR0cDovL3Nucy5xem9uZS5xcS5jb20vY2dpLWJpbi9xenNoYXJlL2NnaV9xenNoYXJlX29uZWtleScpO1xuICAgICAgICBzZWxmLm9wZW5XaW4oe1xuICAgICAgICAgICAgdXJsOiBsaW5rLFxuICAgICAgICAgICAgdGl0bGU6ICdTaGFyaW5nIHRvIFF6b25lJyxcbiAgICAgICAgICAgIHRvb2xiYXI6ICdubycsXG4gICAgICAgICAgICByZXNpemFibGU6ICdubycsXG4gICAgICAgICAgICBzdGF0dXM6ICdubycsXG4gICAgICAgICAgICBtZW51YmFyOiAnbm8nLFxuICAgICAgICAgICAgc2Nyb2xsYmFyczogJ25vJyxcbiAgICAgICAgICAgIGhlaWdodDogNjUwLFxuICAgICAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgICAgIGxlZnQ6IDIwMCxcbiAgICAgICAgICAgIHRvcDogNTBcbiAgICAgICAgfSk7XG4gICAgfTtcblxuLy8gICAgd2VpYm8gc2hhcmUgaGFuZGxlclxuICAgIFNLLnByb3RvdHlwZS53ZWlib0Z1bmMgPSBmdW5jdGlvbihzZWxmKXtcbiAgICAgICAgdmFyIGNvbmYgPSBzZWxmLmdldE9wdGlvbigpO1xuICAgICAgICB2YXIgZGVmYXVsdFRleHQgPSBjb25mLnRpdGxlKyctLScrY29uZi5kZXNjKyc6ICcrY29uZi5saW5rO1xuICAgICAgICAvLyAgICBpbml0IHdlaWJvIGVsZW1lbnQncyBpZFxuICAgICAgICBzZWxmLndiRWxlLmlkID0gJ3diX3B1Ymxpc2gnO1xuICAgICAgICBXQjIuYW55V2hlcmUoZnVuY3Rpb24oVyl7XG4gICAgICAgICAgICBXLndpZGdldC5wdWJsaXNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246J3B1Ymxpc2gnLFxuICAgICAgICAgICAgICAgIHR5cGU6J3dlYicsXG4gICAgICAgICAgICAgICAgcmVmZXI6J3knLFxuICAgICAgICAgICAgICAgIGxhbmd1YWdlOid6aF9jbicsXG4gICAgICAgICAgICAgICAgYnV0dG9uX3R5cGU6J3JlZCcsXG4gICAgICAgICAgICAgICAgYnV0dG9uX3NpemU6J21pZGRsZScsXG4gICAgICAgICAgICAgICAgYXBwa2V5OiczMTI1MjY1NzQ4JyxcbiAgICAgICAgICAgICAgICBpZDogJ3diX3B1Ymxpc2gnLFxuICAgICAgICAgICAgICAgIHVpZDogJzE2MjQxMTg3MTcnLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRfdGV4dDogZGVmYXVsdFRleHRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4vLyAgICB0d2l0dGVyIHNoYXJlIGhhbmRsZXJcbiAgICBTSy5wcm90b3R5cGUudHdpdHRlckZ1bmMgPSBmdW5jdGlvbihzZWxmKXtcbiAgICAgICAgdmFyIGNvbmYgPSBzZWxmLmdldE9wdGlvbigpO1xuICAgICAgICB2YXIgc2hhcmVVcmwgPSAnaHR0cHM6Ly90d2l0dGVyLmNvbS9zaGFyZSc7XG4gICAgICAgIHZhciBzaGFyZU9iaiA9IHtcbiAgICAgICAgICAgIHVybDogY29uZi5saW5rLFxuICAgICAgICAgICAgdGV4dDogY29uZi50aXRsZSArJyAtICcrY29uZi5kZXNjLFxuICAgICAgICAgICAgY291bnRVcmw6IGNvbmYubGluayxcbiAgICAgICAgICAgIHZpYTogY29uZi50d2l0dGVyTmFtZSB8fCAnJ1xuICAgICAgICB9O1xuICAgICAgICBzaGFyZVVybCA9IHNlbGYudXJsQ29uY2F0KHNoYXJlT2JqLCBzaGFyZVVybCk7XG4gICAgICAgIGNvbmYudGl0bGUgPSAnU2hhcmluZyB0byBUd2l0dGVyJztcbiAgICAgICAgc2VsZi5vcGVuV2luKHtcbiAgICAgICAgICAgIHVybDogc2hhcmVVcmwsXG4gICAgICAgICAgICB0aXRsZTogY29uZi50aXRsZSxcbiAgICAgICAgICAgIHRvb2xiYXI6ICdubycsXG4gICAgICAgICAgICByZXNpemFibGU6ICdubycsXG4gICAgICAgICAgICBtZW51YmFyOiAnbm8nLFxuICAgICAgICAgICAgc2Nyb2xsYmFyczogJ25vJyxcbiAgICAgICAgICAgIGhlaWdodDogNjUwLFxuICAgICAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgICAgIGxlZnQ6IDIwMCxcbiAgICAgICAgICAgIHRvcDogNTBcbiAgICAgICAgfSk7XG4gICAgfTtcblxuLy8gICAgd2VjaGF0IHNoYXJlIEhhbmRsZXJcbiAgICBTSy5wcm90b3R5cGUud2VjaGF0RnVuYyA9IGZ1bmN0aW9uKHNlbGYpe1xuICAgICAgICB2YXIgY29uZiA9IHNlbGYuYmFzZUNvbmY7XG4gICAgICAgIHZhciBxcmNvZGU7XG4gICAgICAgIHZhciB3Y0NhbnZhcztcbiAgICAgICAgdmFyIHNoYXJlUmVhZHk7XG4gICAgICAgIHZhciB3eE9iajtcbiAgICAgICAgaWYoc2VsZi5kZXZpY2UgPT09ICdwaG9uZScpIHtcbiAgICAgICAgICAgIHd4T2JqID0ge307XG4gICAgICAgICAgICB3eE9iai50aXRsZSA9IGNvbmYudGl0bGU7XG4gICAgICAgICAgICB3eE9iai5saW5rID0gY29uZi5saW5rO1xuICAgICAgICAgICAgd3hPYmouZGVzYyA9IGNvbmYuZGVzYztcbiAgICAgICAgICAgIHd4T2JqLmltZ191cmwgPSBjb25mLnBvcnRyYWl0O1xuICAgICAgICAgICAgc2hhcmVSZWFkeSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgV2VpeGluSlNCcmlkZ2Uub24oJ21lbnU6c2hhcmU6YXBwbWVzc2FnZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIFdlaXhpbkpTQnJpZGdlLmludm9rZSgnc2VuZEFwcE1lc3NhZ2UnLCB3eE9iaixmdW5jdGlvbigpe30pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgV2VpeGluSlNCcmlkZ2Uub24oJ21lbnU6c2hhcmU6dGltZWxpbmUnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBXZWl4aW5KU0JyaWRnZS5pbnZva2UoJ3NoYXJlVGltZWxpbmUnLCB3eE9iaiwgZnVuY3Rpb24oKXt9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZih0eXBlb2YgV2VpeGluSlNCcmlkZ2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignV2VpeGluSlNCcmlkZ2VSZWFkeScsIHNoYXJlUmVhZHkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzaGFyZVJlYWR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZihzZWxmLmRldmljZSA9PT0gJ3BjJykge1xuICAgICAgICAgICAgd2NDYW52YXMgPSBzZWxmLndyYXBFbGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtJytjb25mLnByZWZpeCsnLXdlY2hhdC1RUkNvZGUnKVswXTtcbiAgICAgICAgICAgIHFyY29kZSA9IG5ldyBRUkNvZGUuUVJDb2RlRHJhdygpO1xuICAgICAgICAgICAgcXJjb2RlLmRyYXcod2NDYW52YXMsIGxvY2F0aW9uLmhyZWYsIGZ1bmN0aW9uKGVycm9yLCBjYW52YXMpe30pO1xuICAgICAgICB9XG4gICAgfTtcblxuLy8gICAgbWFrZSB0aGUgYmFzZSBkYXRhXG4gICAgU0sucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICB2YXIgYmFzZUNvbmYgPSB7fTtcbiAgICAgICAgaWYob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gYmFzZUNvbmY7XG4gICAgICAgIH1cbiAgICAgICAgaWYob3B0aW9ucy50aXRsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBiYXNlQ29uZi50aXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmFzZUNvbmYudGl0bGUgPSBvcHRpb25zLnRpdGxlO1xuICAgICAgICB9XG4gICAgICAgIGlmKG9wdGlvbnMubGluayA9PSBudWxsKSB7XG4gICAgICAgICAgICBiYXNlQ29uZi5saW5rID0gbG9jYXRpb24uaHJlZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2VDb25mLmxpbmsgPSBvcHRpb25zLmxpbms7XG4gICAgICAgIH1cbiAgICAgICAgaWYob3B0aW9ucy5kZXNjID09IG51bGwpIHtcbiAgICAgICAgICAgIGJhc2VDb25mLmRlc2MgPSB0aGlzLmZpbmREZXNjKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlQ29uZi5kZXNjID0gb3B0aW9ucy5kZXNjO1xuICAgICAgICB9XG4gICAgICAgIGlmKG9wdGlvbnMudHdpdHRlck5hbWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgYmFzZUNvbmYudHdpdHRlck5hbWUgPSBvcHRpb25zLnR3aXR0ZXJOYW1lO1xuICAgICAgICB9XG4gICAgICAgIGlmKG9wdGlvbnMucHJlZml4ID09IG51bGwpIHtcbiAgICAgICAgICAgIGJhc2VDb25mLnByZWZpeCA9ICdzaGFyZUtpdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlQ29uZi5wcmVmaXggPSBvcHRpb25zLnByZWZpeDtcbiAgICAgICAgfVxuICAgICAgICBpZihvcHRpb25zLnBvcnRyYWl0ID09IG51bGwpIHtcbiAgICAgICAgICAgIG9wdGlvbnMucG9ydHJhaXQgPSAnaHR0cDovL3VzdWFsaW1hZ2VzLnFpbml1ZG4uY29tLzEuanBlZyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlQ29uZi5wb3J0cmFpdCA9IG9wdGlvbnMucG9ydHJhaXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2VDb25mO1xuICAgIH07XG5cbiAgICAvLyByZXR1cm4gYSBjb3B5IG9mIG9wdGlvbiBvYmplY3RcbiAgICBTSy5wcm90b3R5cGUuZ2V0T3B0aW9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHJlID0ge307XG4gICAgICAgIGZvcih2YXIga2V5IGluIHRoaXMuYmFzZUNvbmYpIHtcbiAgICAgICAgICAgIHJlW2tleV0gPSB0aGlzLmJhc2VDb25mW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlO1xuICAgIH07XG5cbiAgICAvLyBkZXRlY3QgZGV2aWNlIHR5cGVcbiAgICBTSy5wcm90b3R5cGUuZGV0ZWN0RGV2aWNlID0gZnVuY3Rpb24odWEpe1xuICAgICAgICBpZih1YS5tYXRjaCgvaXBob25lfGlwYWR8YW5kcm9pZC9naSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuICdwaG9uZSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJ3BjJztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTSy5wcm90b3R5cGUuZmluZERlc2MgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbWV0YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWV0YScpO1xuICAgICAgICB2YXIgbWV0YTtcbiAgICAgICAgZm9yKHZhciBpPTA7IGk8IG1ldGFzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBtZXRhID0gbWV0YXNbaV07XG4gICAgICAgICAgICBpZihtZXRhLmdldEF0dHJpYnV0ZSgnbmFtZScpID09PSAnZGVzY3JpcHRpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ldGEuZ2V0QXR0cmlidXRlKCdjb250ZW50Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbi8vICAgIGNvbmNhdCB1cmwgYW5kIHF1ZXJ5IGRhdGFcbiAgICBTSy5wcm90b3R5cGUudXJsQ29uY2F0ID0gZnVuY3Rpb24obywgdXJsKXtcbiAgICAgICAgdmFyIHMgPSBbXTtcbiAgICAgICAgZm9yKHZhciBpIGluIG8pe1xuICAgICAgICAgICAgcy5wdXNoKGkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob1tpXXx8JycpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXJsICsgJz8nICsgcy5qb2luKCcmJyk7XG4gICAgfTtcblxuLy8gICAgZm9yIHRlc3RcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNLO1xufSkoKTsiLCIvKipcbnRoaXMgY29udGFpbnMgdGhlIG1heCBzdHJpbmcgbGVuZ3RoIGZvciBhbGwgcXIgY29kZSBWZXJzaW9ucyBpbiBCaW5hcnkgU2FmZSAvIEJ5dGUgTW9kZVxuZWFjaCBlbnRyeSBpcyBpbiB0aGUgb3JkZXIgb2YgZXJyb3IgY29ycmVjdCBsZXZlbFxuXHRbTCxNLFEsSF1cblxudGhlIHFyY29kZSBsaWIgc2V0cyBzdHJhbmdlIHZhbHVlcyBmb3IgUVJFcnJvckNvcnJlY3RMZXZlbCBoYXZpbmcgdG8gZG8gd2l0aCBtYXNraW5nIGFnYWluc3QgcGF0dGVybnNcbnRoZSBtYXhpbXVtIHN0cmluZyBsZW5ndGggZm9yIGVycm9yIGNvcnJlY3QgbGV2ZWwgSCBpcyAxMjczIGNoYXJhY3RlcnMgbG9uZy5cbiovXG5cbmV4cG9ydHMuUVJDYXBhY2l0eVRhYmxlID0gW1xuWzE3LDE0LDExLDddXG4sWzMyLDI2LDIwLDE0XVxuLFs1Myw0MiwzMiwyNF1cbixbNzgsNjIsNDYsMzRdXG4sWzEwNiw4NCw2MCw0NF1cbixbMTM0LDEwNiw3NCw1OF1cbixbMTU0LDEyMiw4Niw2NF1cbixbMTkyLDE1MiwxMDgsODRdXG4sWzIzMCwxODAsMTMwLDk4XVxuLFsyNzEsMjEzLDE1MSwxMTldXG4sWzMyMSwyNTEsMTc3LDEzN10vLzExXG4sWzM2NywyODcsMjAzLDE1NV1cbixbNDI1LDMzMSwyNDEsMTc3XVxuLFs0NTgsMzYyLDI1OCwxOTRdXG4sWzUyMCw0MTIsMjkyLDIyMF1cbixbNTg2LDQ1MCwzMjIsMjUwXVxuLFs2NDQsNTA0LDM2NCwyODBdXG4sWzcxOCw1NjAsMzk0LDMxMF1cbixbNzkyLDYyNCw0NDIsMzM4XVxuLFs4NTgsNjY2LDQ4MiwzODJdXG4sWzkyOSw3MTEsNTA5LDQwM11cbixbMTAwMyw3NzksNTY1LDQzOV1cbixbMTA5MSw4NTcsNjExLDQ2MV1cbixbMTE3MSw5MTEsNjYxLDUxMV0vLzI0XG4sWzEyNzMsOTk3LDcxNSw1MzVdXG4sWzEzNjcsMTA1OSw3NTEsNTkzXVxuLFsxNDY1LDExMjUsODA1LDYyNV1cbixbMTUyOCwxMTkwLDg2OCw2NThdLy8yOFxuLFsxNjI4LDEyNjQsOTA4LDY5OF1cbixbMTczMiwxMzcwLDk4Miw3NDJdXG4sWzE4NDAsMTQ1MiwxMDMwLDc5MF1cbixbMTk1MiwxNTM4LDExMTIsODQyXS8vMzJcbixbMjA2OCwxNjI4LDExNjgsODk4XVxuLFsyMTg4LDE3MjIsMTIyOCw5NThdXG4sWzIzMDMsMTgwOSwxMjgzLDk4M11cbixbMjQzMSwxOTExLDEzNTEsMTA1MV0vLzM2XG4sWzI1NjMsMTk4OSwxNDIzLDEwOTNdXG4sWzI2OTksMjA5OSwxNDk5LDExMzldXG4sWzI4MDksMjIxMywxNTc5LDEyMTldXG4sWzI5NTMsMjMzMSwxNjYzLDEyNzNdLy80MFxuXTtcbiIsIi8qXG4qIGNvcHlyaWdodCAyMDEwLTIwMTIgUnlhbiBEYXlcbiogaHR0cDovL2dpdGh1Yi5jb20vc29sZGFpci9ub2RlLXFyY29kZVxuKlxuKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4qICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbipcbiogY2FudmFzIGV4YW1wbGUgYW5kIGZhbGxiYWNrIHN1cHBvcnQgZXhhbXBsZSBwcm92aWRlZCBieSBKb3NodWEgS29vXG4qXHRodHRwOi8vamFidHVuZXMuY29tL2xhYnMvcXJjb2RlLmh0bWxcbipcdFwiSW5zdGFudCBRUkNvZGUgTWFzaHVwIGJ5IEpvc2h1YSBLb28hXCJcbipcdGFzIGZhciBhcyBpIGNhbiB0ZWxsIHRoZSBwYWdlIGFuZCB0aGUgY29kZSBvbiB0aGUgcGFnZSBhcmUgcHVibGljIGRvbWFpbiBcbipcdFxuKiBvcmlnaW5hbCB0YWJsZSBleGFtcGxlIGFuZCBsaWJyYXJ5IHByb3ZpZGVkIGJ5IEthenVoaWtvIEFyYXNlXG4qXHRodHRwOi8vZC1wcm9qZWN0Lmdvb2dsZWNvZGUuY29tL3N2bi90cnVuay9taXNjL3FyY29kZS9qcy9cbipcbiovXG5cbnZhciBib3BzID0gcmVxdWlyZSgnYm9wcycpXG52YXIgUVJDb2RlTGliID0gcmVxdWlyZSgnLi9xcmNvZGUuanMnKTtcbnZhciBRUlZlcnNpb25DYXBhY2l0eVRhYmxlID0gcmVxdWlyZSgnLi9xcmNhcGFjaXR5dGFibGUuanMnKS5RUkNhcGFjaXR5VGFibGU7XG52YXIgUVJDb2RlID0gUVJDb2RlTGliLlFSQ29kZTtcblxuZXhwb3J0cy5RUkNvZGVEcmF3ID0gUVJDb2RlRHJhdztcbmV4cG9ydHMuUVJWZXJzaW9uQ2FwYWNpdHlUYWJsZSA9IFFSVmVyc2lvbkNhcGFjaXR5VGFibGU7XG5leHBvcnRzLlFSRXJyb3JDb3JyZWN0TGV2ZWwgPSBRUkNvZGVMaWIuUVJFcnJvckNvcnJlY3RMZXZlbDtcbmV4cG9ydHMuUVJDb2RlID0gUVJDb2RlTGliLlFSQ29kZTtcblxuZnVuY3Rpb24gUVJDb2RlRHJhdygpe31cblxuUVJDb2RlRHJhdy5wcm90b3R5cGUgPSB7XG4gIHNjYWxlOjQsLy80IHB4IG1vZHVsZSBzaXplXG4gIGRlZmF1bHRNYXJnaW46MjAsXG4gIG1hcmdpblNjYWxlRmFjdG9yOjUsXG4gIEFycmF5Oih0eXBlb2YgVWludDMyQXJyYXkgPT0gJ3VuZGVmaW5lZCc/VWludDMyQXJyYXk6QXJyYXkpLFxuICAvLyB5b3UgbWF5IGNvbmZpZ3VyZSB0aGUgZXJyb3IgYmVoYXZpb3IgZm9yIGlucHV0IHN0cmluZyB0b28gbG9uZ1xuICBlcnJvckJlaGF2aW9yOntcbiAgICBsZW5ndGg6J3RyaW0nXG4gIH0sXG4gIGNvbG9yOntcbiAgICBkYXJrOidibGFjaycsXG4gICAgbGlnaHQ6J3doaXRlJ1xuICB9LFxuICBkZWZhdWx0RXJyb3JDb3JyZWN0TGV2ZWw6UVJDb2RlTGliLlFSRXJyb3JDb3JyZWN0TGV2ZWwuSCxcbiAgUVJFcnJvckNvcnJlY3RMZXZlbDpRUkNvZGVMaWIuUVJFcnJvckNvcnJlY3RMZXZlbCxcbiAgZHJhdzpmdW5jdGlvbihjYW52YXMsdGV4dCxvcHRpb25zLGNiKXtcblxuICAgIHZhciBsZXZlbCxcbiAgICBlcnJvcixcbiAgICBlcnJvckNvcnJlY3RMZXZlbDtcbiAgICBcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgY2IgPSBhcmdzLnBvcCgpOyBcbiAgICBjYW52YXMgPSBhcmdzLnNoaWZ0KCk7XG4gICAgdGV4dCA9IGFyZ3Muc2hpZnQoKTtcbiAgICBvcHRpb25zID0gYXJncy5zaGlmdCgpfHx7fTtcblxuICAgIFxuICAgIGlmKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAvL2VuZm9yY2UgY2FsbGJhY2sgYXBpIGp1c3QgaW4gY2FzZSB0aGUgcHJvY2Vzc2luZyBjYW4gYmUgbWFkZSBhc3luYyBpbiB0aGUgZnV0dXJlXG4gICAgICAvLyBvciBzdXBwb3J0IHByb2Mgb3BlbiB0byBsaWJxcmVuY29kZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjYWxsYmFjayByZXF1aXJlZCcpO1xuICAgIH1cbiAgICBcbiAgICBpZih0eXBlb2Ygb3B0aW9ucyAhPT0gXCJvYmplY3RcIil7XG4gICAgICBvcHRpb25zLmVycm9yQ29ycmVjdExldmVsID0gb3B0aW9ucztcbiAgICB9XG4gICAgXG5cbiAgICB0aGlzLlFSVmVyc2lvbihcbiAgICAgIHRleHRcbiAgICAgICxvcHRpb25zLmVycm9yQ29ycmVjdExldmVsfHx0aGlzLlFSRXJyb3JDb3JyZWN0TGV2ZWwuSFxuICAgICAgLG9wdGlvbnMudmVyc2lvblxuICAgICxmdW5jdGlvbihlLHQsbCxlYyl7XG5cbiAgICAgIHRleHQgPSB0LGxldmVsID0gbCxlcnJvciA9IGUsZXJyb3JDb3JyZWN0TGV2ZWwgPSBlYztcbiAgICB9KTtcblxuICAgIHRoaXMuc2NhbGUgPSBvcHRpb25zLnNjYWxlfHx0aGlzLnNjYWxlO1xuICAgIHRoaXMubWFyZ2luID0gdHlwZW9mKG9wdGlvbnMubWFyZ2luKSA9PT0gJ3VuZGVmaW5lZCcgPyB0aGlzLmRlZmF1bHRNYXJnaW4gOiBvcHRpb25zLm1hcmdpbjtcbiAgICBcbiAgICBpZighbGV2ZWwpIHtcbiAgICAgIC8vaWYgd2UgYXJlIHVuYWJsZSB0byBmaW5kIGFuIGFwcHJvcHJpYXRlIHFyIGxldmVsIGVycm9yIG91dFxuICAgICAgY2IoZXJyb3IsY2FudmFzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvL2NyZWF0ZSBxcmNvZGUhXG4gICAgdHJ5e1xuICAgICAgXG4gICAgICB2YXIgcXIgPSBuZXcgUVJDb2RlTGliLlFSQ29kZShsZXZlbCwgZXJyb3JDb3JyZWN0TGV2ZWwpXG4gICAgICAsIHNjYWxlID0gdGhpcy5zY2FsZXx8NFxuICAgICAgLCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgLCB3aWR0aCA9IDA7XG5cbiAgICAgIHFyLmFkZERhdGEodGV4dCk7XG4gICAgICBxci5tYWtlKCk7XG5cbiAgICAgIHZhciBtYXJnaW4gPSB0aGlzLm1hcmdpbldpZHRoKCk7XG4gICAgICB2YXIgY3VycmVudHkgPSBtYXJnaW47XG4gICAgICB3aWR0aCA9IHRoaXMuZGF0YVdpZHRoKHFyKSsgbWFyZ2luKjI7XG4gICAgICBcbiAgICAgIHRoaXMucmVzZXRDYW52YXMoY2FudmFzLGN0eCx3aWR0aCk7XG5cbiAgICAgIGZvciAodmFyIHIgPSAwLHJsPXFyLmdldE1vZHVsZUNvdW50KCk7IHIgPCBybDsgcisrKSB7XG4gICAgICAgIHZhciBjdXJyZW50eCA9IG1hcmdpbjtcbiAgICAgICAgZm9yICh2YXIgYyA9IDAsY2w9cXIuZ2V0TW9kdWxlQ291bnQoKTsgYyA8IGNsOyBjKyspIHtcbiAgICAgICAgICBpZiAocXIuaXNEYXJrKHIsIGMpICkge1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3IuZGFyaztcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCAoY3VycmVudHgsIGN1cnJlbnR5LCBzY2FsZSwgc2NhbGUpO1xuICAgICAgICAgIH0gZWxzZSBpZih0aGlzLmNvbG9yLmxpZ2h0KXtcbiAgICAgICAgICAgIC8vaWYgZmFsc3kgY29uZmlndXJlZCBjb2xvclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3IubGlnaHQ7XG4gICAgICAgICAgICBjdHguZmlsbFJlY3QgKGN1cnJlbnR4LCBjdXJyZW50eSwgc2NhbGUsIHNjYWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3VycmVudHggKz0gc2NhbGU7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudHkgKz0gc2NhbGU7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZXJyb3IgPSBlO1xuICAgIH1cbiAgICBcbiAgICBjYihlcnJvcixjYW52YXMsd2lkdGgpOyAgICBcbiAgfSxcbiAgZHJhd0JpdEFycmF5OmZ1bmN0aW9uKHRleHQvKixlcnJvckNvcnJlY3RMZXZlbCxvcHRpb25zLGNiKi8pIHtcblxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgIGNiID0gYXJncy5wb3AoKSxcbiAgICAgIHRleHQgPSBhcmdzLnNoaWZ0KCksXG4gICAgICBlcnJvckNvcnJlY3RMZXZlbCA9IGFyZ3Muc2hpZnQoKSxcbiAgICAgIG9wdGlvbnMgPSBhcmdzLnNoaWZ0KCkgfHwge307XG5cbiAgICAvL2FyZ3VtZW50IHByb2Nlc3NpbmdcbiAgICBpZih0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy9lbmZvcmNlIGNhbGxiYWNrIGFwaSBqdXN0IGluIGNhc2UgdGhlIHByb2Nlc3NpbmcgY2FuIGJlIG1hZGUgYXN5bmMgaW4gdGhlIGZ1dHVyZVxuICAgICAgLy8gb3Igc3VwcG9ydCBwcm9jIG9wZW4gdG8gbGlicXJlbmNvZGVcbiAgICAgIHRocm93IG5ldyBFcnJvcignY2FsbGJhY2sgcmVxdWlyZWQgYXMgbGFzdCBhcmd1bWVudCcpO1xuICAgIH1cbiAgICBcbiAgICBjYiA9IGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoLTFdOyBcbiAgICBcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoID4gMil7XG4gICAgICBlcnJvckNvcnJlY3RMZXZlbCA9IGFyZ3VtZW50c1syXTtcbiAgICB9XG5cblxuICAgIC8vdGhpcyBpbnRlcmZhY2Uga2luZGEgc3Vja3MgLSB0aGVyZSBpcyB2ZXJ5IHNtYWxsIGxpa2VseWhvb2Qgb2YgdGhpcyBldmVyIGJlaW5nIGFzeW5jXG4gICAgdGhpcy5RUlZlcnNpb24odGV4dCxlcnJvckNvcnJlY3RMZXZlbCwob3B0aW9uc3x8e30pLnZlcnNpb24sZnVuY3Rpb24oZSx0LGwsZWMpe1xuICAgICAgdGV4dCA9IHQsbGV2ZWwgPSBsLGVycm9yID0gZSxlcnJvckNvcnJlY3RMZXZlbCA9IGVjO1xuICAgIH0pO1xuXG5cbiAgICBpZighbGV2ZWwpIHtcbiAgICAgIC8vaWYgd2UgYXJlIHVuYWJsZSB0byBmaW5kIGFuIGFwcHJvcHJpYXRlIHFyIGxldmVsIGVycm9yIG91dFxuICAgICAgY2IoZXJyb3IsW10sMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy9jcmVhdGUgcXJjb2RlIVxuICAgIHRyeXtcblxuICAgICAgdmFyIHFyID0gbmV3IFFSQ29kZUxpYi5RUkNvZGUobGV2ZWwsIGVycm9yQ29ycmVjdExldmVsKVxuICAgICAgLCBzY2FsZSA9IHRoaXMuc2NhbGV8fDRcbiAgICAgICwgd2lkdGggPSAwLGJpdHMsYml0Yz0wLGN1cnJlbnR5PTA7XG4gICAgICBcbiAgICAgIHFyLmFkZERhdGEodGV4dCk7XG4gICAgICBxci5tYWtlKCk7XG4gICAgICBcbiAgICAgIHdpZHRoID0gdGhpcy5kYXRhV2lkdGgocXIsMSk7XG4gICAgICBiaXRzID0gbmV3IHRoaXMuQXJyYXkod2lkdGgqd2lkdGgpO1xuXG4gICAgICBcbiAgICAgIGZvciAodmFyIHIgPSAwLHJsPXFyLmdldE1vZHVsZUNvdW50KCk7IHIgPCBybDsgcisrKSB7XG4gICAgICAgIGZvciAodmFyIGMgPSAwLGNsPXFyLmdldE1vZHVsZUNvdW50KCk7IGMgPCBjbDsgYysrKSB7XG4gICAgICAgICAgaWYgKHFyLmlzRGFyayhyLCBjKSApIHtcbiAgICAgICAgICAgIGJpdHNbYml0Y10gPSAxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiaXRzW2JpdGNdID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYml0YysrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZXJyb3IgPSBlO1xuICAgICAgY29uc29sZS5sb2coZS5zdGFjayk7XG4gICAgfVxuICAgIFxuICAgIGNiKGVycm9yLGJpdHMsd2lkdGgpO1xuICB9LFxuICBRUlZlcnNpb246ZnVuY3Rpb24odGV4dCxlcnJvckNvcnJlY3RMZXZlbCx2ZXJzaW9uLGNiKXtcbiAgICB2YXIgYyA9IGJvcHMuZnJvbSh0ZXh0KS5sZW5ndGgsLy8gQklOQVJZIExFTkdUSCFcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGVycm9yQ29ycmVjdExldmVsID0gdGhpcy5RUkVycm9yQ29ycmVjdExldmVsW2Vycm9yQ29ycmVjdExldmVsXXx8dGhpcy5kZWZhdWx0RXJyb3JDb3JyZWN0TGV2ZWwsXG4gICAgICAgIGVycm9yQ29ycmVjdEluZGV4ID0gWzEsMCwzLDJdLC8vZml4IG9kZCBtYXBwaW5nIHRvIG9yZGVyIGluIHRhYmxlXG4gICAgICAgIGtleXMgPSBbJ0wnLCdNJywnUScsJ0gnXSxcbiAgICAgICAgY2FwYWNpdHkgPSAwLFxuICAgICAgICB2ZXJzaW9uU3BlY2lmaWVkID0gZmFsc2U7XG4gICAgICAgIFxuICAgIGlmKHR5cGVvZiB2ZXJzaW9uICE9PSBcInVuZGVmaW5lZFwiICYmIHZlcnNpb24gIT09IG51bGwpIHtcbiAgICAgIHZlcnNpb25TcGVjaWZpZWQgPSB0cnVlO1xuICAgIH1cbiAgICAvL1RPRE8gQUREIFRIUk9XIEZPUiBJTlZBTElEIGVycm9yQ29ycmVjdExldmVsLi4uP1xuICAgIFxuICAgIGlmKHZlcnNpb25TcGVjaWZpZWQpe1xuICAgICAgLy9jb25zb2xlLmxvZygnU1BFQ0lGSUVEIFZFUlNJT04hICcsdmVyc2lvbik7XG4gICAgICAvL2kgaGF2ZSBzcGVjaWZpZWQgYSB2ZXJzaW9uLiB0aGlzIHdpbGwgZ2l2ZSBtZSBhIGZpeGVkIHNpemUgcXIgY29kZS4gdmVyc2lvbiBtdXN0IGJlIHZhbGlkLiAxLTQwXG4gICAgICBjYXBhY2l0eSA9IFFSVmVyc2lvbkNhcGFjaXR5VGFibGVbdmVyc2lvbl1bZXJyb3JDb3JyZWN0SW5kZXhbZXJyb3JDb3JyZWN0TGV2ZWxdXTtcbiAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgICAvL2ZpZ3VyZSBvdXQgd2hhdCB2ZXJzaW9uIGNhbiBob2xkIHRoZSBhbW91bnQgb2YgdGV4dFxuICAgICAgZm9yKHZhciBpPTAsaj1RUlZlcnNpb25DYXBhY2l0eVRhYmxlLmxlbmd0aDtpPGo7aSsrKSB7XG4gICAgICAgIGNhcGFjaXR5ID0gUVJWZXJzaW9uQ2FwYWNpdHlUYWJsZVtpXVtlcnJvckNvcnJlY3RJbmRleFtlcnJvckNvcnJlY3RMZXZlbF1dO1xuICAgICAgICBpZihjIDwgUVJWZXJzaW9uQ2FwYWNpdHlUYWJsZVtpXVtlcnJvckNvcnJlY3RJbmRleFtlcnJvckNvcnJlY3RMZXZlbF1dKXtcbiAgICAgICAgICB2ZXJzaW9uID0gaSsxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL2lmIG5vdCB2ZXJzaW9uIHNldCB0byBtYXhcbiAgICAgIGlmKCF2ZXJzaW9uKSB7XG4gICAgICAgIHZlcnNpb24gPSBRUlZlcnNpb25DYXBhY2l0eVRhYmxlLmxlbmd0aC0xO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZihjYXBhY2l0eSA8IGMpe1xuICAgICAgaWYodGhpcy5lcnJvckJlaGF2aW9yLmxlbmd0aCA9PSAndHJpbScpe1xuICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHIoMCxjYXBhY2l0eSk7XG4gICAgICAgIGxldmVsID0gUVJWZXJzaW9uQ2FwYWNpdHlUYWJsZS5sZW5ndGg7IFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoJ2lucHV0IHN0cmluZyB0b28gbG9uZyBmb3IgZXJyb3IgY29ycmVjdGlvbiAnXG4gICAgICAgICAgK2tleXNbZXJyb3JDb3JyZWN0SW5kZXhbZXJyb3JDb3JyZWN0TGV2ZWxdXVxuICAgICAgICAgICsnIG1heCBsZW5ndGggJ1xuICAgICAgICAgICsgY2FwYWNpdHlcbiAgICAgICAgICArJyBmb3IgcXJjb2RlIHZlcnNpb24gJyt2ZXJzaW9uXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICBcbiAgICBpZihjYikge1xuICAgICAgY2IoZXJyb3IsdGV4dCx2ZXJzaW9uLGVycm9yQ29ycmVjdExldmVsKTtcbiAgICB9XG4gICAgcmV0dXJuIHZlcnNpb247XG4gIH0sXG4gIG1hcmdpbldpZHRoOmZ1bmN0aW9uKCl7XG4gICAgdmFyIG1hcmdpbiA9IHRoaXMubWFyZ2luO1xuICAgIHRoaXMuc2NhbGUgPSB0aGlzLnNjYWxlfHw0O1xuICAgIC8vZWxlZ2FudCB3aGl0ZSBzcGFjZSBuZXh0IHRvIGNvZGUgaXMgcmVxdWlyZWQgYnkgc3BlY1xuICAgIGlmICgodGhpcy5zY2FsZSAqIHRoaXMubWFyZ2luU2NhbGVGYWN0b3IgPiBtYXJnaW4pICYmIG1hcmdpbiA+IDApe1xuICAgICAgbWFyZ2luID0gdGhpcy5zY2FsZSAqIHRoaXMubWFyZ2luU2NhbGVGYWN0b3I7XG4gICAgfVxuICAgIHJldHVybiBtYXJnaW47XG4gIH0sXG4gIGRhdGFXaWR0aDpmdW5jdGlvbihxcixzY2FsZSl7XG4gICAgcmV0dXJuIHFyLmdldE1vZHVsZUNvdW50KCkqKHNjYWxlfHx0aGlzLnNjYWxlfHw0KTtcbiAgfSxcbiAgcmVzZXRDYW52YXM6ZnVuY3Rpb24oY2FudmFzLGN0eCx3aWR0aCl7XG4gICAgY3R4LmNsZWFyUmVjdCgwLDAsY2FudmFzLndpZHRoLGNhbnZhcy5oZWlnaHQpO1xuICAgIGlmKCFjYW52YXMuc3R5bGUpIGNhbnZhcy5zdHlsZSA9IHt9O1xuICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0ID0gd2lkdGg7Ly9zcXVhcmUhXG4gICAgY2FudmFzLnN0eWxlLndpZHRoID0gY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgXG4gICAgaWYodGhpcy5jb2xvci5saWdodCl7XG4gICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvci5saWdodDsgXG4gICAgICBjdHguZmlsbFJlY3QoMCwwLGNhbnZhcy53aWR0aCxjYW52YXMuaGVpZ2h0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy9zdXBwb3J0IHRyYW5zcGFyZW50IGJhY2tncm91bmRzP1xuICAgICAgLy9ub3QgZXhhY3RseSB0byBzcGVjIGJ1dCBpIHJlYWxseSB3b3VsZCBsaWtlIHNvbWVvbmUgdG8gYmUgYWJsZSB0byBhZGQgYSBiYWNrZ3JvdW5kIHdpdGggaGVhdmlseSByZWR1Y2VkIGx1bWlub3NpdHkgZm9yIHNpbXBsZSBicmFuZGluZ1xuICAgICAgLy9pIGNvdWxkIGp1c3QgZGl0Y2ggdGhpcyBiZWNhdXNlIHlvdSBjb3VsZCBhbHNvIGp1c3Qgc2V0ICMqKioqKiowMCBhcyB0aGUgY29sb3IgPVBcbiAgICAgIGN0eC5jbGVhclJlY3QoMCwwLGNhbnZhcy53aWR0aCxjYW52YXMuaGVpZ2h0KTtcbiAgICB9XG4gIH1cbn07XG5cbiIsInZhciBib3BzID0gcmVxdWlyZSgnYm9wcycpO1xuXG4vKipcbiAqIFFSQ29kZSBmb3IgSmF2YVNjcmlwdFxuICpcbiAqIG1vZGlmaWVkIGJ5IFJ5YW4gRGF5IGZvciBub2RlanMgc3VwcG9ydFxuICogQ29weXJpZ2h0IChjKSAyMDExIFJ5YW4gRGF5XG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIEVYUE9SVFM6XG4gKlx0e1xuICpcdFFSQ29kZTpRUkNvZGVcbiAqXHRRUkVycm9yQ29ycmVjdExldmVsOlFSRXJyb3JDb3JyZWN0TGV2ZWxcbiAqXHR9XG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVJDb2RlIGZvciBKYXZhU2NyaXB0XG4vL1xuLy8gQ29weXJpZ2h0IChjKSAyMDA5IEthenVoaWtvIEFyYXNlXG4vL1xuLy8gVVJMOiBodHRwOi8vd3d3LmQtcHJvamVjdC5jb20vXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuLy8gICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuLy9cbi8vIFRoZSB3b3JkIFwiUVIgQ29kZVwiIGlzIHJlZ2lzdGVyZWQgdHJhZGVtYXJrIG9mIFxuLy8gREVOU08gV0FWRSBJTkNPUlBPUkFURURcbi8vICAgaHR0cDovL3d3dy5kZW5zby13YXZlLmNvbS9xcmNvZGUvZmFxcGF0ZW50LWUuaHRtbFxuLy9cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qL1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVJDb2RlXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnRzLlFSQ29kZSA9IFFSQ29kZTtcblxudmFyIFFSRGF0YUFycmF5ID0gKHR5cGVvZiBVaW50MzJBcnJheSA9PSAndW5kZWZpbmVkJz9VaW50MzJBcnJheTpBcnJheSk7XG5cbmZ1bmN0aW9uIFFSQ29kZSh0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3RMZXZlbCkge1xuXHR0aGlzLnR5cGVOdW1iZXIgPSB0eXBlTnVtYmVyO1xuXHR0aGlzLmVycm9yQ29ycmVjdExldmVsID0gZXJyb3JDb3JyZWN0TGV2ZWw7XG5cdHRoaXMubW9kdWxlcyA9IG51bGw7XG5cdHRoaXMubW9kdWxlQ291bnQgPSAwO1xuXHR0aGlzLmRhdGFDYWNoZSA9IG51bGw7XG5cdHRoaXMuZGF0YUxpc3QgPSBuZXcgUVJEYXRhQXJyYXkoKTtcbn1cblxuUVJDb2RlLnByb3RvdHlwZSA9IHtcblx0XG5cdGFkZERhdGEgOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0dmFyIG5ld0RhdGEgPSBuZXcgUVI4Yml0Qnl0ZShkYXRhKTtcblxuXHRcdHRoaXMuZGF0YUxpc3QucHVzaChuZXdEYXRhKTtcblx0XHR0aGlzLmRhdGFDYWNoZSA9IG51bGw7XG5cdH0sXG5cdFxuXHRpc0RhcmsgOiBmdW5jdGlvbihyb3csIGNvbCkge1xuXHRcdGlmIChyb3cgPCAwIHx8IHRoaXMubW9kdWxlQ291bnQgPD0gcm93IHx8IGNvbCA8IDAgfHwgdGhpcy5tb2R1bGVDb3VudCA8PSBjb2wpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihyb3cgKyBcIixcIiArIGNvbCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLm1vZHVsZXNbcm93XVtjb2xdO1xuXHR9LFxuXG5cdGdldE1vZHVsZUNvdW50IDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMubW9kdWxlQ291bnQ7XG5cdH0sXG5cdFxuXHRtYWtlIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5tYWtlSW1wbChmYWxzZSwgdGhpcy5nZXRCZXN0TWFza1BhdHRlcm4oKSApO1xuXHR9LFxuXHRcblx0bWFrZUltcGwgOiBmdW5jdGlvbih0ZXN0LCBtYXNrUGF0dGVybikge1xuXHRcdFxuXHRcdHRoaXMubW9kdWxlQ291bnQgPSB0aGlzLnR5cGVOdW1iZXIgKiA0ICsgMTc7XG5cdFx0dGhpcy5tb2R1bGVzID0gbmV3IFFSRGF0YUFycmF5KHRoaXMubW9kdWxlQ291bnQpO1xuXHRcdFxuXHRcdGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMubW9kdWxlQ291bnQ7IHJvdysrKSB7XG5cdFx0XHRcblx0XHRcdHRoaXMubW9kdWxlc1tyb3ddID0gbmV3IFFSRGF0YUFycmF5KHRoaXMubW9kdWxlQ291bnQpO1xuXHRcdFx0XG5cdFx0XHRmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLm1vZHVsZUNvdW50OyBjb2wrKykge1xuXHRcdFx0XHR0aGlzLm1vZHVsZXNbcm93XVtjb2xdID0gbnVsbDsvLyhjb2wgKyByb3cpICUgMztcblx0XHRcdH1cblx0XHR9XG5cdFxuXHRcdHRoaXMuc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybigwLCAwKTtcblx0XHR0aGlzLnNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4odGhpcy5tb2R1bGVDb3VudCAtIDcsIDApO1xuXHRcdHRoaXMuc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybigwLCB0aGlzLm1vZHVsZUNvdW50IC0gNyk7XG5cdFx0dGhpcy5zZXR1cFBvc2l0aW9uQWRqdXN0UGF0dGVybigpO1xuXHRcdHRoaXMuc2V0dXBUaW1pbmdQYXR0ZXJuKCk7XG5cdFx0dGhpcy5zZXR1cFR5cGVJbmZvKHRlc3QsIG1hc2tQYXR0ZXJuKTtcblx0XHRcblx0XHRpZiAodGhpcy50eXBlTnVtYmVyID49IDcpIHtcblx0XHRcdHRoaXMuc2V0dXBUeXBlTnVtYmVyKHRlc3QpO1xuXHRcdH1cblx0XG5cdFx0aWYgKHRoaXMuZGF0YUNhY2hlID09IG51bGwpIHtcblx0XHRcdHRoaXMuZGF0YUNhY2hlID0gUVJDb2RlLmNyZWF0ZURhdGEodGhpcy50eXBlTnVtYmVyLCB0aGlzLmVycm9yQ29ycmVjdExldmVsLCB0aGlzLmRhdGFMaXN0KTtcblx0XHR9XG5cdFxuXHRcdHRoaXMubWFwRGF0YSh0aGlzLmRhdGFDYWNoZSwgbWFza1BhdHRlcm4pO1xuXHR9LFxuXG5cdHNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4gOiBmdW5jdGlvbihyb3csIGNvbCkgIHtcblx0XHRcblx0XHRmb3IgKHZhciByID0gLTE7IHIgPD0gNzsgcisrKSB7XG5cdFx0XHRcblx0XHRcdGlmIChyb3cgKyByIDw9IC0xIHx8IHRoaXMubW9kdWxlQ291bnQgPD0gcm93ICsgcikgY29udGludWU7XG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGMgPSAtMTsgYyA8PSA3OyBjKyspIHtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChjb2wgKyBjIDw9IC0xIHx8IHRoaXMubW9kdWxlQ291bnQgPD0gY29sICsgYykgY29udGludWU7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoICgwIDw9IHIgJiYgciA8PSA2ICYmIChjID09IDAgfHwgYyA9PSA2KSApXG5cdFx0XHRcdFx0XHR8fCAoMCA8PSBjICYmIGMgPD0gNiAmJiAociA9PSAwIHx8IHIgPT0gNikgKVxuXHRcdFx0XHRcdFx0fHwgKDIgPD0gciAmJiByIDw9IDQgJiYgMiA8PSBjICYmIGMgPD0gNCkgKSB7XG5cdFx0XHRcdFx0dGhpcy5tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gdHJ1ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLm1vZHVsZXNbcm93ICsgcl1bY29sICsgY10gPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVx0XHRcblx0XHR9XHRcdFxuXHR9LFxuXHRcblx0Z2V0QmVzdE1hc2tQYXR0ZXJuIDogZnVuY3Rpb24oKSB7XG5cdFxuXHRcdHZhciBtaW5Mb3N0UG9pbnQgPSAwO1xuXHRcdHZhciBwYXR0ZXJuID0gMDtcblx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCA4OyBpKyspIHtcblx0XHRcdFxuXHRcdFx0dGhpcy5tYWtlSW1wbCh0cnVlLCBpKTtcblx0XG5cdFx0XHR2YXIgbG9zdFBvaW50ID0gUVJVdGlsLmdldExvc3RQb2ludCh0aGlzKTtcblx0XG5cdFx0XHRpZiAoaSA9PSAwIHx8IG1pbkxvc3RQb2ludCA+ICBsb3N0UG9pbnQpIHtcblx0XHRcdFx0bWluTG9zdFBvaW50ID0gbG9zdFBvaW50O1xuXHRcdFx0XHRwYXR0ZXJuID0gaTtcblx0XHRcdH1cblx0XHR9XG5cdFxuXHRcdHJldHVybiBwYXR0ZXJuO1xuXHR9LFxuXG5cdHNldHVwVGltaW5nUGF0dGVybiA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdGZvciAodmFyIHIgPSA4OyByIDwgdGhpcy5tb2R1bGVDb3VudCAtIDg7IHIrKykge1xuXHRcdFx0aWYgKHRoaXMubW9kdWxlc1tyXVs2XSAhPSBudWxsKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5tb2R1bGVzW3JdWzZdID0gKHIgJSAyID09IDApO1xuXHRcdH1cblx0XG5cdFx0Zm9yICh2YXIgYyA9IDg7IGMgPCB0aGlzLm1vZHVsZUNvdW50IC0gODsgYysrKSB7XG5cdFx0XHRpZiAodGhpcy5tb2R1bGVzWzZdW2NdICE9IG51bGwpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLm1vZHVsZXNbNl1bY10gPSAoYyAlIDIgPT0gMCk7XG5cdFx0fVxuXHR9LFxuXHRcblx0c2V0dXBQb3NpdGlvbkFkanVzdFBhdHRlcm4gOiBmdW5jdGlvbigpIHtcblx0XG5cdFx0dmFyIHBvcyA9IFFSVXRpbC5nZXRQYXR0ZXJuUG9zaXRpb24odGhpcy50eXBlTnVtYmVyKTtcblx0XHRwb3MgPSBwb3MgfHwgJyc7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwb3MubGVuZ3RoOyBpKyspIHtcblx0XHRcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgcG9zLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcblx0XHRcdFx0dmFyIHJvdyA9IHBvc1tpXTtcblx0XHRcdFx0dmFyIGNvbCA9IHBvc1tqXTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmICh0aGlzLm1vZHVsZXNbcm93XVtjb2xdICE9IG51bGwpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Zm9yICh2YXIgciA9IC0yOyByIDw9IDI7IHIrKykge1xuXHRcdFx0XHRcblx0XHRcdFx0XHRmb3IgKHZhciBjID0gLTI7IGMgPD0gMjsgYysrKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRpZiAociA9PSAtMiB8fCByID09IDIgfHwgYyA9PSAtMiB8fCBjID09IDIgXG5cdFx0XHRcdFx0XHRcdFx0fHwgKHIgPT0gMCAmJiBjID09IDApICkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLm1vZHVsZXNbcm93ICsgcl1bY29sICsgY10gPSB0cnVlO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcblx0c2V0dXBUeXBlTnVtYmVyIDogZnVuY3Rpb24odGVzdCkge1xuXHRcblx0XHR2YXIgYml0cyA9IFFSVXRpbC5nZXRCQ0hUeXBlTnVtYmVyKHRoaXMudHlwZU51bWJlcik7XG5cdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMTg7IGkrKykge1xuXHRcdFx0dmFyIG1vZCA9ICghdGVzdCAmJiAoIChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG5cdFx0XHR0aGlzLm1vZHVsZXNbTWF0aC5mbG9vcihpIC8gMyldW2kgJSAzICsgdGhpcy5tb2R1bGVDb3VudCAtIDggLSAzXSA9IG1vZDtcblx0XHR9XG5cdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMTg7IGkrKykge1xuXHRcdFx0dmFyIG1vZCA9ICghdGVzdCAmJiAoIChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG5cdFx0XHR0aGlzLm1vZHVsZXNbaSAlIDMgKyB0aGlzLm1vZHVsZUNvdW50IC0gOCAtIDNdW01hdGguZmxvb3IoaSAvIDMpXSA9IG1vZDtcblx0XHR9XG5cdH0sXG5cdFxuXHRzZXR1cFR5cGVJbmZvIDogZnVuY3Rpb24odGVzdCwgbWFza1BhdHRlcm4pIHtcblx0XG5cdFx0dmFyIGRhdGEgPSAodGhpcy5lcnJvckNvcnJlY3RMZXZlbCA8PCAzKSB8IG1hc2tQYXR0ZXJuO1xuXHRcdHZhciBiaXRzID0gUVJVdGlsLmdldEJDSFR5cGVJbmZvKGRhdGEpO1xuXHRcblx0XHQvLyB2ZXJ0aWNhbFx0XHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDE1OyBpKyspIHtcblx0XG5cdFx0XHR2YXIgbW9kID0gKCF0ZXN0ICYmICggKGJpdHMgPj4gaSkgJiAxKSA9PSAxKTtcblx0XG5cdFx0XHRpZiAoaSA8IDYpIHtcblx0XHRcdFx0dGhpcy5tb2R1bGVzW2ldWzhdID0gbW9kO1xuXHRcdFx0fSBlbHNlIGlmIChpIDwgOCkge1xuXHRcdFx0XHR0aGlzLm1vZHVsZXNbaSArIDFdWzhdID0gbW9kO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb2R1bGVzW3RoaXMubW9kdWxlQ291bnQgLSAxNSArIGldWzhdID0gbW9kO1xuXHRcdFx0fVxuXHRcdH1cblx0XG5cdFx0Ly8gaG9yaXpvbnRhbFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMTU7IGkrKykge1xuXHRcblx0XHRcdHZhciBtb2QgPSAoIXRlc3QgJiYgKCAoYml0cyA+PiBpKSAmIDEpID09IDEpO1xuXHRcdFx0XG5cdFx0XHRpZiAoaSA8IDgpIHtcblx0XHRcdFx0dGhpcy5tb2R1bGVzWzhdW3RoaXMubW9kdWxlQ291bnQgLSBpIC0gMV0gPSBtb2Q7XG5cdFx0XHR9IGVsc2UgaWYgKGkgPCA5KSB7XG5cdFx0XHRcdHRoaXMubW9kdWxlc1s4XVsxNSAtIGkgLSAxICsgMV0gPSBtb2Q7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1vZHVsZXNbOF1bMTUgLSBpIC0gMV0gPSBtb2Q7XG5cdFx0XHR9XG5cdFx0fVxuXHRcblx0XHQvLyBmaXhlZCBtb2R1bGVcblx0XHR0aGlzLm1vZHVsZXNbdGhpcy5tb2R1bGVDb3VudCAtIDhdWzhdID0gKCF0ZXN0KTtcblx0XG5cdH0sXG5cdFxuXHRtYXBEYXRhIDogZnVuY3Rpb24oZGF0YSwgbWFza1BhdHRlcm4pIHtcblx0XHRcblx0XHR2YXIgaW5jID0gLTE7XG5cdFx0dmFyIHJvdyA9IHRoaXMubW9kdWxlQ291bnQgLSAxO1xuXHRcdHZhciBiaXRJbmRleCA9IDc7XG5cdFx0dmFyIGJ5dGVJbmRleCA9IDA7XG5cdFx0XG5cdFx0Zm9yICh2YXIgY29sID0gdGhpcy5tb2R1bGVDb3VudCAtIDE7IGNvbCA+IDA7IGNvbCAtPSAyKSB7XG5cdFxuXHRcdFx0aWYgKGNvbCA9PSA2KSBjb2wtLTtcblx0XG5cdFx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcblx0XHRcdFx0Zm9yICh2YXIgYyA9IDA7IGMgPCAyOyBjKyspIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAodGhpcy5tb2R1bGVzW3Jvd11bY29sIC0gY10gPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHR2YXIgZGFyayA9IGZhbHNlO1xuXHRcblx0XHRcdFx0XHRcdGlmIChieXRlSW5kZXggPCBkYXRhLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRkYXJrID0gKCAoIChkYXRhW2J5dGVJbmRleF0gPj4+IGJpdEluZGV4KSAmIDEpID09IDEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcblx0XHRcdFx0XHRcdHZhciBtYXNrID0gUVJVdGlsLmdldE1hc2sobWFza1BhdHRlcm4sIHJvdywgY29sIC0gYyk7XG5cdFxuXHRcdFx0XHRcdFx0aWYgKG1hc2spIHtcblx0XHRcdFx0XHRcdFx0ZGFyayA9ICFkYXJrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHR0aGlzLm1vZHVsZXNbcm93XVtjb2wgLSBjXSA9IGRhcms7XG5cdFx0XHRcdFx0XHRiaXRJbmRleC0tO1xuXHRcblx0XHRcdFx0XHRcdGlmIChiaXRJbmRleCA9PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRieXRlSW5kZXgrKztcblx0XHRcdFx0XHRcdFx0Yml0SW5kZXggPSA3O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRyb3cgKz0gaW5jO1xuXHRcblx0XHRcdFx0aWYgKHJvdyA8IDAgfHwgdGhpcy5tb2R1bGVDb3VudCA8PSByb3cpIHtcblx0XHRcdFx0XHRyb3cgLT0gaW5jO1xuXHRcdFx0XHRcdGluYyA9IC1pbmM7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdH1cblxufTtcblxuUVJDb2RlLlBBRDAgPSAweEVDO1xuUVJDb2RlLlBBRDEgPSAweDExO1xuXG5RUkNvZGUuY3JlYXRlRGF0YSA9IGZ1bmN0aW9uKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdExldmVsLCBkYXRhTGlzdCkge1xuXHRcblx0dmFyIHJzQmxvY2tzID0gUVJSU0Jsb2NrLmdldFJTQmxvY2tzKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdExldmVsKTtcblx0XG5cdHZhciBidWZmZXIgPSBuZXcgUVJCaXRCdWZmZXIoKTtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YUxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgZGF0YSA9IGRhdGFMaXN0W2ldO1xuXHRcdGJ1ZmZlci5wdXQoZGF0YS5tb2RlLCA0KTtcblx0XHRidWZmZXIucHV0KGRhdGEuZ2V0TGVuZ3RoKCksIFFSVXRpbC5nZXRMZW5ndGhJbkJpdHMoZGF0YS5tb2RlLCB0eXBlTnVtYmVyKSApO1xuXHRcdGRhdGEud3JpdGUoYnVmZmVyKTtcblx0fVxuXG5cdC8vIGNhbGMgbnVtIG1heCBkYXRhLlxuXHR2YXIgdG90YWxEYXRhQ291bnQgPSAwO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHJzQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dG90YWxEYXRhQ291bnQgKz0gcnNCbG9ja3NbaV0uZGF0YUNvdW50O1xuXHR9XG5cblx0aWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSA+IHRvdGFsRGF0YUNvdW50ICogOCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImNvZGUgbGVuZ3RoIG92ZXJmbG93LiAoXCJcblx0XHRcdCsgYnVmZmVyLmdldExlbmd0aEluQml0cygpXG5cdFx0XHQrIFwiPlwiXG5cdFx0XHQrICB0b3RhbERhdGFDb3VudCAqIDhcblx0XHRcdCsgXCIpXCIpO1xuXHR9XG5cblx0Ly8gZW5kIGNvZGVcblx0aWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSArIDQgPD0gdG90YWxEYXRhQ291bnQgKiA4KSB7XG5cdFx0YnVmZmVyLnB1dCgwLCA0KTtcblx0fVxuXG5cdC8vIHBhZGRpbmdcblx0d2hpbGUgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSAlIDggIT0gMCkge1xuXHRcdGJ1ZmZlci5wdXRCaXQoZmFsc2UpO1xuXHR9XG5cblx0Ly8gcGFkZGluZ1xuXHR3aGlsZSAodHJ1ZSkge1xuXHRcdFxuXHRcdGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgPj0gdG90YWxEYXRhQ291bnQgKiA4KSB7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdFx0YnVmZmVyLnB1dChRUkNvZGUuUEFEMCwgOCk7XG5cdFx0XG5cdFx0aWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSA+PSB0b3RhbERhdGFDb3VudCAqIDgpIHtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRidWZmZXIucHV0KFFSQ29kZS5QQUQxLCA4KTtcblx0fVxuXG5cdHJldHVybiBRUkNvZGUuY3JlYXRlQnl0ZXMoYnVmZmVyLCByc0Jsb2Nrcyk7XG59O1xuXG5RUkNvZGUuY3JlYXRlQnl0ZXMgPSBmdW5jdGlvbihidWZmZXIsIHJzQmxvY2tzKSB7XG5cblx0dmFyIG9mZnNldCA9IDA7XG5cdFxuXHR2YXIgbWF4RGNDb3VudCA9IDA7XG5cdHZhciBtYXhFY0NvdW50ID0gMDtcblx0XG5cdHZhciBkY2RhdGEgPSBuZXcgUVJEYXRhQXJyYXkocnNCbG9ja3MubGVuZ3RoKTtcblx0dmFyIGVjZGF0YSA9IG5ldyBRUkRhdGFBcnJheShyc0Jsb2Nrcy5sZW5ndGgpO1xuXHRcblx0Zm9yICh2YXIgciA9IDA7IHIgPCByc0Jsb2Nrcy5sZW5ndGg7IHIrKykge1xuXG5cdFx0dmFyIGRjQ291bnQgPSByc0Jsb2Nrc1tyXS5kYXRhQ291bnQ7XG5cdFx0dmFyIGVjQ291bnQgPSByc0Jsb2Nrc1tyXS50b3RhbENvdW50IC0gZGNDb3VudDtcblxuXHRcdG1heERjQ291bnQgPSBNYXRoLm1heChtYXhEY0NvdW50LCBkY0NvdW50KTtcblx0XHRtYXhFY0NvdW50ID0gTWF0aC5tYXgobWF4RWNDb3VudCwgZWNDb3VudCk7XG5cdFx0XG5cdFx0ZGNkYXRhW3JdID0gbmV3IFFSRGF0YUFycmF5KGRjQ291bnQpO1xuXHRcdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGNkYXRhW3JdLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRkY2RhdGFbcl1baV0gPSAweGZmICYgYnVmZmVyLmJ1ZmZlcltpICsgb2Zmc2V0XTtcblx0XHR9XG5cdFx0b2Zmc2V0ICs9IGRjQ291bnQ7XG5cdFx0XG5cdFx0dmFyIHJzUG9seSA9IFFSVXRpbC5nZXRFcnJvckNvcnJlY3RQb2x5bm9taWFsKGVjQ291bnQpO1xuXHRcdHZhciByYXdQb2x5ID0gbmV3IFFSUG9seW5vbWlhbChkY2RhdGFbcl0sIHJzUG9seS5nZXRMZW5ndGgoKSAtIDEpO1xuXG5cdFx0dmFyIG1vZFBvbHkgPSByYXdQb2x5Lm1vZChyc1BvbHkpO1xuXHRcdGVjZGF0YVtyXSA9IG5ldyBRUkRhdGFBcnJheShyc1BvbHkuZ2V0TGVuZ3RoKCkgLSAxKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVjZGF0YVtyXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG1vZEluZGV4ID0gaSArIG1vZFBvbHkuZ2V0TGVuZ3RoKCkgLSBlY2RhdGFbcl0ubGVuZ3RoO1xuXHRcdFx0ZWNkYXRhW3JdW2ldID0gKG1vZEluZGV4ID49IDApPyBtb2RQb2x5LmdldChtb2RJbmRleCkgOiAwO1xuXHRcdH1cblxuXHR9XG5cdFxuXHR2YXIgdG90YWxDb2RlQ291bnQgPSAwO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHJzQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dG90YWxDb2RlQ291bnQgKz0gcnNCbG9ja3NbaV0udG90YWxDb3VudDtcblx0fVxuXG5cdHZhciBkYXRhID0gbmV3IFFSRGF0YUFycmF5KHRvdGFsQ29kZUNvdW50KTtcblx0dmFyIGluZGV4ID0gMDtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IG1heERjQ291bnQ7IGkrKykge1xuXHRcdGZvciAodmFyIHIgPSAwOyByIDwgcnNCbG9ja3MubGVuZ3RoOyByKyspIHtcblx0XHRcdGlmIChpIDwgZGNkYXRhW3JdLmxlbmd0aCkge1xuXHRcdFx0XHRkYXRhW2luZGV4KytdID0gZGNkYXRhW3JdW2ldO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbWF4RWNDb3VudDsgaSsrKSB7XG5cdFx0Zm9yICh2YXIgciA9IDA7IHIgPCByc0Jsb2Nrcy5sZW5ndGg7IHIrKykge1xuXHRcdFx0aWYgKGkgPCBlY2RhdGFbcl0ubGVuZ3RoKSB7XG5cdFx0XHRcdGRhdGFbaW5kZXgrK10gPSBlY2RhdGFbcl1baV07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGRhdGE7XG5cbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUjhiaXRCeXRlXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZnVuY3Rpb24gUVI4Yml0Qnl0ZShkYXRhKSB7XG4gIHRoaXMubW9kZSA9IFFSTW9kZS5NT0RFXzhCSVRfQllURTtcbiAgdGhpcy5kYXRhID0gZGF0YTtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdO1xuICBcbiAgdGhpcy5wYXJzZWREYXRhID0gYm9wcy5mcm9tKGRhdGEpO1xufVxuXG5RUjhiaXRCeXRlLnByb3RvdHlwZSA9IHtcbiAgZ2V0TGVuZ3RoOiBmdW5jdGlvbiAoYnVmZmVyKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VkRGF0YS5sZW5ndGg7XG4gIH0sXG4gIHdyaXRlOiBmdW5jdGlvbiAoYnVmZmVyKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLnBhcnNlZERhdGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBidWZmZXIucHV0KHRoaXMucGFyc2VkRGF0YVtpXSwgOCk7XG4gICAgfVxuICB9XG59O1xuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUk1vZGVcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBRUk1vZGUgPSB7XG5cdE1PREVfTlVNQkVSIDpcdFx0MSA8PCAwLFxuXHRNT0RFX0FMUEhBX05VTSA6IFx0MSA8PCAxLFxuXHRNT0RFXzhCSVRfQllURSA6IFx0MSA8PCAyLFxuXHRNT0RFX0tBTkpJIDpcdFx0MSA8PCAzXG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVJFcnJvckNvcnJlY3RMZXZlbFxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vZXhwb3J0ZWRcblxudmFyIFFSRXJyb3JDb3JyZWN0TGV2ZWwgPSBleHBvcnRzLlFSRXJyb3JDb3JyZWN0TGV2ZWwgPSB7XG5cdEwgOiAxLFxuXHRNIDogMCxcblx0USA6IDMsXG5cdEggOiAyXG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVJNYXNrUGF0dGVyblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIFFSTWFza1BhdHRlcm4gPSAge1xuXHRQQVRURVJOMDAwIDogMCxcblx0UEFUVEVSTjAwMSA6IDEsXG5cdFBBVFRFUk4wMTAgOiAyLFxuXHRQQVRURVJOMDExIDogMyxcblx0UEFUVEVSTjEwMCA6IDQsXG5cdFBBVFRFUk4xMDEgOiA1LFxuXHRQQVRURVJOMTEwIDogNixcblx0UEFUVEVSTjExMSA6IDdcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUlV0aWxcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gXG52YXIgUVJVdGlsID0ge1xuXG4gICAgUEFUVEVSTl9QT1NJVElPTl9UQUJMRSA6IFtcblx0ICAgIFtdLFxuXHQgICAgWzYsIDE4XSxcblx0ICAgIFs2LCAyMl0sXG5cdCAgICBbNiwgMjZdLFxuXHQgICAgWzYsIDMwXSxcblx0ICAgIFs2LCAzNF0sXG5cdCAgICBbNiwgMjIsIDM4XSxcblx0ICAgIFs2LCAyNCwgNDJdLFxuXHQgICAgWzYsIDI2LCA0Nl0sXG5cdCAgICBbNiwgMjgsIDUwXSxcblx0ICAgIFs2LCAzMCwgNTRdLFx0XHRcblx0ICAgIFs2LCAzMiwgNThdLFxuXHQgICAgWzYsIDM0LCA2Ml0sXG5cdCAgICBbNiwgMjYsIDQ2LCA2Nl0sXG5cdCAgICBbNiwgMjYsIDQ4LCA3MF0sXG5cdCAgICBbNiwgMjYsIDUwLCA3NF0sXG5cdCAgICBbNiwgMzAsIDU0LCA3OF0sXG5cdCAgICBbNiwgMzAsIDU2LCA4Ml0sXG5cdCAgICBbNiwgMzAsIDU4LCA4Nl0sXG5cdCAgICBbNiwgMzQsIDYyLCA5MF0sXG5cdCAgICBbNiwgMjgsIDUwLCA3MiwgOTRdLFxuXHQgICAgWzYsIDI2LCA1MCwgNzQsIDk4XSxcblx0ICAgIFs2LCAzMCwgNTQsIDc4LCAxMDJdLFxuXHQgICAgWzYsIDI4LCA1NCwgODAsIDEwNl0sXG5cdCAgICBbNiwgMzIsIDU4LCA4NCwgMTEwXSxcblx0ICAgIFs2LCAzMCwgNTgsIDg2LCAxMTRdLFxuXHQgICAgWzYsIDM0LCA2MiwgOTAsIDExOF0sXG5cdCAgICBbNiwgMjYsIDUwLCA3NCwgOTgsIDEyMl0sXG5cdCAgICBbNiwgMzAsIDU0LCA3OCwgMTAyLCAxMjZdLFxuXHQgICAgWzYsIDI2LCA1MiwgNzgsIDEwNCwgMTMwXSxcblx0ICAgIFs2LCAzMCwgNTYsIDgyLCAxMDgsIDEzNF0sXG5cdCAgICBbNiwgMzQsIDYwLCA4NiwgMTEyLCAxMzhdLFxuXHQgICAgWzYsIDMwLCA1OCwgODYsIDExNCwgMTQyXSxcblx0ICAgIFs2LCAzNCwgNjIsIDkwLCAxMTgsIDE0Nl0sXG5cdCAgICBbNiwgMzAsIDU0LCA3OCwgMTAyLCAxMjYsIDE1MF0sXG5cdCAgICBbNiwgMjQsIDUwLCA3NiwgMTAyLCAxMjgsIDE1NF0sXG5cdCAgICBbNiwgMjgsIDU0LCA4MCwgMTA2LCAxMzIsIDE1OF0sXG5cdCAgICBbNiwgMzIsIDU4LCA4NCwgMTEwLCAxMzYsIDE2Ml0sXG5cdCAgICBbNiwgMjYsIDU0LCA4MiwgMTEwLCAxMzgsIDE2Nl0sXG5cdCAgICBbNiwgMzAsIDU4LCA4NiwgMTE0LCAxNDIsIDE3MF1cbiAgICBdLFxuXG4gICAgRzE1IDogKDEgPDwgMTApIHwgKDEgPDwgOCkgfCAoMSA8PCA1KSB8ICgxIDw8IDQpIHwgKDEgPDwgMikgfCAoMSA8PCAxKSB8ICgxIDw8IDApLFxuICAgIEcxOCA6ICgxIDw8IDEyKSB8ICgxIDw8IDExKSB8ICgxIDw8IDEwKSB8ICgxIDw8IDkpIHwgKDEgPDwgOCkgfCAoMSA8PCA1KSB8ICgxIDw8IDIpIHwgKDEgPDwgMCksXG4gICAgRzE1X01BU0sgOiAoMSA8PCAxNCkgfCAoMSA8PCAxMikgfCAoMSA8PCAxMClcdHwgKDEgPDwgNCkgfCAoMSA8PCAxKSxcblxuICAgIGdldEJDSFR5cGVJbmZvIDogZnVuY3Rpb24oZGF0YSkge1xuXHQgICAgdmFyIGQgPSBkYXRhIDw8IDEwO1xuXHQgICAgd2hpbGUgKFFSVXRpbC5nZXRCQ0hEaWdpdChkKSAtIFFSVXRpbC5nZXRCQ0hEaWdpdChRUlV0aWwuRzE1KSA+PSAwKSB7XG5cdFx0ICAgIGQgXj0gKFFSVXRpbC5HMTUgPDwgKFFSVXRpbC5nZXRCQ0hEaWdpdChkKSAtIFFSVXRpbC5nZXRCQ0hEaWdpdChRUlV0aWwuRzE1KSApICk7IFx0XG5cdCAgICB9XG5cdCAgICByZXR1cm4gKCAoZGF0YSA8PCAxMCkgfCBkKSBeIFFSVXRpbC5HMTVfTUFTSztcbiAgICB9LFxuXG4gICAgZ2V0QkNIVHlwZU51bWJlciA6IGZ1bmN0aW9uKGRhdGEpIHtcblx0ICAgIHZhciBkID0gZGF0YSA8PCAxMjtcblx0ICAgIHdoaWxlIChRUlV0aWwuZ2V0QkNIRGlnaXQoZCkgLSBRUlV0aWwuZ2V0QkNIRGlnaXQoUVJVdGlsLkcxOCkgPj0gMCkge1xuXHRcdCAgICBkIF49IChRUlV0aWwuRzE4IDw8IChRUlV0aWwuZ2V0QkNIRGlnaXQoZCkgLSBRUlV0aWwuZ2V0QkNIRGlnaXQoUVJVdGlsLkcxOCkgKSApOyBcdFxuXHQgICAgfVxuXHQgICAgcmV0dXJuIChkYXRhIDw8IDEyKSB8IGQ7XG4gICAgfSxcblxuICAgIGdldEJDSERpZ2l0IDogZnVuY3Rpb24oZGF0YSkge1xuXG5cdCAgICB2YXIgZGlnaXQgPSAwO1xuXG5cdCAgICB3aGlsZSAoZGF0YSAhPSAwKSB7XG5cdFx0ICAgIGRpZ2l0Kys7XG5cdFx0ICAgIGRhdGEgPj4+PSAxO1xuXHQgICAgfVxuXG5cdCAgICByZXR1cm4gZGlnaXQ7XG4gICAgfSxcblxuICAgIGdldFBhdHRlcm5Qb3NpdGlvbiA6IGZ1bmN0aW9uKHR5cGVOdW1iZXIpIHtcblx0ICAgIHJldHVybiBRUlV0aWwuUEFUVEVSTl9QT1NJVElPTl9UQUJMRVt0eXBlTnVtYmVyIC0gMV07XG4gICAgfSxcblxuICAgIGdldE1hc2sgOiBmdW5jdGlvbihtYXNrUGF0dGVybiwgaSwgaikge1xuXHQgICAgXG5cdCAgICBzd2l0Y2ggKG1hc2tQYXR0ZXJuKSB7XG5cdFx0ICAgIFxuXHQgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMDAgOiByZXR1cm4gKGkgKyBqKSAlIDIgPT0gMDtcblx0ICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDAxIDogcmV0dXJuIGkgJSAyID09IDA7XG5cdCAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAxMCA6IHJldHVybiBqICUgMyA9PSAwO1xuXHQgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMTEgOiByZXR1cm4gKGkgKyBqKSAlIDMgPT0gMDtcblx0ICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMTAwIDogcmV0dXJuIChNYXRoLmZsb29yKGkgLyAyKSArIE1hdGguZmxvb3IoaiAvIDMpICkgJSAyID09IDA7XG5cdCAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjEwMSA6IHJldHVybiAoaSAqIGopICUgMiArIChpICogaikgJSAzID09IDA7XG5cdCAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjExMCA6IHJldHVybiAoIChpICogaikgJSAyICsgKGkgKiBqKSAlIDMpICUgMiA9PSAwO1xuXHQgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMTEgOiByZXR1cm4gKCAoaSAqIGopICUgMyArIChpICsgaikgJSAyKSAlIDIgPT0gMDtcblxuXHQgICAgZGVmYXVsdCA6XG5cdFx0ICAgIHRocm93IG5ldyBFcnJvcihcImJhZCBtYXNrUGF0dGVybjpcIiArIG1hc2tQYXR0ZXJuKTtcblx0ICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0RXJyb3JDb3JyZWN0UG9seW5vbWlhbCA6IGZ1bmN0aW9uKGVycm9yQ29ycmVjdExlbmd0aCkge1xuXG5cdCAgICB2YXIgYSA9IG5ldyBRUlBvbHlub21pYWwoWzFdLCAwKTtcblxuXHQgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlcnJvckNvcnJlY3RMZW5ndGg7IGkrKykge1xuXHRcdCAgICBhID0gYS5tdWx0aXBseShuZXcgUVJQb2x5bm9taWFsKFsxLCBRUk1hdGguZ2V4cChpKV0sIDApICk7XG5cdCAgICB9XG5cblx0ICAgIHJldHVybiBhO1xuICAgIH0sXG5cbiAgICBnZXRMZW5ndGhJbkJpdHMgOiBmdW5jdGlvbihtb2RlLCB0eXBlKSB7XG5cblx0ICAgIGlmICgxIDw9IHR5cGUgJiYgdHlwZSA8IDEwKSB7XG5cblx0XHQgICAgLy8gMSAtIDlcblxuXHRcdCAgICBzd2l0Y2gobW9kZSkge1xuXHRcdCAgICBjYXNlIFFSTW9kZS5NT0RFX05VTUJFUiBcdDogcmV0dXJuIDEwO1xuXHRcdCAgICBjYXNlIFFSTW9kZS5NT0RFX0FMUEhBX05VTSBcdDogcmV0dXJuIDk7XG5cdFx0ICAgIGNhc2UgUVJNb2RlLk1PREVfOEJJVF9CWVRFXHQ6IHJldHVybiA4O1xuXHRcdCAgICBjYXNlIFFSTW9kZS5NT0RFX0tBTkpJICBcdDogcmV0dXJuIDg7XG5cdFx0ICAgIGRlZmF1bHQgOlxuXHRcdFx0ICAgIHRocm93IG5ldyBFcnJvcihcIm1vZGU6XCIgKyBtb2RlKTtcblx0XHQgICAgfVxuXG5cdCAgICB9IGVsc2UgaWYgKHR5cGUgPCAyNykge1xuXG5cdFx0ICAgIC8vIDEwIC0gMjZcblxuXHRcdCAgICBzd2l0Y2gobW9kZSkge1xuXHRcdCAgICBjYXNlIFFSTW9kZS5NT0RFX05VTUJFUiBcdDogcmV0dXJuIDEyO1xuXHRcdCAgICBjYXNlIFFSTW9kZS5NT0RFX0FMUEhBX05VTSBcdDogcmV0dXJuIDExO1xuXHRcdCAgICBjYXNlIFFSTW9kZS5NT0RFXzhCSVRfQllURVx0OiByZXR1cm4gMTY7XG5cdFx0ICAgIGNhc2UgUVJNb2RlLk1PREVfS0FOSkkgIFx0OiByZXR1cm4gMTA7XG5cdFx0ICAgIGRlZmF1bHQgOlxuXHRcdFx0ICAgIHRocm93IG5ldyBFcnJvcihcIm1vZGU6XCIgKyBtb2RlKTtcblx0XHQgICAgfVxuXG5cdCAgICB9IGVsc2UgaWYgKHR5cGUgPCA0MSkge1xuXG5cdFx0ICAgIC8vIDI3IC0gNDBcblxuXHRcdCAgICBzd2l0Y2gobW9kZSkge1xuXHRcdCAgICBjYXNlIFFSTW9kZS5NT0RFX05VTUJFUiBcdDogcmV0dXJuIDE0O1xuXHRcdCAgICBjYXNlIFFSTW9kZS5NT0RFX0FMUEhBX05VTVx0OiByZXR1cm4gMTM7XG5cdFx0ICAgIGNhc2UgUVJNb2RlLk1PREVfOEJJVF9CWVRFXHQ6IHJldHVybiAxNjtcblx0XHQgICAgY2FzZSBRUk1vZGUuTU9ERV9LQU5KSSAgXHQ6IHJldHVybiAxMjtcblx0XHQgICAgZGVmYXVsdCA6XG5cdFx0XHQgICAgdGhyb3cgbmV3IEVycm9yKFwibW9kZTpcIiArIG1vZGUpO1xuXHRcdCAgICB9XG5cblx0ICAgIH0gZWxzZSB7XG5cdFx0ICAgIHRocm93IG5ldyBFcnJvcihcInR5cGU6XCIgKyB0eXBlKTtcblx0ICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0TG9zdFBvaW50IDogZnVuY3Rpb24ocXJDb2RlKSB7XG5cdCAgICBcblx0ICAgIHZhciBtb2R1bGVDb3VudCA9IHFyQ29kZS5nZXRNb2R1bGVDb3VudCgpO1xuXHQgICAgXG5cdCAgICB2YXIgbG9zdFBvaW50ID0gMDtcblx0ICAgIFxuXHQgICAgLy8gTEVWRUwxXG5cdCAgICBcblx0ICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50OyByb3crKykge1xuXG5cdFx0ICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50OyBjb2wrKykge1xuXG5cdFx0XHQgICAgdmFyIHNhbWVDb3VudCA9IDA7XG5cdFx0XHQgICAgdmFyIGRhcmsgPSBxckNvZGUuaXNEYXJrKHJvdywgY29sKTtcblxuXHRcdFx0XHRmb3IgKHZhciByID0gLTE7IHIgPD0gMTsgcisrKSB7XG5cblx0XHRcdFx0ICAgIGlmIChyb3cgKyByIDwgMCB8fCBtb2R1bGVDb3VudCA8PSByb3cgKyByKSB7XG5cdFx0XHRcdFx0ICAgIGNvbnRpbnVlO1xuXHRcdFx0XHQgICAgfVxuXG5cdFx0XHRcdCAgICBmb3IgKHZhciBjID0gLTE7IGMgPD0gMTsgYysrKSB7XG5cblx0XHRcdFx0XHQgICAgaWYgKGNvbCArIGMgPCAwIHx8IG1vZHVsZUNvdW50IDw9IGNvbCArIGMpIHtcblx0XHRcdFx0XHRcdCAgICBjb250aW51ZTtcblx0XHRcdFx0XHQgICAgfVxuXG5cdFx0XHRcdFx0ICAgIGlmIChyID09IDAgJiYgYyA9PSAwKSB7XG5cdFx0XHRcdFx0XHQgICAgY29udGludWU7XG5cdFx0XHRcdFx0ICAgIH1cblxuXHRcdFx0XHRcdCAgICBpZiAoZGFyayA9PSBxckNvZGUuaXNEYXJrKHJvdyArIHIsIGNvbCArIGMpICkge1xuXHRcdFx0XHRcdFx0ICAgIHNhbWVDb3VudCsrO1xuXHRcdFx0XHRcdCAgICB9XG5cdFx0XHRcdCAgICB9XG5cdFx0XHQgICAgfVxuXG5cdFx0XHQgICAgaWYgKHNhbWVDb3VudCA+IDUpIHtcblx0XHRcdFx0ICAgIGxvc3RQb2ludCArPSAoMyArIHNhbWVDb3VudCAtIDUpO1xuXHRcdFx0ICAgIH1cblx0XHQgICAgfVxuXHQgICAgfVxuXG5cdCAgICAvLyBMRVZFTDJcblxuXHQgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQgLSAxOyByb3crKykge1xuXHRcdCAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudCAtIDE7IGNvbCsrKSB7XG5cdFx0XHQgICAgdmFyIGNvdW50ID0gMDtcblx0XHRcdCAgICBpZiAocXJDb2RlLmlzRGFyayhyb3csICAgICBjb2wgICAgKSApIGNvdW50Kys7XG5cdFx0XHQgICAgaWYgKHFyQ29kZS5pc0Rhcmsocm93ICsgMSwgY29sICAgICkgKSBjb3VudCsrO1xuXHRcdFx0ICAgIGlmIChxckNvZGUuaXNEYXJrKHJvdywgICAgIGNvbCArIDEpICkgY291bnQrKztcblx0XHRcdCAgICBpZiAocXJDb2RlLmlzRGFyayhyb3cgKyAxLCBjb2wgKyAxKSApIGNvdW50Kys7XG5cdFx0XHQgICAgaWYgKGNvdW50ID09IDAgfHwgY291bnQgPT0gNCkge1xuXHRcdFx0XHQgICAgbG9zdFBvaW50ICs9IDM7XG5cdFx0XHQgICAgfVxuXHRcdCAgICB9XG5cdCAgICB9XG5cblx0ICAgIC8vIExFVkVMM1xuXG5cdCAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudDsgcm93KyspIHtcblx0XHQgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQgLSA2OyBjb2wrKykge1xuXHRcdFx0ICAgIGlmIChxckNvZGUuaXNEYXJrKHJvdywgY29sKVxuXHRcdFx0XHRcdCAgICAmJiAhcXJDb2RlLmlzRGFyayhyb3csIGNvbCArIDEpXG5cdFx0XHRcdFx0ICAgICYmICBxckNvZGUuaXNEYXJrKHJvdywgY29sICsgMilcblx0XHRcdFx0XHQgICAgJiYgIHFyQ29kZS5pc0Rhcmsocm93LCBjb2wgKyAzKVxuXHRcdFx0XHRcdCAgICAmJiAgcXJDb2RlLmlzRGFyayhyb3csIGNvbCArIDQpXG5cdFx0XHRcdFx0ICAgICYmICFxckNvZGUuaXNEYXJrKHJvdywgY29sICsgNSlcblx0XHRcdFx0XHQgICAgJiYgIHFyQ29kZS5pc0Rhcmsocm93LCBjb2wgKyA2KSApIHtcblx0XHRcdFx0ICAgIGxvc3RQb2ludCArPSA0MDtcblx0XHRcdCAgICB9XG5cdFx0ICAgIH1cblx0ICAgIH1cblxuXHQgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQ7IGNvbCsrKSB7XG5cdFx0ICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50IC0gNjsgcm93KyspIHtcblx0XHRcdCAgICBpZiAocXJDb2RlLmlzRGFyayhyb3csIGNvbClcblx0XHRcdFx0XHQgICAgJiYgIXFyQ29kZS5pc0Rhcmsocm93ICsgMSwgY29sKVxuXHRcdFx0XHRcdCAgICAmJiAgcXJDb2RlLmlzRGFyayhyb3cgKyAyLCBjb2wpXG5cdFx0XHRcdFx0ICAgICYmICBxckNvZGUuaXNEYXJrKHJvdyArIDMsIGNvbClcblx0XHRcdFx0XHQgICAgJiYgIHFyQ29kZS5pc0Rhcmsocm93ICsgNCwgY29sKVxuXHRcdFx0XHRcdCAgICAmJiAhcXJDb2RlLmlzRGFyayhyb3cgKyA1LCBjb2wpXG5cdFx0XHRcdFx0ICAgICYmICBxckNvZGUuaXNEYXJrKHJvdyArIDYsIGNvbCkgKSB7XG5cdFx0XHRcdCAgICBsb3N0UG9pbnQgKz0gNDA7XG5cdFx0XHQgICAgfVxuXHRcdCAgICB9XG5cdCAgICB9XG5cblx0ICAgIC8vIExFVkVMNFxuXHQgICAgXG5cdCAgICB2YXIgZGFya0NvdW50ID0gMDtcblxuXHQgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQ7IGNvbCsrKSB7XG5cdFx0ICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50OyByb3crKykge1xuXHRcdFx0ICAgIGlmIChxckNvZGUuaXNEYXJrKHJvdywgY29sKSApIHtcblx0XHRcdFx0ICAgIGRhcmtDb3VudCsrO1xuXHRcdFx0ICAgIH1cblx0XHQgICAgfVxuXHQgICAgfVxuXHQgICAgXG5cdCAgICB2YXIgcmF0aW8gPSBNYXRoLmFicygxMDAgKiBkYXJrQ291bnQgLyBtb2R1bGVDb3VudCAvIG1vZHVsZUNvdW50IC0gNTApIC8gNTtcblx0ICAgIGxvc3RQb2ludCArPSByYXRpbyAqIDEwO1xuXG5cdCAgICByZXR1cm4gbG9zdFBvaW50O1x0XHRcbiAgICB9XG5cbn07XG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSTWF0aFxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIFFSTWF0aCA9IHtcblxuXHRnbG9nIDogZnVuY3Rpb24obikge1xuXHRcblx0XHRpZiAobiA8IDEpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcImdsb2coXCIgKyBuICsgXCIpXCIpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gUVJNYXRoLkxPR19UQUJMRVtuXTtcblx0fSxcblx0XG5cdGdleHAgOiBmdW5jdGlvbihuKSB7XG5cdFxuXHRcdHdoaWxlIChuIDwgMCkge1xuXHRcdFx0biArPSAyNTU7XG5cdFx0fVxuXHRcblx0XHR3aGlsZSAobiA+PSAyNTYpIHtcblx0XHRcdG4gLT0gMjU1O1xuXHRcdH1cblx0XG5cdFx0cmV0dXJuIFFSTWF0aC5FWFBfVEFCTEVbbl07XG5cdH0sXG5cdFxuXHRFWFBfVEFCTEUgOiBuZXcgQXJyYXkoMjU2KSxcblx0XG5cdExPR19UQUJMRSA6IG5ldyBBcnJheSgyNTYpXG5cbn07XG5cdFxuZm9yICh2YXIgaSA9IDA7IGkgPCA4OyBpKyspIHtcblx0UVJNYXRoLkVYUF9UQUJMRVtpXSA9IDEgPDwgaTtcbn1cbmZvciAodmFyIGkgPSA4OyBpIDwgMjU2OyBpKyspIHtcblx0UVJNYXRoLkVYUF9UQUJMRVtpXSA9IFFSTWF0aC5FWFBfVEFCTEVbaSAtIDRdXG5cdFx0XiBRUk1hdGguRVhQX1RBQkxFW2kgLSA1XVxuXHRcdF4gUVJNYXRoLkVYUF9UQUJMRVtpIC0gNl1cblx0XHReIFFSTWF0aC5FWFBfVEFCTEVbaSAtIDhdO1xufVxuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTU7IGkrKykge1xuXHRRUk1hdGguTE9HX1RBQkxFW1FSTWF0aC5FWFBfVEFCTEVbaV0gXSA9IGk7XG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUlBvbHlub21pYWxcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIFFSUG9seW5vbWlhbChudW0sIHNoaWZ0KSB7XG5cblx0aWYgKG51bS5sZW5ndGggPT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKG51bS5sZW5ndGggKyBcIi9cIiArIHNoaWZ0KTtcblx0fVxuXG5cdHZhciBvZmZzZXQgPSAwO1xuXG5cdHdoaWxlIChvZmZzZXQgPCBudW0ubGVuZ3RoICYmIG51bVtvZmZzZXRdID09IDApIHtcblx0XHRvZmZzZXQrKztcblx0fVxuXG5cdHRoaXMubnVtID0gbmV3IEFycmF5KG51bS5sZW5ndGggLSBvZmZzZXQgKyBzaGlmdCk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbnVtLmxlbmd0aCAtIG9mZnNldDsgaSsrKSB7XG5cdFx0dGhpcy5udW1baV0gPSBudW1baSArIG9mZnNldF07XG5cdH1cbn1cblxuUVJQb2x5bm9taWFsLnByb3RvdHlwZSA9IHtcblxuXHRnZXQgOiBmdW5jdGlvbihpbmRleCkge1xuXHRcdHJldHVybiB0aGlzLm51bVtpbmRleF07XG5cdH0sXG5cdFxuXHRnZXRMZW5ndGggOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5udW0ubGVuZ3RoO1xuXHR9LFxuXHRcblx0bXVsdGlwbHkgOiBmdW5jdGlvbihlKSB7XG5cdFxuXHRcdHZhciBudW0gPSBuZXcgQXJyYXkodGhpcy5nZXRMZW5ndGgoKSArIGUuZ2V0TGVuZ3RoKCkgLSAxKTtcblx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdldExlbmd0aCgpOyBpKyspIHtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgZS5nZXRMZW5ndGgoKTsgaisrKSB7XG5cdFx0XHRcdG51bVtpICsgal0gXj0gUVJNYXRoLmdleHAoUVJNYXRoLmdsb2codGhpcy5nZXQoaSkgKSArIFFSTWF0aC5nbG9nKGUuZ2V0KGopICkgKTtcblx0XHRcdH1cblx0XHR9XG5cdFxuXHRcdHJldHVybiBuZXcgUVJQb2x5bm9taWFsKG51bSwgMCk7XG5cdH0sXG5cdFxuXHRtb2QgOiBmdW5jdGlvbihlKSB7XG5cdFxuXHRcdGlmICh0aGlzLmdldExlbmd0aCgpIC0gZS5nZXRMZW5ndGgoKSA8IDApIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0XG5cdFx0dmFyIHJhdGlvID0gUVJNYXRoLmdsb2codGhpcy5nZXQoMCkgKSAtIFFSTWF0aC5nbG9nKGUuZ2V0KDApICk7XG5cdFxuXHRcdHZhciBudW0gPSBuZXcgQXJyYXkodGhpcy5nZXRMZW5ndGgoKSApO1xuXHRcdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nZXRMZW5ndGgoKTsgaSsrKSB7XG5cdFx0XHRudW1baV0gPSB0aGlzLmdldChpKTtcblx0XHR9XG5cdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlLmdldExlbmd0aCgpOyBpKyspIHtcblx0XHRcdG51bVtpXSBePSBRUk1hdGguZ2V4cChRUk1hdGguZ2xvZyhlLmdldChpKSApICsgcmF0aW8pO1xuXHRcdH1cblx0XG5cdFx0Ly8gcmVjdXJzaXZlIGNhbGxcblx0XHRyZXR1cm4gbmV3IFFSUG9seW5vbWlhbChudW0sIDApLm1vZChlKTtcblx0fVxufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSUlNCbG9ja1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gUVJSU0Jsb2NrKHRvdGFsQ291bnQsIGRhdGFDb3VudCkge1xuXHR0aGlzLnRvdGFsQ291bnQgPSB0b3RhbENvdW50O1xuXHR0aGlzLmRhdGFDb3VudCAgPSBkYXRhQ291bnQ7XG59XG5cblFSUlNCbG9jay5SU19CTE9DS19UQUJMRSA9IFtcbi8vIExcbi8vIE1cbi8vIFFcbi8vIEhcblxuLy8gMVxuWzEsIDI2LCAxOV0sXG5bMSwgMjYsIDE2XSxcblsxLCAyNiwgMTNdLFxuWzEsIDI2LCA5XSxcbi8vIDJcblsxLCA0NCwgMzRdLFxuWzEsIDQ0LCAyOF0sXG5bMSwgNDQsIDIyXSxcblsxLCA0NCwgMTZdLFxuLy8gM1xuWzEsIDcwLCA1NV0sXG5bMSwgNzAsIDQ0XSxcblsyLCAzNSwgMTddLFxuWzIsIDM1LCAxM10sXG4vLyA0XHRcdFxuWzEsIDEwMCwgODBdLFxuWzIsIDUwLCAzMl0sXG5bMiwgNTAsIDI0XSxcbls0LCAyNSwgOV0sXG4vLyA1XG5bMSwgMTM0LCAxMDhdLFxuWzIsIDY3LCA0M10sXG5bMiwgMzMsIDE1LCAyLCAzNCwgMTZdLFxuWzIsIDMzLCAxMSwgMiwgMzQsIDEyXSxcbi8vIDZcblsyLCA4NiwgNjhdLFxuWzQsIDQzLCAyN10sXG5bNCwgNDMsIDE5XSxcbls0LCA0MywgMTVdLFxuLy8gN1x0XHRcblsyLCA5OCwgNzhdLFxuWzQsIDQ5LCAzMV0sXG5bMiwgMzIsIDE0LCA0LCAzMywgMTVdLFxuWzQsIDM5LCAxMywgMSwgNDAsIDE0XSxcbi8vIDhcblsyLCAxMjEsIDk3XSxcblsyLCA2MCwgMzgsIDIsIDYxLCAzOV0sXG5bNCwgNDAsIDE4LCAyLCA0MSwgMTldLFxuWzQsIDQwLCAxNCwgMiwgNDEsIDE1XSxcbi8vIDlcblsyLCAxNDYsIDExNl0sXG5bMywgNTgsIDM2LCAyLCA1OSwgMzddLFxuWzQsIDM2LCAxNiwgNCwgMzcsIDE3XSxcbls0LCAzNiwgMTIsIDQsIDM3LCAxM10sXG4vLyAxMFx0XHRcblsyLCA4NiwgNjgsIDIsIDg3LCA2OV0sXG5bNCwgNjksIDQzLCAxLCA3MCwgNDRdLFxuWzYsIDQzLCAxOSwgMiwgNDQsIDIwXSxcbls2LCA0MywgMTUsIDIsIDQ0LCAxNl1cbi8vTk9URSBhZGRlZCBieSBSeWFuIERheS50byBtYWtlIGdyZWF0ZXIgdGhhbiB2ZXJzaW9uIDEwIHFyY29kZXNcbi8vIHRoaXMgdGFibGUgc3RhcnRzIG9uIHBhZ2UgNDAgb2YgdGhlIHNwZWMgUERGLiBnb29nbGUgSVNPL0lFQyAxODAwNFxuLy8gMTFcbixbNCwxMDEsODFdXG4sWzEsODAsNTAsNCw4MSw1MV1cbixbNCw1MCwyMiw0LDUxLDIzXVxuLFszLDM2LDEyLDgsMzcsMTNdXG4vLzEyXG4sWzIsMTE2LDkyLDIsMTE3LDkzXVxuLFs2LDU4LDM2LDIsNTksMzddXG4sWzQsNDYsMjAsNiw0NywyMV1cbixbNyw0MiwxNCw0LDQzLDE1XVxuLy8xM1xuLFs0LDEzMywxMDddXG4sWzgsNTksMzcsMSw2MCwzOF1cbixbOCw0NCwyMCw0LDQ1LDIxXVxuLFsxMiwzMywxMSw0LDM0LDEyXVxuLy8xNFxuLFszLDE0NSwxMTUsMSwxNDYsMTE2XVxuLFs0LDY0LDQwLDUsNjUsNDFdXG4sWzExLDM2LDE2LDUsMzcsMTddXG4sWzExLDM2LDEyLDUsMzcsMTNdXG4vLzE1XG4sWzUsMTA5LDg3LDEsMTEwLDg4XVxuLFs1LDY1LDQxLDUsNjYsNDJdXG4sWzUsNTQsMjQsNyw1NSwyNV1cbixbMTEsMzYsMTIsNywzNywxM11cbi8vMTZcbixbNSwxMjIsOTgsMSwxMjMsOTldXG4sWzcsNzMsNDUsMyw3NCw0Nl1cbixbMTUsNDMsMTksMiw0NCwyMF1cbixbMyw0NSwxNSwxMyw0NiwxNl1cbi8vMTdcbixbMSwxMzUsMTA3LDUsMTM2LDEwOF1cbixbMTAsNzQsNDYsMSw3NSw0N11cbixbMSw1MCwyMiwxNSw1MSwyM11cbixbMiw0MiwxNCwxNyw0MywxNV1cbi8vMThcbixbNSwxNTAsMTIwLDEsMTUxLDEyMV1cbixbOSw2OSw0Myw0LDcwLDQ0XVxuLFsxNyw1MCwyMiwxLDUxLDIzXVxuLFsyLDQyLDE0LDE5LDQzLDE1XVxuLy8xOVxuLFszLDE0MSwxMTMsNCwxNDIsMTE0XVxuLFszLDcwLDQ0LDExLDcxLDQ1XVxuLFsxNyw0NywyMSw0LDQ4LDIyXVxuLFs5LDM5LDEzLDE2LDQwLDE0XVxuLy8yMFxuLFszLDEzNSwxMDcsNSwxMzYsMTA4XVxuLFszLDY3LDQxLDEzLDY4LDQyXVxuLFsxNSw1NCwyNCw1LDU1LDI1XVxuLFsxNSw0MywxNSwxMCw0NCwxNl1cbi8vMjFcbixbNCwxNDQsMTE2LDQsMTQ1LDExN11cbixbMTcsNjgsNDJdXG4sWzE3LDUwLDIyLDYsNTEsMjNdXG4sWzE5LDQ2LDE2LDYsNDcsMTddXG4vLzIyXG4sWzIsMTM5LDExMSw3LDE0MCwxMTJdXG4sWzE3LDc0LDQ2XVxuLFs3LDU0LDI0LDE2LDU1LDI1XVxuLFszNCwzNywxM11cbi8vMjNcbixbNCwxNTEsMTIxLDUsMTUyLDEyMl1cbixbNCw3NSw0NywxNCw3Niw0OF1cbixbMTEsNTQsMjQsMTQsNTUsMjVdXG4sWzE2LDQ1LDE1LDE0LDQ2LDE2XVxuLy8yNFxuLFs2LDE0NywxMTcsNCwxNDgsMTE4XVxuLFs2LDczLDQ1LDE0LDc0LDQ2XVxuLFsxMSw1NCwyNCwxNiw1NSwyNV1cbixbMzAsNDYsMTYsMiw0NywxN11cbi8vMjVcbixbOCwxMzIsMTA2LDQsMTMzLDEwN11cbixbOCw3NSw0NywxMyw3Niw0OF1cbixbNyw1NCwyNCwyMiw1NSwyNV1cbixbMjIsNDUsMTUsMTMsNDYsMTZdXG4vLzI2XG4sWzEwLDE0MiwxMTQsMiwxNDMsMTE1XVxuLFsxOSw3NCw0Niw0LDc1LDQ3XVxuLFsyOCw1MCwyMiw2LDUxLDIzXVxuLFszMyw0NiwxNiw0LDQ3LDE3XVxuLy8yN1xuLFs4LDE1MiwxMjIsNCwxNTMsMTIzXVxuLFsyMiw3Myw0NSwzLDc0LDQ2XVxuLFs4LDUzLDIzLDI2LDU0LDI0XVxuLFsxMiw0NSwxNSwyOCw0NiwxNl1cbi8vMjhcbixbMywxNDcsMTE3LDEwLDE0OCwxMThdXG4sWzMsNzMsNDUsMjMsNzQsNDZdXG4sWzQsNTQsMjQsMzEsNTUsMjVdXG4sWzExLDQ1LDE1LDMxLDQ2LDE2XVxuLy8yOVxuLFs3LDE0NiwxMTYsNywxNDcsMTE3XVxuLFsyMSw3Myw0NSw3LDc0LDQ2XVxuLFsxLDUzLDIzLDM3LDU0LDI0XVxuLFsxOSw0NSwxNSwyNiw0NiwxNl1cbi8vMzBcbixbNSwxNDUsMTE1LDEwLDE0NiwxMTZdXG4sWzE5LDc1LDQ3LDEwLDc2LDQ4XVxuLFsxNSw1NCwyNCwyNSw1NSwyNV1cbixbMjMsNDUsMTUsMjUsNDYsMTZdXG4vLzMxXG4sWzEzLDE0NSwxMTUsMywxNDYsMTE2XVxuLFsyLDc0LDQ2LDI5LDc1LDQ3XVxuLFs0Miw1NCwyNCwxLDU1LDI1XVxuLFsyMyw0NSwxNSwyOCw0NiwxNl1cbi8vMzJcbixbMTcsMTQ1LDExNV1cbixbMTAsNzQsNDYsMjMsNzUsNDddXG4sWzEwLDU0LDI0LDM1LDU1LDI1XVxuLFsxOSw0NSwxNSwzNSw0NiwxNl1cbi8vMzNcbixbMTcsMTQ1LDExNSwxLDE0NiwxMTZdXG4sWzE0LDc0LDQ2LDIxLDc1LDQ3XVxuLFsyOSw1NCwyNCwxOSw1NSwyNV1cbixbMTEsNDUsMTUsNDYsNDYsMTZdXG4vLzM0XG4sWzEzLDE0NSwxMTUsNiwxNDYsMTE2XVxuLFsxNCw3NCw0NiwyMyw3NSw0N11cbixbNDQsNTQsMjQsNyw1NSwyNV1cbixbNTksNDYsMTYsMSw0NywxN11cbi8vMzVcbixbMTIsMTUxLDEyMSw3LDE1MiwxMjJdXG4sWzEyLDc1LDQ3LDI2LDc2LDQ4XVxuLFszOSw1NCwyNCwxNCw1NSwyNV1cbixbMjIsNDUsMTUsNDEsNDYsMTZdXG4vLzM2XG4sWzYsMTUxLDEyMSwxNCwxNTIsMTIyXVxuLFs2LDc1LDQ3LDM0LDc2LDQ4XVxuLFs0Niw1NCwyNCwxMCw1NSwyNV1cbixbMiw0NSwxNSw2NCw0NiwxNl1cbi8vMzdcbixbMTcsMTUyLDEyMiw0LDE1MywxMjNdXG4sWzI5LDc0LDQ2LDE0LDc1LDQ3XVxuLFs0OSw1NCwyNCwxMCw1NSwyNV1cbixbMjQsNDUsMTUsNDYsNDYsMTZdXG4vLzM4XG4sWzQsMTUyLDEyMiwxOCwxNTMsMTIzXVxuLFsxMyw3NCw0NiwzMiw3NSw0N11cbixbNDgsNTQsMjQsMTQsNTUsMjVdXG4sWzQyLDQ1LDE1LDMyLDQ2LDE2XVxuLy8zOVxuLFsyMCwxNDcsMTE3LDQsMTQ4LDExOF1cbixbNDAsNzUsNDcsNyw3Niw0OF1cbixbNDMsNTQsMjQsMjIsNTUsMjVdXG4sWzEwLDQ1LDE1LDY3LDQ2LDE2XVxuLy80MFxuLFsxOSwxNDgsMTE4LDYsMTQ5LDExOV1cbixbMTgsNzUsNDcsMzEsNzYsNDhdXG4sWzM0LDU0LDI0LDM0LDU1LDI1XVxuLFsyMCw0NSwxNSw2MSw0NiwxNl1cdFxuXTtcblxuUVJSU0Jsb2NrLmdldFJTQmxvY2tzID0gZnVuY3Rpb24odHlwZU51bWJlciwgZXJyb3JDb3JyZWN0TGV2ZWwpIHtcblx0XG5cdHZhciByc0Jsb2NrID0gUVJSU0Jsb2NrLmdldFJzQmxvY2tUYWJsZSh0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3RMZXZlbCk7XG5cdFxuXHRpZiAocnNCbG9jayA9PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJiYWQgcnMgYmxvY2sgQCB0eXBlTnVtYmVyOlwiICsgdHlwZU51bWJlciArIFwiL2Vycm9yQ29ycmVjdExldmVsOlwiICsgZXJyb3JDb3JyZWN0TGV2ZWwpO1xuXHR9XG5cblx0dmFyIGxlbmd0aCA9IHJzQmxvY2subGVuZ3RoIC8gMztcblx0XG5cdHZhciBsaXN0ID0gbmV3IEFycmF5KCk7XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cblx0XHR2YXIgY291bnQgPSByc0Jsb2NrW2kgKiAzICsgMF07XG5cdFx0dmFyIHRvdGFsQ291bnQgPSByc0Jsb2NrW2kgKiAzICsgMV07XG5cdFx0dmFyIGRhdGFDb3VudCAgPSByc0Jsb2NrW2kgKiAzICsgMl07XG5cblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNvdW50OyBqKyspIHtcblx0XHRcdGxpc3QucHVzaChuZXcgUVJSU0Jsb2NrKHRvdGFsQ291bnQsIGRhdGFDb3VudCkgKTtcdFxuXHRcdH1cblx0fVxuXHRcblx0cmV0dXJuIGxpc3Q7XG59XG5cblFSUlNCbG9jay5nZXRSc0Jsb2NrVGFibGUgPSBmdW5jdGlvbih0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3RMZXZlbCkge1xuXG5cdHN3aXRjaChlcnJvckNvcnJlY3RMZXZlbCkge1xuXHRjYXNlIFFSRXJyb3JDb3JyZWN0TGV2ZWwuTCA6XG5cdFx0cmV0dXJuIFFSUlNCbG9jay5SU19CTE9DS19UQUJMRVsodHlwZU51bWJlciAtIDEpICogNCArIDBdO1xuXHRjYXNlIFFSRXJyb3JDb3JyZWN0TGV2ZWwuTSA6XG5cdFx0cmV0dXJuIFFSUlNCbG9jay5SU19CTE9DS19UQUJMRVsodHlwZU51bWJlciAtIDEpICogNCArIDFdO1xuXHRjYXNlIFFSRXJyb3JDb3JyZWN0TGV2ZWwuUSA6XG5cdFx0cmV0dXJuIFFSUlNCbG9jay5SU19CTE9DS19UQUJMRVsodHlwZU51bWJlciAtIDEpICogNCArIDJdO1xuXHRjYXNlIFFSRXJyb3JDb3JyZWN0TGV2ZWwuSCA6XG5cdFx0cmV0dXJuIFFSUlNCbG9jay5SU19CTE9DS19UQUJMRVsodHlwZU51bWJlciAtIDEpICogNCArIDNdO1xuXHRkZWZhdWx0IDpcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG59XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUkJpdEJ1ZmZlclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gUVJCaXRCdWZmZXIoKSB7XG5cdHRoaXMuYnVmZmVyID0gbmV3IEFycmF5KCk7XG5cdHRoaXMubGVuZ3RoID0gMDtcbn1cblxuUVJCaXRCdWZmZXIucHJvdG90eXBlID0ge1xuXG5cdGdldCA6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0dmFyIGJ1ZkluZGV4ID0gTWF0aC5mbG9vcihpbmRleCAvIDgpO1xuXHRcdHJldHVybiAoICh0aGlzLmJ1ZmZlcltidWZJbmRleF0gPj4+ICg3IC0gaW5kZXggJSA4KSApICYgMSkgPT0gMTtcblx0fSxcblx0XG5cdHB1dCA6IGZ1bmN0aW9uKG51bSwgbGVuZ3RoKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5wdXRCaXQoICggKG51bSA+Pj4gKGxlbmd0aCAtIGkgLSAxKSApICYgMSkgPT0gMSk7XG5cdFx0fVxuXHR9LFxuXHRcblx0Z2V0TGVuZ3RoSW5CaXRzIDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMubGVuZ3RoO1xuXHR9LFxuXHRcblx0cHV0Qml0IDogZnVuY3Rpb24oYml0KSB7XG5cdFxuXHRcdHZhciBidWZJbmRleCA9IE1hdGguZmxvb3IodGhpcy5sZW5ndGggLyA4KTtcblx0XHRpZiAodGhpcy5idWZmZXIubGVuZ3RoIDw9IGJ1ZkluZGV4KSB7XG5cdFx0XHR0aGlzLmJ1ZmZlci5wdXNoKDApO1xuXHRcdH1cblx0XG5cdFx0aWYgKGJpdCkge1xuXHRcdFx0dGhpcy5idWZmZXJbYnVmSW5kZXhdIHw9ICgweDgwID4+PiAodGhpcy5sZW5ndGggJSA4KSApO1xuXHRcdH1cblx0XG5cdFx0dGhpcy5sZW5ndGgrKztcblx0fVxufTtcbiIsInZhciBwcm90byA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IHByb3RvXG5cbnByb3RvLmZyb20gPSByZXF1aXJlKCcuL2Zyb20uanMnKVxucHJvdG8udG8gPSByZXF1aXJlKCcuL3RvLmpzJylcbnByb3RvLmlzID0gcmVxdWlyZSgnLi9pcy5qcycpXG5wcm90by5zdWJhcnJheSA9IHJlcXVpcmUoJy4vc3ViYXJyYXkuanMnKVxucHJvdG8uam9pbiA9IHJlcXVpcmUoJy4vam9pbi5qcycpXG5wcm90by5jb3B5ID0gcmVxdWlyZSgnLi9jb3B5LmpzJylcbnByb3RvLmNyZWF0ZSA9IHJlcXVpcmUoJy4vY3JlYXRlLmpzJylcblxubWl4KHJlcXVpcmUoJy4vcmVhZC5qcycpLCBwcm90bylcbm1peChyZXF1aXJlKCcuL3dyaXRlLmpzJyksIHByb3RvKVxuXG5mdW5jdGlvbiBtaXgoZnJvbSwgaW50bykge1xuICBmb3IodmFyIGtleSBpbiBmcm9tKSB7XG4gICAgaW50b1trZXldID0gZnJvbVtrZXldXG4gIH1cbn1cbiIsIihmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheShiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFycjtcblx0XG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnO1xuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHRwbGFjZUhvbGRlcnMgPSBiNjQuaW5kZXhPZignPScpO1xuXHRcdHBsYWNlSG9sZGVycyA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gcGxhY2VIb2xkZXJzIDogMDtcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IFtdOy8vbmV3IFVpbnQ4QXJyYXkoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKTtcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aDtcblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChsb29rdXAuaW5kZXhPZihiNjRbaV0pIDw8IDE4KSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDFdKSA8PCAxMikgfCAobG9va3VwLmluZGV4T2YoYjY0W2kgKyAyXSkgPDwgNikgfCBsb29rdXAuaW5kZXhPZihiNjRbaSArIDNdKTtcblx0XHRcdGFyci5wdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpO1xuXHRcdFx0YXJyLnB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOCk7XG5cdFx0XHRhcnIucHVzaCh0bXAgJiAweEZGKTtcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAobG9va3VwLmluZGV4T2YoYjY0W2ldKSA8PCAyKSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDFdKSA+PiA0KTtcblx0XHRcdGFyci5wdXNoKHRtcCAmIDB4RkYpO1xuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAobG9va3VwLmluZGV4T2YoYjY0W2ldKSA8PCAxMCkgfCAobG9va3VwLmluZGV4T2YoYjY0W2kgKyAxXSkgPDwgNCkgfCAobG9va3VwLmluZGV4T2YoYjY0W2kgKyAyXSkgPj4gMik7XG5cdFx0XHRhcnIucHVzaCgodG1wID4+IDgpICYgMHhGRik7XG5cdFx0XHRhcnIucHVzaCh0bXAgJiAweEZGKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyO1xuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoO1xuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDYgJiAweDNGXSArIGxvb2t1cFtudW0gJiAweDNGXTtcblx0XHR9O1xuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSk7XG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApO1xuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdO1xuXHRcdFx0XHRvdXRwdXQgKz0gbG9va3VwW3RlbXAgPj4gMl07XG5cdFx0XHRcdG91dHB1dCArPSBsb29rdXBbKHRlbXAgPDwgNCkgJiAweDNGXTtcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKTtcblx0XHRcdFx0b3V0cHV0ICs9IGxvb2t1cFt0ZW1wID4+IDEwXTtcblx0XHRcdFx0b3V0cHV0ICs9IGxvb2t1cFsodGVtcCA+PiA0KSAmIDB4M0ZdO1xuXHRcdFx0XHRvdXRwdXQgKz0gbG9va3VwWyh0ZW1wIDw8IDIpICYgMHgzRl07XG5cdFx0XHRcdG91dHB1dCArPSAnPSc7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHRtb2R1bGUuZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5O1xuXHRtb2R1bGUuZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NDtcbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHRvX3V0ZjhcblxudmFyIG91dCA9IFtdXG4gICwgY29sID0gW11cbiAgLCBmY2MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlXG4gICwgbWFzayA9IFsweDQwLCAweDIwLCAweDEwLCAweDA4LCAweDA0LCAweDAyLCAweDAxXVxuICAsIHVubWFzayA9IFtcbiAgICAgIDB4MDBcbiAgICAsIDB4MDFcbiAgICAsIDB4MDIgfCAweDAxXG4gICAgLCAweDA0IHwgMHgwMiB8IDB4MDFcbiAgICAsIDB4MDggfCAweDA0IHwgMHgwMiB8IDB4MDFcbiAgICAsIDB4MTAgfCAweDA4IHwgMHgwNCB8IDB4MDIgfCAweDAxXG4gICAgLCAweDIwIHwgMHgxMCB8IDB4MDggfCAweDA0IHwgMHgwMiB8IDB4MDFcbiAgICAsIDB4NDAgfCAweDIwIHwgMHgxMCB8IDB4MDggfCAweDA0IHwgMHgwMiB8IDB4MDFcbiAgXVxuXG5mdW5jdGlvbiB0b191dGY4KGJ5dGVzLCBzdGFydCwgZW5kKSB7XG4gIHN0YXJ0ID0gc3RhcnQgPT09IHVuZGVmaW5lZCA/IDAgOiBzdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGJ5dGVzLmxlbmd0aCA6IGVuZFxuXG4gIHZhciBpZHggPSAwXG4gICAgLCBoaSA9IDB4ODBcbiAgICAsIGNvbGxlY3RpbmcgPSAwXG4gICAgLCBwb3NcbiAgICAsIGJ5XG5cbiAgY29sLmxlbmd0aCA9XG4gIG91dC5sZW5ndGggPSAwXG5cbiAgd2hpbGUoaWR4IDwgYnl0ZXMubGVuZ3RoKSB7XG4gICAgYnkgPSBieXRlc1tpZHhdXG4gICAgaWYoIWNvbGxlY3RpbmcgJiYgYnkgJiBoaSkge1xuICAgICAgcG9zID0gZmluZF9wYWRfcG9zaXRpb24oYnkpXG4gICAgICBjb2xsZWN0aW5nICs9IHBvc1xuICAgICAgaWYocG9zIDwgOCkge1xuICAgICAgICBjb2xbY29sLmxlbmd0aF0gPSBieSAmIHVubWFza1s2IC0gcG9zXVxuICAgICAgfVxuICAgIH0gZWxzZSBpZihjb2xsZWN0aW5nKSB7XG4gICAgICBjb2xbY29sLmxlbmd0aF0gPSBieSAmIHVubWFza1s2XVxuICAgICAgLS1jb2xsZWN0aW5nXG4gICAgICBpZighY29sbGVjdGluZyAmJiBjb2wubGVuZ3RoKSB7XG4gICAgICAgIG91dFtvdXQubGVuZ3RoXSA9IGZjYyhyZWR1Y2VkKGNvbCwgcG9zKSlcbiAgICAgICAgY29sLmxlbmd0aCA9IDBcbiAgICAgIH1cbiAgICB9IGVsc2UgeyBcbiAgICAgIG91dFtvdXQubGVuZ3RoXSA9IGZjYyhieSlcbiAgICB9XG4gICAgKytpZHhcbiAgfVxuICBpZihjb2wubGVuZ3RoICYmICFjb2xsZWN0aW5nKSB7XG4gICAgb3V0W291dC5sZW5ndGhdID0gZmNjKHJlZHVjZWQoY29sLCBwb3MpKVxuICAgIGNvbC5sZW5ndGggPSAwXG4gIH1cbiAgcmV0dXJuIG91dC5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBmaW5kX3BhZF9wb3NpdGlvbihieXQpIHtcbiAgZm9yKHZhciBpID0gMDsgaSA8IDc7ICsraSkge1xuICAgIGlmKCEoYnl0ICYgbWFza1tpXSkpIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHJlZHVjZWQobGlzdCkge1xuICB2YXIgb3V0ID0gMFxuICBmb3IodmFyIGkgPSAwLCBsZW4gPSBsaXN0Lmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgb3V0IHw9IGxpc3RbaV0gPDwgKChsZW4gLSBpIC0gMSkgKiA2KVxuICB9XG4gIHJldHVybiBvdXRcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gY29weVxuXG52YXIgc2xpY2UgPSBbXS5zbGljZVxuXG5mdW5jdGlvbiBjb3B5KHNvdXJjZSwgdGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHNvdXJjZV9zdGFydCwgc291cmNlX2VuZCkge1xuICB0YXJnZXRfc3RhcnQgPSBhcmd1bWVudHMubGVuZ3RoIDwgMyA/IDAgOiB0YXJnZXRfc3RhcnRcbiAgc291cmNlX3N0YXJ0ID0gYXJndW1lbnRzLmxlbmd0aCA8IDQgPyAwIDogc291cmNlX3N0YXJ0XG4gIHNvdXJjZV9lbmQgPSBhcmd1bWVudHMubGVuZ3RoIDwgNSA/IHNvdXJjZS5sZW5ndGggOiBzb3VyY2VfZW5kXG5cbiAgaWYoc291cmNlX2VuZCA9PT0gc291cmNlX3N0YXJ0KSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBpZih0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmKHNvdXJjZV9lbmQgPiBzb3VyY2UubGVuZ3RoKSB7XG4gICAgc291cmNlX2VuZCA9IHNvdXJjZS5sZW5ndGhcbiAgfVxuXG4gIGlmKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBzb3VyY2VfZW5kIC0gc291cmNlX3N0YXJ0KSB7XG4gICAgc291cmNlX2VuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuICB9XG5cbiAgaWYoc291cmNlLmJ1ZmZlciAhPT0gdGFyZ2V0LmJ1ZmZlcikge1xuICAgIHJldHVybiBmYXN0X2NvcHkoc291cmNlLCB0YXJnZXQsIHRhcmdldF9zdGFydCwgc291cmNlX3N0YXJ0LCBzb3VyY2VfZW5kKVxuICB9XG4gIHJldHVybiBzbG93X2NvcHkoc291cmNlLCB0YXJnZXQsIHRhcmdldF9zdGFydCwgc291cmNlX3N0YXJ0LCBzb3VyY2VfZW5kKVxufVxuXG5mdW5jdGlvbiBmYXN0X2NvcHkoc291cmNlLCB0YXJnZXQsIHRhcmdldF9zdGFydCwgc291cmNlX3N0YXJ0LCBzb3VyY2VfZW5kKSB7XG4gIHZhciBsZW4gPSAoc291cmNlX2VuZCAtIHNvdXJjZV9zdGFydCkgKyB0YXJnZXRfc3RhcnRcblxuICBmb3IodmFyIGkgPSB0YXJnZXRfc3RhcnQsIGogPSBzb3VyY2Vfc3RhcnQ7XG4gICAgICBpIDwgbGVuO1xuICAgICAgKytpLFxuICAgICAgKytqKSB7XG4gICAgdGFyZ2V0W2ldID0gc291cmNlW2pdXG4gIH1cbn1cblxuZnVuY3Rpb24gc2xvd19jb3B5KGZyb20sIHRvLCBqLCBpLCBqZW5kKSB7XG4gIC8vIHRoZSBidWZmZXJzIGNvdWxkIG92ZXJsYXAuXG4gIHZhciBpZW5kID0gamVuZCArIGlcbiAgICAsIHRtcCA9IG5ldyBVaW50OEFycmF5KHNsaWNlLmNhbGwoZnJvbSwgaSwgaWVuZCkpXG4gICAgLCB4ID0gMFxuXG4gIGZvcig7IGkgPCBpZW5kOyArK2ksICsreCkge1xuICAgIHRvW2orK10gPSB0bXBbeF1cbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaXplKSB7XG4gIHJldHVybiBuZXcgVWludDhBcnJheShzaXplKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmcm9tXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxuXG52YXIgZGVjb2RlcnMgPSB7XG4gICAgaGV4OiBmcm9tX2hleFxuICAsIHV0Zjg6IGZyb21fdXRmXG4gICwgYmFzZTY0OiBmcm9tX2Jhc2U2NFxufVxuXG5mdW5jdGlvbiBmcm9tKHNvdXJjZSwgZW5jb2RpbmcpIHtcbiAgaWYoQXJyYXkuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHNvdXJjZSlcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVyc1tlbmNvZGluZyB8fCAndXRmOCddKHNvdXJjZSlcbn1cblxuZnVuY3Rpb24gZnJvbV9oZXgoc3RyKSB7XG4gIHZhciBzaXplID0gc3RyLmxlbmd0aCAvIDJcbiAgICAsIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHNpemUpXG4gICAgLCBjaGFyYWN0ZXIgPSAnJ1xuXG4gIGZvcih2YXIgaSA9IDAsIGxlbiA9IHN0ci5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGNoYXJhY3RlciArPSBzdHIuY2hhckF0KGkpXG5cbiAgICBpZihpID4gMCAmJiAoaSAlIDIpID09PSAxKSB7XG4gICAgICBidWZbaT4+PjFdID0gcGFyc2VJbnQoY2hhcmFjdGVyLCAxNilcbiAgICAgIGNoYXJhY3RlciA9ICcnIFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYgXG59XG5cbmZ1bmN0aW9uIGZyb21fdXRmKHN0cikge1xuICB2YXIgYnl0ZXMgPSBbXVxuICAgICwgdG1wXG4gICAgLCBjaFxuXG4gIGZvcih2YXIgaSA9IDAsIGxlbiA9IHN0ci5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGNoID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZihjaCAmIDB4ODApIHtcbiAgICAgIHRtcCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuY2hhckF0KGkpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yKHZhciBqID0gMCwgamxlbiA9IHRtcC5sZW5ndGg7IGogPCBqbGVuOyArK2opIHtcbiAgICAgICAgYnl0ZXNbYnl0ZXMubGVuZ3RoXSA9IHBhcnNlSW50KHRtcFtqXSwgMTYpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ5dGVzW2J5dGVzLmxlbmd0aF0gPSBjaCBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnl0ZXMpXG59XG5cbmZ1bmN0aW9uIGZyb21fYmFzZTY0KHN0cikge1xuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0LnRvQnl0ZUFycmF5KHN0cikpIFxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICByZXR1cm4gYnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gam9pblxuXG5mdW5jdGlvbiBqb2luKHRhcmdldHMsIGhpbnQpIHtcbiAgaWYoIXRhcmdldHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KDApXG4gIH1cblxuICB2YXIgbGVuID0gaGludCAhPT0gdW5kZWZpbmVkID8gaGludCA6IGdldF9sZW5ndGgodGFyZ2V0cylcbiAgICAsIG91dCA9IG5ldyBVaW50OEFycmF5KGxlbilcbiAgICAsIGN1ciA9IHRhcmdldHNbMF1cbiAgICAsIGN1cmxlbiA9IGN1ci5sZW5ndGhcbiAgICAsIGN1cmlkeCA9IDBcbiAgICAsIGN1cm9mZiA9IDBcbiAgICAsIGkgPSAwXG5cbiAgd2hpbGUoaSA8IGxlbikge1xuICAgIGlmKGN1cm9mZiA9PT0gY3VybGVuKSB7XG4gICAgICBjdXJvZmYgPSAwXG4gICAgICArK2N1cmlkeFxuICAgICAgY3VyID0gdGFyZ2V0c1tjdXJpZHhdXG4gICAgICBjdXJsZW4gPSBjdXIgJiYgY3VyLmxlbmd0aFxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgb3V0W2krK10gPSBjdXJbY3Vyb2ZmKytdIFxuICB9XG5cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBnZXRfbGVuZ3RoKHRhcmdldHMpIHtcbiAgdmFyIHNpemUgPSAwXG4gIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRhcmdldHMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBzaXplICs9IHRhcmdldHNbaV0uYnl0ZUxlbmd0aFxuICB9XG4gIHJldHVybiBzaXplXG59XG4iLCJ2YXIgcHJvdG9cbiAgLCBtYXBcblxubW9kdWxlLmV4cG9ydHMgPSBwcm90byA9IHt9XG5cbm1hcCA9IHR5cGVvZiBXZWFrTWFwID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBuZXcgV2Vha01hcFxuXG5wcm90by5nZXQgPSAhbWFwID8gbm9fd2Vha21hcF9nZXQgOiBnZXRcblxuZnVuY3Rpb24gbm9fd2Vha21hcF9nZXQodGFyZ2V0KSB7XG4gIHJldHVybiBuZXcgRGF0YVZpZXcodGFyZ2V0LmJ1ZmZlciwgMClcbn1cblxuZnVuY3Rpb24gZ2V0KHRhcmdldCkge1xuICB2YXIgb3V0ID0gbWFwLmdldCh0YXJnZXQuYnVmZmVyKVxuICBpZighb3V0KSB7XG4gICAgbWFwLnNldCh0YXJnZXQuYnVmZmVyLCBvdXQgPSBuZXcgRGF0YVZpZXcodGFyZ2V0LmJ1ZmZlciwgMCkpXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmVhZFVJbnQ4OiAgICAgIHJlYWRfdWludDhcbiAgLCByZWFkSW50ODogICAgICAgcmVhZF9pbnQ4XG4gICwgcmVhZFVJbnQxNkxFOiAgIHJlYWRfdWludDE2X2xlXG4gICwgcmVhZFVJbnQzMkxFOiAgIHJlYWRfdWludDMyX2xlXG4gICwgcmVhZEludDE2TEU6ICAgIHJlYWRfaW50MTZfbGVcbiAgLCByZWFkSW50MzJMRTogICAgcmVhZF9pbnQzMl9sZVxuICAsIHJlYWRGbG9hdExFOiAgICByZWFkX2Zsb2F0X2xlXG4gICwgcmVhZERvdWJsZUxFOiAgIHJlYWRfZG91YmxlX2xlXG4gICwgcmVhZFVJbnQxNkJFOiAgIHJlYWRfdWludDE2X2JlXG4gICwgcmVhZFVJbnQzMkJFOiAgIHJlYWRfdWludDMyX2JlXG4gICwgcmVhZEludDE2QkU6ICAgIHJlYWRfaW50MTZfYmVcbiAgLCByZWFkSW50MzJCRTogICAgcmVhZF9pbnQzMl9iZVxuICAsIHJlYWRGbG9hdEJFOiAgICByZWFkX2Zsb2F0X2JlXG4gICwgcmVhZERvdWJsZUJFOiAgIHJlYWRfZG91YmxlX2JlXG59XG5cbnZhciBtYXAgPSByZXF1aXJlKCcuL21hcHBlZC5qcycpXG5cbmZ1bmN0aW9uIHJlYWRfdWludDgodGFyZ2V0LCBhdCkge1xuICByZXR1cm4gdGFyZ2V0W2F0XVxufVxuXG5mdW5jdGlvbiByZWFkX2ludDgodGFyZ2V0LCBhdCkge1xuICB2YXIgdiA9IHRhcmdldFthdF07XG4gIHJldHVybiB2IDwgMHg4MCA/IHYgOiB2IC0gMHgxMDBcbn1cblxuZnVuY3Rpb24gcmVhZF91aW50MTZfbGUodGFyZ2V0LCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5nZXRVaW50MTYoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gcmVhZF91aW50MzJfbGUodGFyZ2V0LCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5nZXRVaW50MzIoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gcmVhZF9pbnQxNl9sZSh0YXJnZXQsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LmdldEludDE2KGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHRydWUpXG59XG5cbmZ1bmN0aW9uIHJlYWRfaW50MzJfbGUodGFyZ2V0LCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5nZXRJbnQzMihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB0cnVlKVxufVxuXG5mdW5jdGlvbiByZWFkX2Zsb2F0X2xlKHRhcmdldCwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuZ2V0RmxvYXQzMihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB0cnVlKVxufVxuXG5mdW5jdGlvbiByZWFkX2RvdWJsZV9sZSh0YXJnZXQsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LmdldEZsb2F0NjQoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gcmVhZF91aW50MTZfYmUodGFyZ2V0LCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5nZXRVaW50MTYoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIHJlYWRfdWludDMyX2JlKHRhcmdldCwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuZ2V0VWludDMyKGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiByZWFkX2ludDE2X2JlKHRhcmdldCwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuZ2V0SW50MTYoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIHJlYWRfaW50MzJfYmUodGFyZ2V0LCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5nZXRJbnQzMihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gcmVhZF9mbG9hdF9iZSh0YXJnZXQsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LmdldEZsb2F0MzIoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIHJlYWRfZG91YmxlX2JlKHRhcmdldCwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuZ2V0RmxvYXQ2NChhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCBmYWxzZSlcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gc3ViYXJyYXlcblxuZnVuY3Rpb24gc3ViYXJyYXkoYnVmLCBmcm9tLCB0bykge1xuICByZXR1cm4gYnVmLnN1YmFycmF5KGZyb20gfHwgMCwgdG8gfHwgYnVmLmxlbmd0aClcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gdG9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG4gICwgdG91dGY4ID0gcmVxdWlyZSgndG8tdXRmOCcpXG5cbnZhciBlbmNvZGVycyA9IHtcbiAgICBoZXg6IHRvX2hleFxuICAsIHV0Zjg6IHRvX3V0ZlxuICAsIGJhc2U2NDogdG9fYmFzZTY0XG59XG5cbmZ1bmN0aW9uIHRvKGJ1ZiwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGVuY29kZXJzW2VuY29kaW5nIHx8ICd1dGY4J10oYnVmKVxufVxuXG5mdW5jdGlvbiB0b19oZXgoYnVmKSB7XG4gIHZhciBzdHIgPSAnJ1xuICAgICwgYnl0XG5cbiAgZm9yKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgYnl0ID0gYnVmW2ldXG4gICAgc3RyICs9ICgoYnl0ICYgMHhGMCkgPj4+IDQpLnRvU3RyaW5nKDE2KVxuICAgIHN0ciArPSAoYnl0ICYgMHgwRikudG9TdHJpbmcoMTYpXG4gIH1cblxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHRvX3V0ZihidWYpIHtcbiAgcmV0dXJuIHRvdXRmOChidWYpXG59XG5cbmZ1bmN0aW9uIHRvX2Jhc2U2NChidWYpIHtcbiAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zilcbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgd3JpdGVVSW50ODogICAgICB3cml0ZV91aW50OFxuICAsIHdyaXRlSW50ODogICAgICAgd3JpdGVfaW50OFxuICAsIHdyaXRlVUludDE2TEU6ICAgd3JpdGVfdWludDE2X2xlXG4gICwgd3JpdGVVSW50MzJMRTogICB3cml0ZV91aW50MzJfbGVcbiAgLCB3cml0ZUludDE2TEU6ICAgIHdyaXRlX2ludDE2X2xlXG4gICwgd3JpdGVJbnQzMkxFOiAgICB3cml0ZV9pbnQzMl9sZVxuICAsIHdyaXRlRmxvYXRMRTogICAgd3JpdGVfZmxvYXRfbGVcbiAgLCB3cml0ZURvdWJsZUxFOiAgIHdyaXRlX2RvdWJsZV9sZVxuICAsIHdyaXRlVUludDE2QkU6ICAgd3JpdGVfdWludDE2X2JlXG4gICwgd3JpdGVVSW50MzJCRTogICB3cml0ZV91aW50MzJfYmVcbiAgLCB3cml0ZUludDE2QkU6ICAgIHdyaXRlX2ludDE2X2JlXG4gICwgd3JpdGVJbnQzMkJFOiAgICB3cml0ZV9pbnQzMl9iZVxuICAsIHdyaXRlRmxvYXRCRTogICAgd3JpdGVfZmxvYXRfYmVcbiAgLCB3cml0ZURvdWJsZUJFOiAgIHdyaXRlX2RvdWJsZV9iZVxufVxuXG52YXIgbWFwID0gcmVxdWlyZSgnLi9tYXBwZWQuanMnKVxuXG5mdW5jdGlvbiB3cml0ZV91aW50OCh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICByZXR1cm4gdGFyZ2V0W2F0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIHdyaXRlX2ludDgodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgcmV0dXJuIHRhcmdldFthdF0gPSB2YWx1ZSA8IDAgPyB2YWx1ZSArIDB4MTAwIDogdmFsdWVcbn1cblxuZnVuY3Rpb24gd3JpdGVfdWludDE2X2xlKHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LnNldFVpbnQxNihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB2YWx1ZSwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gd3JpdGVfdWludDMyX2xlKHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LnNldFVpbnQzMihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB2YWx1ZSwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gd3JpdGVfaW50MTZfbGUodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuc2V0SW50MTYoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdmFsdWUsIHRydWUpXG59XG5cbmZ1bmN0aW9uIHdyaXRlX2ludDMyX2xlKHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LnNldEludDMyKGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHZhbHVlLCB0cnVlKVxufVxuXG5mdW5jdGlvbiB3cml0ZV9mbG9hdF9sZSh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5zZXRGbG9hdDMyKGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHZhbHVlLCB0cnVlKVxufVxuXG5mdW5jdGlvbiB3cml0ZV9kb3VibGVfbGUodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuc2V0RmxvYXQ2NChhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB2YWx1ZSwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gd3JpdGVfdWludDE2X2JlKHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LnNldFVpbnQxNihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB2YWx1ZSwgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIHdyaXRlX3VpbnQzMl9iZSh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5zZXRVaW50MzIoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdmFsdWUsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiB3cml0ZV9pbnQxNl9iZSh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5zZXRJbnQxNihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB2YWx1ZSwgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIHdyaXRlX2ludDMyX2JlKHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LnNldEludDMyKGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHZhbHVlLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gd3JpdGVfZmxvYXRfYmUodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuc2V0RmxvYXQzMihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB2YWx1ZSwgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIHdyaXRlX2RvdWJsZV9iZSh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5zZXRGbG9hdDY0KGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHZhbHVlLCBmYWxzZSlcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9xcmNvZGUtZHJhdy5qcycpOyIsInZhciBleHBlY3QgPSBjaGFpLmV4cGVjdDtcbnZhciBTSyA9IHJlcXVpcmUoJy4uL2pzL3NoYXJlS2l0LmpzJyk7XG5kZXNjcmliZSgnU2hhcmUgS2l0JywgZnVuY3Rpb24oKXtcbiAgICBkZXNjcmliZSgnVGVzdCBVcmwgQ29uY2F0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gZW5jb2RlIHVybCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgc3JjID0gU0sucHJvdG90eXBlLnVybENvbmNhdCh7XG4gICAgICAgICAgICAgICAgYTonYScsXG4gICAgICAgICAgICAgICAgYjonYmJcXC9cXC8nLFxuICAgICAgICAgICAgICAgIGM6ICcxMjM/PyUnLFxuICAgICAgICAgICAgICAgIGQ6IDc3NyxcbiAgICAgICAgICAgICAgICBlOic4ODgnXG4gICAgICAgICAgICB9LCAnaHR0cDovL3d3dy5iYWlkdS5jb20nKTtcbiAgICAgICAgICAgIHZhciBkZXN0ID0gJ2h0dHA6Ly93d3cuYmFpZHUuY29tPycrJ2E9YSZiPWJiXFwvXFwvJmM9MTIzPz8lJmQ9Nzc3JmU9ODg4JztcblxuICAgICAgICAgICAgZXhwZWN0KHNyYykudG8ubm90LmVxdWFsKGRlc3QpO1xuICAgICAgICAgICAgZXhwZWN0KGRlY29kZVVSSUNvbXBvbmVudChzcmMpKS50by5lcXVhbChkZXN0KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnRGV2aWNlIERldGVjdGluZycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGl0KCdzaG91bGQgZGV2aWNlIGRldGVjdGlvbiBnZXR0aW5nIHJpZ2h0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciB1YV8xID0gJ01vemlsbGEvNS4wIChMaW51eDsgVTsgQW5kcm9pZCA0LjAuMzsga28ta3I7IExHLUwxNjBMIEJ1aWxkL0lNTDc0SykgQXBwbGVXZWJraXQvNTM0LjMwIChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi80LjAgTW9iaWxlIFNhZmFyaS81MzQuMzAnO1xuICAgICAgICAgICAgdmFyIHVhXzIgPSAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4zOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMzcuMC4yMDQ5LjAgU2FmYXJpLzUzNy4zNic7XG4gICAgICAgICAgICB2YXIgdWFfMyA9ICdNb3ppbGxhLzUuMCAoaVBhZDsgQ1BVIE9TIDZfMCBsaWtlIE1hYyBPUyBYKSBBcHBsZVdlYktpdC81MzYuMjYgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzYuMCBNb2JpbGUvMTBBNTM1NWQgU2FmYXJpLzg1MzYuMjUnO1xuICAgICAgICAgICAgdmFyIHJlXzEgPSBTSy5wcm90b3R5cGUuZGV0ZWN0RGV2aWNlKHVhXzEpO1xuICAgICAgICAgICAgdmFyIHJlXzIgPSBTSy5wcm90b3R5cGUuZGV0ZWN0RGV2aWNlKHVhXzIpO1xuICAgICAgICAgICAgdmFyIHJlXzMgPSBTSy5wcm90b3R5cGUuZGV0ZWN0RGV2aWNlKHVhXzMpO1xuICAgICAgICAgICAgZXhwZWN0KHJlXzEpLnRvLmVxdWFsKCdwaG9uZScpO1xuICAgICAgICAgICAgZXhwZWN0KHJlXzIpLnRvLmVxdWFsKCdwYycpO1xuICAgICAgICAgICAgZXhwZWN0KHJlXzMpLnRvLmVxdWFsKCdwaG9uZScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBkZXNjcmliZSgnU0sgT2JqZWN0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGV2dDtcbiAgICAgICAgYmVmb3JlRWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcbiAgICAgICAgICAgIGV2dC5pbml0RXZlbnQoJ2NsaWNrJywgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZXNjcmliZSgnU0sgQ29uZmlndXJhdGlvbiBUZXN0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGl0KCdTaG91bGQgZW1wdHkgb2JqZWN0IGhhcyBkZWZhdWx0IG9wdGlvbnMnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSygpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChzaykudG8ubm90LmJlLmFuKCd1bmRlZmluZWQnKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYudGl0bGUpLnRvLmVxdWFsKGRvY3VtZW50LnRpdGxlKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYubGluaykudG8uZXF1YWwobG9jYXRpb24uaHJlZik7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLmRlc2MpLnRvLmVxdWFsKFNLLnByb3RvdHlwZS5maW5kRGVzYygpKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYudHdpdHRlck5hbWUpLnRvLmJlLmFuKCd1bmRlZmluZWQnKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYucHJlZml4KS50by5lcXVhbCgnc2hhcmVLaXQnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBvYmplY3Qgd2l0aCBjb25maWd1cmF0aW9uIGhhcyBzb21lIG9wdGlvbnMnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciBvID0ge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ3RpdGxlJyxcbiAgICAgICAgICAgICAgICAgICAgbGluazogJ2h0dHA6Ly9iYWlkdS5jb20nLFxuICAgICAgICAgICAgICAgICAgICBkZXNjOiAnVG9kYXkgaXNuXFwnIGFub3RoZXIgZGF5LicsXG4gICAgICAgICAgICAgICAgICAgIHR3aXR0ZXJOYW1lOiAnc3VuYWl3ZW4nXG4gICAgICAgICAgICAgICAgICAgIC8vcHJlZml4OiAneW95b3lvJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIHNrID0gbmV3IFNLKG8pO1xuXG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLnRpdGxlKS50by5lcXVhbChvLnRpdGxlKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYubGluaykudG8uZXF1YWwoby5saW5rKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYuZGVzYykudG8uZXF1YWwoby5kZXNjKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYudHdpdHRlck5hbWUpLnRvLmVxdWFsKG8udHdpdHRlck5hbWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZXNjcmliZSgnU0sgaW5pdCBmdW5jdGlvbiBUZXN0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSygpO1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBoYXZlIGVsZW1lbnQgYW5kIGNvcnJlY3QgcHJlZml4JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2sud3JhcEVsZS5jbGFzc05hbWUuaW5kZXhPZignanMtJytzay5iYXNlQ29uZi5wcmVmaXgpKS50by5ub3QuZXF1YWwoLTEpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChzay5xekVsZS5jbGFzc05hbWUuaW5kZXhPZignanMtJytzay5iYXNlQ29uZi5wcmVmaXgrJy1xem9uZScpKS50by5ub3QuZXF1YWwoLTEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnU2hvdWxkIGJpbmQgYSBldmVudCBjb3JyZWN0bHknLCBmdW5jdGlvbihkb25lKXtcbiAgICAgICAgICAgICAgICB2YXIgciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciBoYW5kbGVyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgciA9ICdmaXJlJztcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0KHIpLnRvLmVxdWFsKCdmaXJlJyk7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNrLmJpbmQoc2sucXpFbGUsIGhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIHNrLnF6RWxlLmRpc3BhdGNoRXZlbnQoZXZ0LCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZGVzY3JpYmUoJ1NLIENvbnN0cnVjdG9yJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGl0KCdTaG91bGQgdGhlIGJpbmQgZnVuY3Rpb24gYmUgaW52b2tlZCAzIHRpbWVzJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAvLyB3ZWliby1zaGFyaW5nIGZ1bmN0aW9uIGRvbid0IG5lZWQgdG8gYmluZCBhbiBldmVudC5cbiAgICAgICAgICAgICAgICB2YXIgc3B5ID0gc2lub24uc3B5KFNLLnByb3RvdHlwZSwgJ2JpbmQnKTtcbiAgICAgICAgICAgICAgICB2YXIgc2sgPSBuZXcgU0soKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc3B5LmNhbGxDb3VudCkudG8uZXF1YWwoMyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRlc2NyaWJlKCdTSyBlbGVtZW50c1xcJyBldmVudCBiaW5kaW5nJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGl0KCdTaG91bGQgaGFuZGxlciBiZSBmaXJlZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIHN0ID0gc2lub24uc3R1YihTSy5wcm90b3R5cGUsICdxem9uZUZ1bmMnKTtcbiAgICAgICAgICAgICAgICB2YXIgc2sgPSBuZXcgU0soKTtcbiAgICAgICAgICAgICAgICBzay5xekVsZS5kaXNwYXRjaEV2ZW50KGV2dCx0cnVlKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc3QuY2FsbENvdW50KS50by5lcXVhbCgxKTtcbiAgICAgICAgICAgICAgICBzdC5yZXN0b3JlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRlc2NyaWJlKCdTSyBvcGVuIHdpbmRvdyBmdW5jdGlvbiB0ZXN0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGl0KCdTaG91bGQgb3BlbiB3aW5kb3cgd2l0aCBjb3JyZWN0IHVybCwgdGl0bGUsIGFuZCBwcm9wcycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgU0sucHJvdG90eXBlLm9wZW5XaW4oe1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICdodHRwOi8vd3d3LmJhaWR1LmNvbScsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnb3BlbiBiYWlkdScsXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbGJhcnM6ICdubycsXG4gICAgICAgICAgICAgICAgICAgIG1lbnViYXI6ICdubycsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ25vJyxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiA2MDAsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiA5MDAsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IDMwMCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRlc2NyaWJlKCdUaGUgUXpvbmUgc2hhcmUgZnVuY3Rpb24nLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBudWxsO1xuICAgICAgICAgICAgdmFyIGNhY2hlID0gU0sucHJvdG90eXBlLm9wZW5XaW47XG4gICAgICAgICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIGZha2VPcGVuV2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFNLLnByb3RvdHlwZS5vcGVuV2luID0gZmFrZU9wZW5XaW47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdTaG91bGQgcXpvbmVGdW5jIG9wZW4gYSB3aW5kb3cgd2l0aCBjb3JyZWN0IG9wdGlvbnMnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSyh7XG4gICAgICAgICAgICAgICAgICAgIGxpbms6ICdodHRwOi8vYmFpZHUuY29tJyxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdxem9uZSBzaGFyZSBmdW5jdGlvbiB0ZXN0JyxcbiAgICAgICAgICAgICAgICAgICAgdHdpdHRlck5hbWU6ICdzdW5haXdlbicsXG4gICAgICAgICAgICAgICAgICAgIGRlc2M6ICd0aGlzIGlzIGEgdGVzdCB0ZXN0aW5nIHF6b25lIHNoYXJlIGZ1bmN0aW9uLidcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHNrLnF6RWxlLmRpc3BhdGNoRXZlbnQoZXZ0LCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLm1lbnViYXIpLnRvLmVxdWFsKCdubycpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLnJlc2l6YWJsZSkudG8uZXF1YWwoJ25vJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3Muc3RhdHVzKS50by5lcXVhbCgnbm8nKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYXJncy50b29sYmFyKS50by5lcXVhbCgnbm8nKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYXJncy50b3ApLnRvLmVxdWFsKDUwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYXJncy5sZWZ0KS50by5lcXVhbCgyMDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLndpZHRoKS50by5lcXVhbCg2MDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLmhlaWdodCkudG8uZXF1YWwoNjUwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYXJncy50aXRsZSkudG8uZXF1YWwoJ1NoYXJpbmcgdG8gUXpvbmUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYWZ0ZXJFYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgU0sucHJvdG90eXBlLm9wZW5XaW4gPSBjYWNoZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZGVzY3JpYmUoJ1RoZSB3ZWNoYXQgc2hhcmUgZnVuY3Rpb24nLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBjb25kdWN0IGNvcnJlY3QgaW5mbyBpbiB3ZWNoYXQgc2hhcmluZycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIGNhY2hlID0gU0sucHJvdG90eXBlLmRldGVjdERldmljZTtcbiAgICAgICAgICAgICAgICBTSy5wcm90b3R5cGUuZGV0ZWN0RGV2aWNlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdwaG9uZSc7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgc2sgPSBuZXcgU0soe1xuICAgICAgICAgICAgICAgICAgICBsaW5rOiBsb2NhdGlvbi5ocmVmLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ3dlY2hhdCBmdW5jdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIGRlc2M6ICd3ZWNoYXQgZnVuY3Rpb24gdGVzdCB5b3Ugd2V0aGVyIHlvdSBsb3ZlIG1lLicsXG4gICAgICAgICAgICAgICAgICAgIHBvcnRyYWl0OiAnaHR0cHM6Ly9kMTN5YWN1cnFqZ2FyYS5jbG91ZGZyb250Lm5ldC91c2Vycy81MjI3Ny9zY3JlZW5zaG90cy8xODA3MzMzL2dpbGxlX2RyaWJiYmxlX2JvcmVhc192MDEtMDEucG5nJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNrLnd4RWxlLmRpc3BhdGNoRXZlbnQoZXZ0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICBTSy5wcm90b3R5cGUuZGV0ZWN0RGV2aWNlID0gY2FjaGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdTaG91bGQgc2hvdyBxcmNvZGUgd2hlbiBpbiBwYyBlbnYnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSyh7XG4gICAgICAgICAgICAgICAgICAgIGxpbms6IGxvY2F0aW9uLmhyZWZcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzay53eEVsZS5kaXNwYXRjaEV2ZW50KGV2dCwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTsiXX0=
