(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/lib/qrcapacitytable.js":[function(require,module,exports){
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

},{"./lib/qrcode-draw.js":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/lib/qrcode-draw.js"}],"/Users/sunaiwen/projects/shareKit/test/shareKit.js":[function(require,module,exports){
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
        window.open(title, url, windowConf);
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

//    for test
    exports.urlConcat = urlConcat;
    exports.findDesc =findDesc;
    exports.SK = SK;
})();
},{"qrcode":"/Users/sunaiwen/projects/shareKit/node_modules/qrcode/qrcodeclient.js"}],"/Users/sunaiwen/projects/shareKit/test/test.js":[function(require,module,exports){
var expect = chai.expect;
var skObj = require('./shareKit.js');
for(var k in skObj) {
    window[k] = skObj[k];
}
describe('Share Kit', function(){
    describe('Test Url Concat', function(){
        it('should return encode url', function(){
            var src = urlConcat({
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
                sk.qzEle.dispatchEvent(evt, true);
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
                var st = sinon.stub(SK.prototype, 'qzoneFunc');
                var sk = new SK();
                sk.qzEle.dispatchEvent(evt,true);
                expect(st.callCount).to.equal(1);
                st.restore();
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
},{"./shareKit.js":"/Users/sunaiwen/projects/shareKit/test/shareKit.js"}]},{},["/Users/sunaiwen/projects/shareKit/test/test.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9xcmNhcGFjaXR5dGFibGUuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9xcmNvZGUtZHJhdy5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3FyY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL25vZGVfbW9kdWxlcy9ib3BzL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvbm9kZV9tb2R1bGVzL3RvLXV0ZjgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL25vZGVfbW9kdWxlcy9ib3BzL3R5cGVkYXJyYXkvY29weS5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvdHlwZWRhcnJheS9jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvcXJjb2RlL25vZGVfbW9kdWxlcy9ib3BzL3R5cGVkYXJyYXkvZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvdHlwZWRhcnJheS9pcy5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvdHlwZWRhcnJheS9qb2luLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy90eXBlZGFycmF5L21hcHBlZC5qcyIsIm5vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvdHlwZWRhcnJheS9yZWFkLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy90eXBlZGFycmF5L3N1YmFycmF5LmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy90eXBlZGFycmF5L3RvLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy90eXBlZGFycmF5L3dyaXRlLmpzIiwibm9kZV9tb2R1bGVzL3FyY29kZS9xcmNvZGVjbGllbnQuanMiLCJ0ZXN0L3NoYXJlS2l0LmpzIiwidGVzdC90ZXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxudGhpcyBjb250YWlucyB0aGUgbWF4IHN0cmluZyBsZW5ndGggZm9yIGFsbCBxciBjb2RlIFZlcnNpb25zIGluIEJpbmFyeSBTYWZlIC8gQnl0ZSBNb2RlXG5lYWNoIGVudHJ5IGlzIGluIHRoZSBvcmRlciBvZiBlcnJvciBjb3JyZWN0IGxldmVsXG5cdFtMLE0sUSxIXVxuXG50aGUgcXJjb2RlIGxpYiBzZXRzIHN0cmFuZ2UgdmFsdWVzIGZvciBRUkVycm9yQ29ycmVjdExldmVsIGhhdmluZyB0byBkbyB3aXRoIG1hc2tpbmcgYWdhaW5zdCBwYXR0ZXJuc1xudGhlIG1heGltdW0gc3RyaW5nIGxlbmd0aCBmb3IgZXJyb3IgY29ycmVjdCBsZXZlbCBIIGlzIDEyNzMgY2hhcmFjdGVycyBsb25nLlxuKi9cblxuZXhwb3J0cy5RUkNhcGFjaXR5VGFibGUgPSBbXG5bMTcsMTQsMTEsN11cbixbMzIsMjYsMjAsMTRdXG4sWzUzLDQyLDMyLDI0XVxuLFs3OCw2Miw0NiwzNF1cbixbMTA2LDg0LDYwLDQ0XVxuLFsxMzQsMTA2LDc0LDU4XVxuLFsxNTQsMTIyLDg2LDY0XVxuLFsxOTIsMTUyLDEwOCw4NF1cbixbMjMwLDE4MCwxMzAsOThdXG4sWzI3MSwyMTMsMTUxLDExOV1cbixbMzIxLDI1MSwxNzcsMTM3XS8vMTFcbixbMzY3LDI4NywyMDMsMTU1XVxuLFs0MjUsMzMxLDI0MSwxNzddXG4sWzQ1OCwzNjIsMjU4LDE5NF1cbixbNTIwLDQxMiwyOTIsMjIwXVxuLFs1ODYsNDUwLDMyMiwyNTBdXG4sWzY0NCw1MDQsMzY0LDI4MF1cbixbNzE4LDU2MCwzOTQsMzEwXVxuLFs3OTIsNjI0LDQ0MiwzMzhdXG4sWzg1OCw2NjYsNDgyLDM4Ml1cbixbOTI5LDcxMSw1MDksNDAzXVxuLFsxMDAzLDc3OSw1NjUsNDM5XVxuLFsxMDkxLDg1Nyw2MTEsNDYxXVxuLFsxMTcxLDkxMSw2NjEsNTExXS8vMjRcbixbMTI3Myw5OTcsNzE1LDUzNV1cbixbMTM2NywxMDU5LDc1MSw1OTNdXG4sWzE0NjUsMTEyNSw4MDUsNjI1XVxuLFsxNTI4LDExOTAsODY4LDY1OF0vLzI4XG4sWzE2MjgsMTI2NCw5MDgsNjk4XVxuLFsxNzMyLDEzNzAsOTgyLDc0Ml1cbixbMTg0MCwxNDUyLDEwMzAsNzkwXVxuLFsxOTUyLDE1MzgsMTExMiw4NDJdLy8zMlxuLFsyMDY4LDE2MjgsMTE2OCw4OThdXG4sWzIxODgsMTcyMiwxMjI4LDk1OF1cbixbMjMwMywxODA5LDEyODMsOTgzXVxuLFsyNDMxLDE5MTEsMTM1MSwxMDUxXS8vMzZcbixbMjU2MywxOTg5LDE0MjMsMTA5M11cbixbMjY5OSwyMDk5LDE0OTksMTEzOV1cbixbMjgwOSwyMjEzLDE1NzksMTIxOV1cbixbMjk1MywyMzMxLDE2NjMsMTI3M10vLzQwXG5dO1xuIiwiLypcbiogY29weXJpZ2h0IDIwMTAtMjAxMiBSeWFuIERheVxuKiBodHRwOi8vZ2l0aHViLmNvbS9zb2xkYWlyL25vZGUtcXJjb2RlXG4qXG4qIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiogICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuKlxuKiBjYW52YXMgZXhhbXBsZSBhbmQgZmFsbGJhY2sgc3VwcG9ydCBleGFtcGxlIHByb3ZpZGVkIGJ5IEpvc2h1YSBLb29cbipcdGh0dHA6Ly9qYWJ0dW5lcy5jb20vbGFicy9xcmNvZGUuaHRtbFxuKlx0XCJJbnN0YW50IFFSQ29kZSBNYXNodXAgYnkgSm9zaHVhIEtvbyFcIlxuKlx0YXMgZmFyIGFzIGkgY2FuIHRlbGwgdGhlIHBhZ2UgYW5kIHRoZSBjb2RlIG9uIHRoZSBwYWdlIGFyZSBwdWJsaWMgZG9tYWluIFxuKlx0XG4qIG9yaWdpbmFsIHRhYmxlIGV4YW1wbGUgYW5kIGxpYnJhcnkgcHJvdmlkZWQgYnkgS2F6dWhpa28gQXJhc2VcbipcdGh0dHA6Ly9kLXByb2plY3QuZ29vZ2xlY29kZS5jb20vc3ZuL3RydW5rL21pc2MvcXJjb2RlL2pzL1xuKlxuKi9cblxudmFyIGJvcHMgPSByZXF1aXJlKCdib3BzJylcbnZhciBRUkNvZGVMaWIgPSByZXF1aXJlKCcuL3FyY29kZS5qcycpO1xudmFyIFFSVmVyc2lvbkNhcGFjaXR5VGFibGUgPSByZXF1aXJlKCcuL3FyY2FwYWNpdHl0YWJsZS5qcycpLlFSQ2FwYWNpdHlUYWJsZTtcbnZhciBRUkNvZGUgPSBRUkNvZGVMaWIuUVJDb2RlO1xuXG5leHBvcnRzLlFSQ29kZURyYXcgPSBRUkNvZGVEcmF3O1xuZXhwb3J0cy5RUlZlcnNpb25DYXBhY2l0eVRhYmxlID0gUVJWZXJzaW9uQ2FwYWNpdHlUYWJsZTtcbmV4cG9ydHMuUVJFcnJvckNvcnJlY3RMZXZlbCA9IFFSQ29kZUxpYi5RUkVycm9yQ29ycmVjdExldmVsO1xuZXhwb3J0cy5RUkNvZGUgPSBRUkNvZGVMaWIuUVJDb2RlO1xuXG5mdW5jdGlvbiBRUkNvZGVEcmF3KCl7fVxuXG5RUkNvZGVEcmF3LnByb3RvdHlwZSA9IHtcbiAgc2NhbGU6NCwvLzQgcHggbW9kdWxlIHNpemVcbiAgZGVmYXVsdE1hcmdpbjoyMCxcbiAgbWFyZ2luU2NhbGVGYWN0b3I6NSxcbiAgQXJyYXk6KHR5cGVvZiBVaW50MzJBcnJheSA9PSAndW5kZWZpbmVkJz9VaW50MzJBcnJheTpBcnJheSksXG4gIC8vIHlvdSBtYXkgY29uZmlndXJlIHRoZSBlcnJvciBiZWhhdmlvciBmb3IgaW5wdXQgc3RyaW5nIHRvbyBsb25nXG4gIGVycm9yQmVoYXZpb3I6e1xuICAgIGxlbmd0aDondHJpbSdcbiAgfSxcbiAgY29sb3I6e1xuICAgIGRhcms6J2JsYWNrJyxcbiAgICBsaWdodDond2hpdGUnXG4gIH0sXG4gIGRlZmF1bHRFcnJvckNvcnJlY3RMZXZlbDpRUkNvZGVMaWIuUVJFcnJvckNvcnJlY3RMZXZlbC5ILFxuICBRUkVycm9yQ29ycmVjdExldmVsOlFSQ29kZUxpYi5RUkVycm9yQ29ycmVjdExldmVsLFxuICBkcmF3OmZ1bmN0aW9uKGNhbnZhcyx0ZXh0LG9wdGlvbnMsY2Ipe1xuXG4gICAgdmFyIGxldmVsLFxuICAgIGVycm9yLFxuICAgIGVycm9yQ29ycmVjdExldmVsO1xuICAgIFxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICBjYiA9IGFyZ3MucG9wKCk7IFxuICAgIGNhbnZhcyA9IGFyZ3Muc2hpZnQoKTtcbiAgICB0ZXh0ID0gYXJncy5zaGlmdCgpO1xuICAgIG9wdGlvbnMgPSBhcmdzLnNoaWZ0KCl8fHt9O1xuXG4gICAgXG4gICAgaWYodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vZW5mb3JjZSBjYWxsYmFjayBhcGkganVzdCBpbiBjYXNlIHRoZSBwcm9jZXNzaW5nIGNhbiBiZSBtYWRlIGFzeW5jIGluIHRoZSBmdXR1cmVcbiAgICAgIC8vIG9yIHN1cHBvcnQgcHJvYyBvcGVuIHRvIGxpYnFyZW5jb2RlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbGxiYWNrIHJlcXVpcmVkJyk7XG4gICAgfVxuICAgIFxuICAgIGlmKHR5cGVvZiBvcHRpb25zICE9PSBcIm9iamVjdFwiKXtcbiAgICAgIG9wdGlvbnMuZXJyb3JDb3JyZWN0TGV2ZWwgPSBvcHRpb25zO1xuICAgIH1cbiAgICBcblxuICAgIHRoaXMuUVJWZXJzaW9uKFxuICAgICAgdGV4dFxuICAgICAgLG9wdGlvbnMuZXJyb3JDb3JyZWN0TGV2ZWx8fHRoaXMuUVJFcnJvckNvcnJlY3RMZXZlbC5IXG4gICAgICAsb3B0aW9ucy52ZXJzaW9uXG4gICAgLGZ1bmN0aW9uKGUsdCxsLGVjKXtcblxuICAgICAgdGV4dCA9IHQsbGV2ZWwgPSBsLGVycm9yID0gZSxlcnJvckNvcnJlY3RMZXZlbCA9IGVjO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zY2FsZSA9IG9wdGlvbnMuc2NhbGV8fHRoaXMuc2NhbGU7XG4gICAgdGhpcy5tYXJnaW4gPSB0eXBlb2Yob3B0aW9ucy5tYXJnaW4pID09PSAndW5kZWZpbmVkJyA/IHRoaXMuZGVmYXVsdE1hcmdpbiA6IG9wdGlvbnMubWFyZ2luO1xuICAgIFxuICAgIGlmKCFsZXZlbCkge1xuICAgICAgLy9pZiB3ZSBhcmUgdW5hYmxlIHRvIGZpbmQgYW4gYXBwcm9wcmlhdGUgcXIgbGV2ZWwgZXJyb3Igb3V0XG4gICAgICBjYihlcnJvcixjYW52YXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vY3JlYXRlIHFyY29kZSFcbiAgICB0cnl7XG4gICAgICBcbiAgICAgIHZhciBxciA9IG5ldyBRUkNvZGVMaWIuUVJDb2RlKGxldmVsLCBlcnJvckNvcnJlY3RMZXZlbClcbiAgICAgICwgc2NhbGUgPSB0aGlzLnNjYWxlfHw0XG4gICAgICAsIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAsIHdpZHRoID0gMDtcblxuICAgICAgcXIuYWRkRGF0YSh0ZXh0KTtcbiAgICAgIHFyLm1ha2UoKTtcblxuICAgICAgdmFyIG1hcmdpbiA9IHRoaXMubWFyZ2luV2lkdGgoKTtcbiAgICAgIHZhciBjdXJyZW50eSA9IG1hcmdpbjtcbiAgICAgIHdpZHRoID0gdGhpcy5kYXRhV2lkdGgocXIpKyBtYXJnaW4qMjtcbiAgICAgIFxuICAgICAgdGhpcy5yZXNldENhbnZhcyhjYW52YXMsY3R4LHdpZHRoKTtcblxuICAgICAgZm9yICh2YXIgciA9IDAscmw9cXIuZ2V0TW9kdWxlQ291bnQoKTsgciA8IHJsOyByKyspIHtcbiAgICAgICAgdmFyIGN1cnJlbnR4ID0gbWFyZ2luO1xuICAgICAgICBmb3IgKHZhciBjID0gMCxjbD1xci5nZXRNb2R1bGVDb3VudCgpOyBjIDwgY2w7IGMrKykge1xuICAgICAgICAgIGlmIChxci5pc0RhcmsociwgYykgKSB7XG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvci5kYXJrO1xuICAgICAgICAgICAgY3R4LmZpbGxSZWN0IChjdXJyZW50eCwgY3VycmVudHksIHNjYWxlLCBzY2FsZSk7XG4gICAgICAgICAgfSBlbHNlIGlmKHRoaXMuY29sb3IubGlnaHQpe1xuICAgICAgICAgICAgLy9pZiBmYWxzeSBjb25maWd1cmVkIGNvbG9yXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvci5saWdodDtcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCAoY3VycmVudHgsIGN1cnJlbnR5LCBzY2FsZSwgc2NhbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjdXJyZW50eCArPSBzY2FsZTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50eSArPSBzY2FsZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlcnJvciA9IGU7XG4gICAgfVxuICAgIFxuICAgIGNiKGVycm9yLGNhbnZhcyx3aWR0aCk7ICAgIFxuICB9LFxuICBkcmF3Qml0QXJyYXk6ZnVuY3Rpb24odGV4dC8qLGVycm9yQ29ycmVjdExldmVsLG9wdGlvbnMsY2IqLykge1xuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgICAgY2IgPSBhcmdzLnBvcCgpLFxuICAgICAgdGV4dCA9IGFyZ3Muc2hpZnQoKSxcbiAgICAgIGVycm9yQ29ycmVjdExldmVsID0gYXJncy5zaGlmdCgpLFxuICAgICAgb3B0aW9ucyA9IGFyZ3Muc2hpZnQoKSB8fCB7fTtcblxuICAgIC8vYXJndW1lbnQgcHJvY2Vzc2luZ1xuICAgIGlmKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAvL2VuZm9yY2UgY2FsbGJhY2sgYXBpIGp1c3QgaW4gY2FzZSB0aGUgcHJvY2Vzc2luZyBjYW4gYmUgbWFkZSBhc3luYyBpbiB0aGUgZnV0dXJlXG4gICAgICAvLyBvciBzdXBwb3J0IHByb2Mgb3BlbiB0byBsaWJxcmVuY29kZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjYWxsYmFjayByZXF1aXJlZCBhcyBsYXN0IGFyZ3VtZW50Jyk7XG4gICAgfVxuICAgIFxuICAgIGNiID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGgtMV07IFxuICAgIFxuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPiAyKXtcbiAgICAgIGVycm9yQ29ycmVjdExldmVsID0gYXJndW1lbnRzWzJdO1xuICAgIH1cblxuXG4gICAgLy90aGlzIGludGVyZmFjZSBraW5kYSBzdWNrcyAtIHRoZXJlIGlzIHZlcnkgc21hbGwgbGlrZWx5aG9vZCBvZiB0aGlzIGV2ZXIgYmVpbmcgYXN5bmNcbiAgICB0aGlzLlFSVmVyc2lvbih0ZXh0LGVycm9yQ29ycmVjdExldmVsLChvcHRpb25zfHx7fSkudmVyc2lvbixmdW5jdGlvbihlLHQsbCxlYyl7XG4gICAgICB0ZXh0ID0gdCxsZXZlbCA9IGwsZXJyb3IgPSBlLGVycm9yQ29ycmVjdExldmVsID0gZWM7XG4gICAgfSk7XG5cblxuICAgIGlmKCFsZXZlbCkge1xuICAgICAgLy9pZiB3ZSBhcmUgdW5hYmxlIHRvIGZpbmQgYW4gYXBwcm9wcmlhdGUgcXIgbGV2ZWwgZXJyb3Igb3V0XG4gICAgICBjYihlcnJvcixbXSwwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvL2NyZWF0ZSBxcmNvZGUhXG4gICAgdHJ5e1xuXG4gICAgICB2YXIgcXIgPSBuZXcgUVJDb2RlTGliLlFSQ29kZShsZXZlbCwgZXJyb3JDb3JyZWN0TGV2ZWwpXG4gICAgICAsIHNjYWxlID0gdGhpcy5zY2FsZXx8NFxuICAgICAgLCB3aWR0aCA9IDAsYml0cyxiaXRjPTAsY3VycmVudHk9MDtcbiAgICAgIFxuICAgICAgcXIuYWRkRGF0YSh0ZXh0KTtcbiAgICAgIHFyLm1ha2UoKTtcbiAgICAgIFxuICAgICAgd2lkdGggPSB0aGlzLmRhdGFXaWR0aChxciwxKTtcbiAgICAgIGJpdHMgPSBuZXcgdGhpcy5BcnJheSh3aWR0aCp3aWR0aCk7XG5cbiAgICAgIFxuICAgICAgZm9yICh2YXIgciA9IDAscmw9cXIuZ2V0TW9kdWxlQ291bnQoKTsgciA8IHJsOyByKyspIHtcbiAgICAgICAgZm9yICh2YXIgYyA9IDAsY2w9cXIuZ2V0TW9kdWxlQ291bnQoKTsgYyA8IGNsOyBjKyspIHtcbiAgICAgICAgICBpZiAocXIuaXNEYXJrKHIsIGMpICkge1xuICAgICAgICAgICAgYml0c1tiaXRjXSA9IDE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJpdHNbYml0Y10gPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBiaXRjKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlcnJvciA9IGU7XG4gICAgICBjb25zb2xlLmxvZyhlLnN0YWNrKTtcbiAgICB9XG4gICAgXG4gICAgY2IoZXJyb3IsYml0cyx3aWR0aCk7XG4gIH0sXG4gIFFSVmVyc2lvbjpmdW5jdGlvbih0ZXh0LGVycm9yQ29ycmVjdExldmVsLHZlcnNpb24sY2Ipe1xuICAgIHZhciBjID0gYm9wcy5mcm9tKHRleHQpLmxlbmd0aCwvLyBCSU5BUlkgTEVOR1RIIVxuICAgICAgICBlcnJvcixcbiAgICAgICAgZXJyb3JDb3JyZWN0TGV2ZWwgPSB0aGlzLlFSRXJyb3JDb3JyZWN0TGV2ZWxbZXJyb3JDb3JyZWN0TGV2ZWxdfHx0aGlzLmRlZmF1bHRFcnJvckNvcnJlY3RMZXZlbCxcbiAgICAgICAgZXJyb3JDb3JyZWN0SW5kZXggPSBbMSwwLDMsMl0sLy9maXggb2RkIG1hcHBpbmcgdG8gb3JkZXIgaW4gdGFibGVcbiAgICAgICAga2V5cyA9IFsnTCcsJ00nLCdRJywnSCddLFxuICAgICAgICBjYXBhY2l0eSA9IDAsXG4gICAgICAgIHZlcnNpb25TcGVjaWZpZWQgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgaWYodHlwZW9mIHZlcnNpb24gIT09IFwidW5kZWZpbmVkXCIgJiYgdmVyc2lvbiAhPT0gbnVsbCkge1xuICAgICAgdmVyc2lvblNwZWNpZmllZCA9IHRydWU7XG4gICAgfVxuICAgIC8vVE9ETyBBREQgVEhST1cgRk9SIElOVkFMSUQgZXJyb3JDb3JyZWN0TGV2ZWwuLi4/XG4gICAgXG4gICAgaWYodmVyc2lvblNwZWNpZmllZCl7XG4gICAgICAvL2NvbnNvbGUubG9nKCdTUEVDSUZJRUQgVkVSU0lPTiEgJyx2ZXJzaW9uKTtcbiAgICAgIC8vaSBoYXZlIHNwZWNpZmllZCBhIHZlcnNpb24uIHRoaXMgd2lsbCBnaXZlIG1lIGEgZml4ZWQgc2l6ZSBxciBjb2RlLiB2ZXJzaW9uIG11c3QgYmUgdmFsaWQuIDEtNDBcbiAgICAgIGNhcGFjaXR5ID0gUVJWZXJzaW9uQ2FwYWNpdHlUYWJsZVt2ZXJzaW9uXVtlcnJvckNvcnJlY3RJbmRleFtlcnJvckNvcnJlY3RMZXZlbF1dO1xuICAgICAgXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vZmlndXJlIG91dCB3aGF0IHZlcnNpb24gY2FuIGhvbGQgdGhlIGFtb3VudCBvZiB0ZXh0XG4gICAgICBmb3IodmFyIGk9MCxqPVFSVmVyc2lvbkNhcGFjaXR5VGFibGUubGVuZ3RoO2k8ajtpKyspIHtcbiAgICAgICAgY2FwYWNpdHkgPSBRUlZlcnNpb25DYXBhY2l0eVRhYmxlW2ldW2Vycm9yQ29ycmVjdEluZGV4W2Vycm9yQ29ycmVjdExldmVsXV07XG4gICAgICAgIGlmKGMgPCBRUlZlcnNpb25DYXBhY2l0eVRhYmxlW2ldW2Vycm9yQ29ycmVjdEluZGV4W2Vycm9yQ29ycmVjdExldmVsXV0pe1xuICAgICAgICAgIHZlcnNpb24gPSBpKzE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vaWYgbm90IHZlcnNpb24gc2V0IHRvIG1heFxuICAgICAgaWYoIXZlcnNpb24pIHtcbiAgICAgICAgdmVyc2lvbiA9IFFSVmVyc2lvbkNhcGFjaXR5VGFibGUubGVuZ3RoLTE7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKGNhcGFjaXR5IDwgYyl7XG4gICAgICBpZih0aGlzLmVycm9yQmVoYXZpb3IubGVuZ3RoID09ICd0cmltJyl7XG4gICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cigwLGNhcGFjaXR5KTtcbiAgICAgICAgbGV2ZWwgPSBRUlZlcnNpb25DYXBhY2l0eVRhYmxlLmxlbmd0aDsgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcignaW5wdXQgc3RyaW5nIHRvbyBsb25nIGZvciBlcnJvciBjb3JyZWN0aW9uICdcbiAgICAgICAgICAra2V5c1tlcnJvckNvcnJlY3RJbmRleFtlcnJvckNvcnJlY3RMZXZlbF1dXG4gICAgICAgICAgKycgbWF4IGxlbmd0aCAnXG4gICAgICAgICAgKyBjYXBhY2l0eVxuICAgICAgICAgICsnIGZvciBxcmNvZGUgdmVyc2lvbiAnK3ZlcnNpb25cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIFxuICAgIGlmKGNiKSB7XG4gICAgICBjYihlcnJvcix0ZXh0LHZlcnNpb24sZXJyb3JDb3JyZWN0TGV2ZWwpO1xuICAgIH1cbiAgICByZXR1cm4gdmVyc2lvbjtcbiAgfSxcbiAgbWFyZ2luV2lkdGg6ZnVuY3Rpb24oKXtcbiAgICB2YXIgbWFyZ2luID0gdGhpcy5tYXJnaW47XG4gICAgdGhpcy5zY2FsZSA9IHRoaXMuc2NhbGV8fDQ7XG4gICAgLy9lbGVnYW50IHdoaXRlIHNwYWNlIG5leHQgdG8gY29kZSBpcyByZXF1aXJlZCBieSBzcGVjXG4gICAgaWYgKCh0aGlzLnNjYWxlICogdGhpcy5tYXJnaW5TY2FsZUZhY3RvciA+IG1hcmdpbikgJiYgbWFyZ2luID4gMCl7XG4gICAgICBtYXJnaW4gPSB0aGlzLnNjYWxlICogdGhpcy5tYXJnaW5TY2FsZUZhY3RvcjtcbiAgICB9XG4gICAgcmV0dXJuIG1hcmdpbjtcbiAgfSxcbiAgZGF0YVdpZHRoOmZ1bmN0aW9uKHFyLHNjYWxlKXtcbiAgICByZXR1cm4gcXIuZ2V0TW9kdWxlQ291bnQoKSooc2NhbGV8fHRoaXMuc2NhbGV8fDQpO1xuICB9LFxuICByZXNldENhbnZhczpmdW5jdGlvbihjYW52YXMsY3R4LHdpZHRoKXtcbiAgICBjdHguY2xlYXJSZWN0KDAsMCxjYW52YXMud2lkdGgsY2FudmFzLmhlaWdodCk7XG4gICAgaWYoIWNhbnZhcy5zdHlsZSkgY2FudmFzLnN0eWxlID0ge307XG4gICAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGNhbnZhcy5oZWlnaHQgPSB3aWR0aDsvL3NxdWFyZSFcbiAgICBjYW52YXMuc3R5bGUud2lkdGggPSBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBcbiAgICBpZih0aGlzLmNvbG9yLmxpZ2h0KXtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yLmxpZ2h0OyBcbiAgICAgIGN0eC5maWxsUmVjdCgwLDAsY2FudmFzLndpZHRoLGNhbnZhcy5oZWlnaHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL3N1cHBvcnQgdHJhbnNwYXJlbnQgYmFja2dyb3VuZHM/XG4gICAgICAvL25vdCBleGFjdGx5IHRvIHNwZWMgYnV0IGkgcmVhbGx5IHdvdWxkIGxpa2Ugc29tZW9uZSB0byBiZSBhYmxlIHRvIGFkZCBhIGJhY2tncm91bmQgd2l0aCBoZWF2aWx5IHJlZHVjZWQgbHVtaW5vc2l0eSBmb3Igc2ltcGxlIGJyYW5kaW5nXG4gICAgICAvL2kgY291bGQganVzdCBkaXRjaCB0aGlzIGJlY2F1c2UgeW91IGNvdWxkIGFsc28ganVzdCBzZXQgIyoqKioqKjAwIGFzIHRoZSBjb2xvciA9UFxuICAgICAgY3R4LmNsZWFyUmVjdCgwLDAsY2FudmFzLndpZHRoLGNhbnZhcy5oZWlnaHQpO1xuICAgIH1cbiAgfVxufTtcblxuIiwidmFyIGJvcHMgPSByZXF1aXJlKCdib3BzJyk7XG5cbi8qKlxuICogUVJDb2RlIGZvciBKYXZhU2NyaXB0XG4gKlxuICogbW9kaWZpZWQgYnkgUnlhbiBEYXkgZm9yIG5vZGVqcyBzdXBwb3J0XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEgUnlhbiBEYXlcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuICogRVhQT1JUUzpcbiAqXHR7XG4gKlx0UVJDb2RlOlFSQ29kZVxuICpcdFFSRXJyb3JDb3JyZWN0TGV2ZWw6UVJFcnJvckNvcnJlY3RMZXZlbFxuICpcdH1cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUkNvZGUgZm9yIEphdmFTY3JpcHRcbi8vXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgS2F6dWhpa28gQXJhc2Vcbi8vXG4vLyBVUkw6IGh0dHA6Ly93d3cuZC1wcm9qZWN0LmNvbS9cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4vLyAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4vL1xuLy8gVGhlIHdvcmQgXCJRUiBDb2RlXCIgaXMgcmVnaXN0ZXJlZCB0cmFkZW1hcmsgb2YgXG4vLyBERU5TTyBXQVZFIElOQ09SUE9SQVRFRFxuLy8gICBodHRwOi8vd3d3LmRlbnNvLXdhdmUuY29tL3FyY29kZS9mYXFwYXRlbnQtZS5odG1sXG4vL1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiovXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUkNvZGVcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydHMuUVJDb2RlID0gUVJDb2RlO1xuXG52YXIgUVJEYXRhQXJyYXkgPSAodHlwZW9mIFVpbnQzMkFycmF5ID09ICd1bmRlZmluZWQnP1VpbnQzMkFycmF5OkFycmF5KTtcblxuZnVuY3Rpb24gUVJDb2RlKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdExldmVsKSB7XG5cdHRoaXMudHlwZU51bWJlciA9IHR5cGVOdW1iZXI7XG5cdHRoaXMuZXJyb3JDb3JyZWN0TGV2ZWwgPSBlcnJvckNvcnJlY3RMZXZlbDtcblx0dGhpcy5tb2R1bGVzID0gbnVsbDtcblx0dGhpcy5tb2R1bGVDb3VudCA9IDA7XG5cdHRoaXMuZGF0YUNhY2hlID0gbnVsbDtcblx0dGhpcy5kYXRhTGlzdCA9IG5ldyBRUkRhdGFBcnJheSgpO1xufVxuXG5RUkNvZGUucHJvdG90eXBlID0ge1xuXHRcblx0YWRkRGF0YSA6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR2YXIgbmV3RGF0YSA9IG5ldyBRUjhiaXRCeXRlKGRhdGEpO1xuXG5cdFx0dGhpcy5kYXRhTGlzdC5wdXNoKG5ld0RhdGEpO1xuXHRcdHRoaXMuZGF0YUNhY2hlID0gbnVsbDtcblx0fSxcblx0XG5cdGlzRGFyayA6IGZ1bmN0aW9uKHJvdywgY29sKSB7XG5cdFx0aWYgKHJvdyA8IDAgfHwgdGhpcy5tb2R1bGVDb3VudCA8PSByb3cgfHwgY29sIDwgMCB8fCB0aGlzLm1vZHVsZUNvdW50IDw9IGNvbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKHJvdyArIFwiLFwiICsgY29sKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMubW9kdWxlc1tyb3ddW2NvbF07XG5cdH0sXG5cblx0Z2V0TW9kdWxlQ291bnQgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5tb2R1bGVDb3VudDtcblx0fSxcblx0XG5cdG1ha2UgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm1ha2VJbXBsKGZhbHNlLCB0aGlzLmdldEJlc3RNYXNrUGF0dGVybigpICk7XG5cdH0sXG5cdFxuXHRtYWtlSW1wbCA6IGZ1bmN0aW9uKHRlc3QsIG1hc2tQYXR0ZXJuKSB7XG5cdFx0XG5cdFx0dGhpcy5tb2R1bGVDb3VudCA9IHRoaXMudHlwZU51bWJlciAqIDQgKyAxNztcblx0XHR0aGlzLm1vZHVsZXMgPSBuZXcgUVJEYXRhQXJyYXkodGhpcy5tb2R1bGVDb3VudCk7XG5cdFx0XG5cdFx0Zm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5tb2R1bGVDb3VudDsgcm93KyspIHtcblx0XHRcdFxuXHRcdFx0dGhpcy5tb2R1bGVzW3Jvd10gPSBuZXcgUVJEYXRhQXJyYXkodGhpcy5tb2R1bGVDb3VudCk7XG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMubW9kdWxlQ291bnQ7IGNvbCsrKSB7XG5cdFx0XHRcdHRoaXMubW9kdWxlc1tyb3ddW2NvbF0gPSBudWxsOy8vKGNvbCArIHJvdykgJSAzO1xuXHRcdFx0fVxuXHRcdH1cblx0XG5cdFx0dGhpcy5zZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKDAsIDApO1xuXHRcdHRoaXMuc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybih0aGlzLm1vZHVsZUNvdW50IC0gNywgMCk7XG5cdFx0dGhpcy5zZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKDAsIHRoaXMubW9kdWxlQ291bnQgLSA3KTtcblx0XHR0aGlzLnNldHVwUG9zaXRpb25BZGp1c3RQYXR0ZXJuKCk7XG5cdFx0dGhpcy5zZXR1cFRpbWluZ1BhdHRlcm4oKTtcblx0XHR0aGlzLnNldHVwVHlwZUluZm8odGVzdCwgbWFza1BhdHRlcm4pO1xuXHRcdFxuXHRcdGlmICh0aGlzLnR5cGVOdW1iZXIgPj0gNykge1xuXHRcdFx0dGhpcy5zZXR1cFR5cGVOdW1iZXIodGVzdCk7XG5cdFx0fVxuXHRcblx0XHRpZiAodGhpcy5kYXRhQ2FjaGUgPT0gbnVsbCkge1xuXHRcdFx0dGhpcy5kYXRhQ2FjaGUgPSBRUkNvZGUuY3JlYXRlRGF0YSh0aGlzLnR5cGVOdW1iZXIsIHRoaXMuZXJyb3JDb3JyZWN0TGV2ZWwsIHRoaXMuZGF0YUxpc3QpO1xuXHRcdH1cblx0XG5cdFx0dGhpcy5tYXBEYXRhKHRoaXMuZGF0YUNhY2hlLCBtYXNrUGF0dGVybik7XG5cdH0sXG5cblx0c2V0dXBQb3NpdGlvblByb2JlUGF0dGVybiA6IGZ1bmN0aW9uKHJvdywgY29sKSAge1xuXHRcdFxuXHRcdGZvciAodmFyIHIgPSAtMTsgciA8PSA3OyByKyspIHtcblx0XHRcdFxuXHRcdFx0aWYgKHJvdyArIHIgPD0gLTEgfHwgdGhpcy5tb2R1bGVDb3VudCA8PSByb3cgKyByKSBjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0Zm9yICh2YXIgYyA9IC0xOyBjIDw9IDc7IGMrKykge1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGNvbCArIGMgPD0gLTEgfHwgdGhpcy5tb2R1bGVDb3VudCA8PSBjb2wgKyBjKSBjb250aW51ZTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmICggKDAgPD0gciAmJiByIDw9IDYgJiYgKGMgPT0gMCB8fCBjID09IDYpIClcblx0XHRcdFx0XHRcdHx8ICgwIDw9IGMgJiYgYyA8PSA2ICYmIChyID09IDAgfHwgciA9PSA2KSApXG5cdFx0XHRcdFx0XHR8fCAoMiA8PSByICYmIHIgPD0gNCAmJiAyIDw9IGMgJiYgYyA8PSA0KSApIHtcblx0XHRcdFx0XHR0aGlzLm1vZHVsZXNbcm93ICsgcl1bY29sICsgY10gPSB0cnVlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMubW9kdWxlc1tyb3cgKyByXVtjb2wgKyBjXSA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XHRcdFxuXHRcdH1cdFx0XG5cdH0sXG5cdFxuXHRnZXRCZXN0TWFza1BhdHRlcm4gOiBmdW5jdGlvbigpIHtcblx0XG5cdFx0dmFyIG1pbkxvc3RQb2ludCA9IDA7XG5cdFx0dmFyIHBhdHRlcm4gPSAwO1xuXHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuXHRcdFx0XG5cdFx0XHR0aGlzLm1ha2VJbXBsKHRydWUsIGkpO1xuXHRcblx0XHRcdHZhciBsb3N0UG9pbnQgPSBRUlV0aWwuZ2V0TG9zdFBvaW50KHRoaXMpO1xuXHRcblx0XHRcdGlmIChpID09IDAgfHwgbWluTG9zdFBvaW50ID4gIGxvc3RQb2ludCkge1xuXHRcdFx0XHRtaW5Mb3N0UG9pbnQgPSBsb3N0UG9pbnQ7XG5cdFx0XHRcdHBhdHRlcm4gPSBpO1xuXHRcdFx0fVxuXHRcdH1cblx0XG5cdFx0cmV0dXJuIHBhdHRlcm47XG5cdH0sXG5cblx0c2V0dXBUaW1pbmdQYXR0ZXJuIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0Zm9yICh2YXIgciA9IDg7IHIgPCB0aGlzLm1vZHVsZUNvdW50IC0gODsgcisrKSB7XG5cdFx0XHRpZiAodGhpcy5tb2R1bGVzW3JdWzZdICE9IG51bGwpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLm1vZHVsZXNbcl1bNl0gPSAociAlIDIgPT0gMCk7XG5cdFx0fVxuXHRcblx0XHRmb3IgKHZhciBjID0gODsgYyA8IHRoaXMubW9kdWxlQ291bnQgLSA4OyBjKyspIHtcblx0XHRcdGlmICh0aGlzLm1vZHVsZXNbNl1bY10gIT0gbnVsbCkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdHRoaXMubW9kdWxlc1s2XVtjXSA9IChjICUgMiA9PSAwKTtcblx0XHR9XG5cdH0sXG5cdFxuXHRzZXR1cFBvc2l0aW9uQWRqdXN0UGF0dGVybiA6IGZ1bmN0aW9uKCkge1xuXHRcblx0XHR2YXIgcG9zID0gUVJVdGlsLmdldFBhdHRlcm5Qb3NpdGlvbih0aGlzLnR5cGVOdW1iZXIpO1xuXHRcdHBvcyA9IHBvcyB8fCAnJztcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBvcy5sZW5ndGg7IGkrKykge1xuXHRcdFxuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBwb3MubGVuZ3RoOyBqKyspIHtcblx0XHRcdFxuXHRcdFx0XHR2YXIgcm93ID0gcG9zW2ldO1xuXHRcdFx0XHR2YXIgY29sID0gcG9zW2pdO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHRoaXMubW9kdWxlc1tyb3ddW2NvbF0gIT0gbnVsbCkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRmb3IgKHZhciByID0gLTI7IHIgPD0gMjsgcisrKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRcdGZvciAodmFyIGMgPSAtMjsgYyA8PSAyOyBjKyspIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGlmIChyID09IC0yIHx8IHIgPT0gMiB8fCBjID09IC0yIHx8IGMgPT0gMiBcblx0XHRcdFx0XHRcdFx0XHR8fCAociA9PSAwICYmIGMgPT0gMCkgKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMubW9kdWxlc1tyb3cgKyByXVtjb2wgKyBjXSA9IHRydWU7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR0aGlzLm1vZHVsZXNbcm93ICsgcl1bY29sICsgY10gPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFxuXHRzZXR1cFR5cGVOdW1iZXIgOiBmdW5jdGlvbih0ZXN0KSB7XG5cdFxuXHRcdHZhciBiaXRzID0gUVJVdGlsLmdldEJDSFR5cGVOdW1iZXIodGhpcy50eXBlTnVtYmVyKTtcblx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAxODsgaSsrKSB7XG5cdFx0XHR2YXIgbW9kID0gKCF0ZXN0ICYmICggKGJpdHMgPj4gaSkgJiAxKSA9PSAxKTtcblx0XHRcdHRoaXMubW9kdWxlc1tNYXRoLmZsb29yKGkgLyAzKV1baSAlIDMgKyB0aGlzLm1vZHVsZUNvdW50IC0gOCAtIDNdID0gbW9kO1xuXHRcdH1cblx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAxODsgaSsrKSB7XG5cdFx0XHR2YXIgbW9kID0gKCF0ZXN0ICYmICggKGJpdHMgPj4gaSkgJiAxKSA9PSAxKTtcblx0XHRcdHRoaXMubW9kdWxlc1tpICUgMyArIHRoaXMubW9kdWxlQ291bnQgLSA4IC0gM11bTWF0aC5mbG9vcihpIC8gMyldID0gbW9kO1xuXHRcdH1cblx0fSxcblx0XG5cdHNldHVwVHlwZUluZm8gOiBmdW5jdGlvbih0ZXN0LCBtYXNrUGF0dGVybikge1xuXHRcblx0XHR2YXIgZGF0YSA9ICh0aGlzLmVycm9yQ29ycmVjdExldmVsIDw8IDMpIHwgbWFza1BhdHRlcm47XG5cdFx0dmFyIGJpdHMgPSBRUlV0aWwuZ2V0QkNIVHlwZUluZm8oZGF0YSk7XG5cdFxuXHRcdC8vIHZlcnRpY2FsXHRcdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMTU7IGkrKykge1xuXHRcblx0XHRcdHZhciBtb2QgPSAoIXRlc3QgJiYgKCAoYml0cyA+PiBpKSAmIDEpID09IDEpO1xuXHRcblx0XHRcdGlmIChpIDwgNikge1xuXHRcdFx0XHR0aGlzLm1vZHVsZXNbaV1bOF0gPSBtb2Q7XG5cdFx0XHR9IGVsc2UgaWYgKGkgPCA4KSB7XG5cdFx0XHRcdHRoaXMubW9kdWxlc1tpICsgMV1bOF0gPSBtb2Q7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1vZHVsZXNbdGhpcy5tb2R1bGVDb3VudCAtIDE1ICsgaV1bOF0gPSBtb2Q7XG5cdFx0XHR9XG5cdFx0fVxuXHRcblx0XHQvLyBob3Jpem9udGFsXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG5cdFxuXHRcdFx0dmFyIG1vZCA9ICghdGVzdCAmJiAoIChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG5cdFx0XHRcblx0XHRcdGlmIChpIDwgOCkge1xuXHRcdFx0XHR0aGlzLm1vZHVsZXNbOF1bdGhpcy5tb2R1bGVDb3VudCAtIGkgLSAxXSA9IG1vZDtcblx0XHRcdH0gZWxzZSBpZiAoaSA8IDkpIHtcblx0XHRcdFx0dGhpcy5tb2R1bGVzWzhdWzE1IC0gaSAtIDEgKyAxXSA9IG1vZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubW9kdWxlc1s4XVsxNSAtIGkgLSAxXSA9IG1vZDtcblx0XHRcdH1cblx0XHR9XG5cdFxuXHRcdC8vIGZpeGVkIG1vZHVsZVxuXHRcdHRoaXMubW9kdWxlc1t0aGlzLm1vZHVsZUNvdW50IC0gOF1bOF0gPSAoIXRlc3QpO1xuXHRcblx0fSxcblx0XG5cdG1hcERhdGEgOiBmdW5jdGlvbihkYXRhLCBtYXNrUGF0dGVybikge1xuXHRcdFxuXHRcdHZhciBpbmMgPSAtMTtcblx0XHR2YXIgcm93ID0gdGhpcy5tb2R1bGVDb3VudCAtIDE7XG5cdFx0dmFyIGJpdEluZGV4ID0gNztcblx0XHR2YXIgYnl0ZUluZGV4ID0gMDtcblx0XHRcblx0XHRmb3IgKHZhciBjb2wgPSB0aGlzLm1vZHVsZUNvdW50IC0gMTsgY29sID4gMDsgY29sIC09IDIpIHtcblx0XG5cdFx0XHRpZiAoY29sID09IDYpIGNvbC0tO1xuXHRcblx0XHRcdHdoaWxlICh0cnVlKSB7XG5cdFxuXHRcdFx0XHRmb3IgKHZhciBjID0gMDsgYyA8IDI7IGMrKykge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmICh0aGlzLm1vZHVsZXNbcm93XVtjb2wgLSBjXSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdHZhciBkYXJrID0gZmFsc2U7XG5cdFxuXHRcdFx0XHRcdFx0aWYgKGJ5dGVJbmRleCA8IGRhdGEubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdGRhcmsgPSAoICggKGRhdGFbYnl0ZUluZGV4XSA+Pj4gYml0SW5kZXgpICYgMSkgPT0gMSk7XG5cdFx0XHRcdFx0XHR9XG5cdFxuXHRcdFx0XHRcdFx0dmFyIG1hc2sgPSBRUlV0aWwuZ2V0TWFzayhtYXNrUGF0dGVybiwgcm93LCBjb2wgLSBjKTtcblx0XG5cdFx0XHRcdFx0XHRpZiAobWFzaykge1xuXHRcdFx0XHRcdFx0XHRkYXJrID0gIWRhcms7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdHRoaXMubW9kdWxlc1tyb3ddW2NvbCAtIGNdID0gZGFyaztcblx0XHRcdFx0XHRcdGJpdEluZGV4LS07XG5cdFxuXHRcdFx0XHRcdFx0aWYgKGJpdEluZGV4ID09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdGJ5dGVJbmRleCsrO1xuXHRcdFx0XHRcdFx0XHRiaXRJbmRleCA9IDc7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdHJvdyArPSBpbmM7XG5cdFxuXHRcdFx0XHRpZiAocm93IDwgMCB8fCB0aGlzLm1vZHVsZUNvdW50IDw9IHJvdykge1xuXHRcdFx0XHRcdHJvdyAtPSBpbmM7XG5cdFx0XHRcdFx0aW5jID0gLWluYztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0fVxuXG59O1xuXG5RUkNvZGUuUEFEMCA9IDB4RUM7XG5RUkNvZGUuUEFEMSA9IDB4MTE7XG5cblFSQ29kZS5jcmVhdGVEYXRhID0gZnVuY3Rpb24odHlwZU51bWJlciwgZXJyb3JDb3JyZWN0TGV2ZWwsIGRhdGFMaXN0KSB7XG5cdFxuXHR2YXIgcnNCbG9ja3MgPSBRUlJTQmxvY2suZ2V0UlNCbG9ja3ModHlwZU51bWJlciwgZXJyb3JDb3JyZWN0TGV2ZWwpO1xuXHRcblx0dmFyIGJ1ZmZlciA9IG5ldyBRUkJpdEJ1ZmZlcigpO1xuXHRcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhTGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBkYXRhID0gZGF0YUxpc3RbaV07XG5cdFx0YnVmZmVyLnB1dChkYXRhLm1vZGUsIDQpO1xuXHRcdGJ1ZmZlci5wdXQoZGF0YS5nZXRMZW5ndGgoKSwgUVJVdGlsLmdldExlbmd0aEluQml0cyhkYXRhLm1vZGUsIHR5cGVOdW1iZXIpICk7XG5cdFx0ZGF0YS53cml0ZShidWZmZXIpO1xuXHR9XG5cblx0Ly8gY2FsYyBudW0gbWF4IGRhdGEuXG5cdHZhciB0b3RhbERhdGFDb3VudCA9IDA7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgcnNCbG9ja3MubGVuZ3RoOyBpKyspIHtcblx0XHR0b3RhbERhdGFDb3VudCArPSByc0Jsb2Nrc1tpXS5kYXRhQ291bnQ7XG5cdH1cblxuXHRpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpID4gdG90YWxEYXRhQ291bnQgKiA4KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiY29kZSBsZW5ndGggb3ZlcmZsb3cuIChcIlxuXHRcdFx0KyBidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKClcblx0XHRcdCsgXCI+XCJcblx0XHRcdCsgIHRvdGFsRGF0YUNvdW50ICogOFxuXHRcdFx0KyBcIilcIik7XG5cdH1cblxuXHQvLyBlbmQgY29kZVxuXHRpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpICsgNCA8PSB0b3RhbERhdGFDb3VudCAqIDgpIHtcblx0XHRidWZmZXIucHV0KDAsIDQpO1xuXHR9XG5cblx0Ly8gcGFkZGluZ1xuXHR3aGlsZSAoYnVmZmVyLmdldExlbmd0aEluQml0cygpICUgOCAhPSAwKSB7XG5cdFx0YnVmZmVyLnB1dEJpdChmYWxzZSk7XG5cdH1cblxuXHQvLyBwYWRkaW5nXG5cdHdoaWxlICh0cnVlKSB7XG5cdFx0XG5cdFx0aWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSA+PSB0b3RhbERhdGFDb3VudCAqIDgpIHtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRidWZmZXIucHV0KFFSQ29kZS5QQUQwLCA4KTtcblx0XHRcblx0XHRpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpID49IHRvdGFsRGF0YUNvdW50ICogOCkge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGJ1ZmZlci5wdXQoUVJDb2RlLlBBRDEsIDgpO1xuXHR9XG5cblx0cmV0dXJuIFFSQ29kZS5jcmVhdGVCeXRlcyhidWZmZXIsIHJzQmxvY2tzKTtcbn07XG5cblFSQ29kZS5jcmVhdGVCeXRlcyA9IGZ1bmN0aW9uKGJ1ZmZlciwgcnNCbG9ja3MpIHtcblxuXHR2YXIgb2Zmc2V0ID0gMDtcblx0XG5cdHZhciBtYXhEY0NvdW50ID0gMDtcblx0dmFyIG1heEVjQ291bnQgPSAwO1xuXHRcblx0dmFyIGRjZGF0YSA9IG5ldyBRUkRhdGFBcnJheShyc0Jsb2Nrcy5sZW5ndGgpO1xuXHR2YXIgZWNkYXRhID0gbmV3IFFSRGF0YUFycmF5KHJzQmxvY2tzLmxlbmd0aCk7XG5cdFxuXHRmb3IgKHZhciByID0gMDsgciA8IHJzQmxvY2tzLmxlbmd0aDsgcisrKSB7XG5cblx0XHR2YXIgZGNDb3VudCA9IHJzQmxvY2tzW3JdLmRhdGFDb3VudDtcblx0XHR2YXIgZWNDb3VudCA9IHJzQmxvY2tzW3JdLnRvdGFsQ291bnQgLSBkY0NvdW50O1xuXG5cdFx0bWF4RGNDb3VudCA9IE1hdGgubWF4KG1heERjQ291bnQsIGRjQ291bnQpO1xuXHRcdG1heEVjQ291bnQgPSBNYXRoLm1heChtYXhFY0NvdW50LCBlY0NvdW50KTtcblx0XHRcblx0XHRkY2RhdGFbcl0gPSBuZXcgUVJEYXRhQXJyYXkoZGNDb3VudCk7XG5cdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkY2RhdGFbcl0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdGRjZGF0YVtyXVtpXSA9IDB4ZmYgJiBidWZmZXIuYnVmZmVyW2kgKyBvZmZzZXRdO1xuXHRcdH1cblx0XHRvZmZzZXQgKz0gZGNDb3VudDtcblx0XHRcblx0XHR2YXIgcnNQb2x5ID0gUVJVdGlsLmdldEVycm9yQ29ycmVjdFBvbHlub21pYWwoZWNDb3VudCk7XG5cdFx0dmFyIHJhd1BvbHkgPSBuZXcgUVJQb2x5bm9taWFsKGRjZGF0YVtyXSwgcnNQb2x5LmdldExlbmd0aCgpIC0gMSk7XG5cblx0XHR2YXIgbW9kUG9seSA9IHJhd1BvbHkubW9kKHJzUG9seSk7XG5cdFx0ZWNkYXRhW3JdID0gbmV3IFFSRGF0YUFycmF5KHJzUG9seS5nZXRMZW5ndGgoKSAtIDEpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZWNkYXRhW3JdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbW9kSW5kZXggPSBpICsgbW9kUG9seS5nZXRMZW5ndGgoKSAtIGVjZGF0YVtyXS5sZW5ndGg7XG5cdFx0XHRlY2RhdGFbcl1baV0gPSAobW9kSW5kZXggPj0gMCk/IG1vZFBvbHkuZ2V0KG1vZEluZGV4KSA6IDA7XG5cdFx0fVxuXG5cdH1cblx0XG5cdHZhciB0b3RhbENvZGVDb3VudCA9IDA7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgcnNCbG9ja3MubGVuZ3RoOyBpKyspIHtcblx0XHR0b3RhbENvZGVDb3VudCArPSByc0Jsb2Nrc1tpXS50b3RhbENvdW50O1xuXHR9XG5cblx0dmFyIGRhdGEgPSBuZXcgUVJEYXRhQXJyYXkodG90YWxDb2RlQ291bnQpO1xuXHR2YXIgaW5kZXggPSAwO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbWF4RGNDb3VudDsgaSsrKSB7XG5cdFx0Zm9yICh2YXIgciA9IDA7IHIgPCByc0Jsb2Nrcy5sZW5ndGg7IHIrKykge1xuXHRcdFx0aWYgKGkgPCBkY2RhdGFbcl0ubGVuZ3RoKSB7XG5cdFx0XHRcdGRhdGFbaW5kZXgrK10gPSBkY2RhdGFbcl1baV07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXhFY0NvdW50OyBpKyspIHtcblx0XHRmb3IgKHZhciByID0gMDsgciA8IHJzQmxvY2tzLmxlbmd0aDsgcisrKSB7XG5cdFx0XHRpZiAoaSA8IGVjZGF0YVtyXS5sZW5ndGgpIHtcblx0XHRcdFx0ZGF0YVtpbmRleCsrXSA9IGVjZGF0YVtyXVtpXTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZGF0YTtcblxufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSOGJpdEJ5dGVcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5mdW5jdGlvbiBRUjhiaXRCeXRlKGRhdGEpIHtcbiAgdGhpcy5tb2RlID0gUVJNb2RlLk1PREVfOEJJVF9CWVRFO1xuICB0aGlzLmRhdGEgPSBkYXRhO1xuICB2YXIgYnl0ZUFycmF5ID0gW107XG4gIFxuICB0aGlzLnBhcnNlZERhdGEgPSBib3BzLmZyb20oZGF0YSk7XG59XG5cblFSOGJpdEJ5dGUucHJvdG90eXBlID0ge1xuICBnZXRMZW5ndGg6IGZ1bmN0aW9uIChidWZmZXIpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZWREYXRhLmxlbmd0aDtcbiAgfSxcbiAgd3JpdGU6IGZ1bmN0aW9uIChidWZmZXIpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMucGFyc2VkRGF0YS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGJ1ZmZlci5wdXQodGhpcy5wYXJzZWREYXRhW2ldLCA4KTtcbiAgICB9XG4gIH1cbn07XG5cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSTW9kZVxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIFFSTW9kZSA9IHtcblx0TU9ERV9OVU1CRVIgOlx0XHQxIDw8IDAsXG5cdE1PREVfQUxQSEFfTlVNIDogXHQxIDw8IDEsXG5cdE1PREVfOEJJVF9CWVRFIDogXHQxIDw8IDIsXG5cdE1PREVfS0FOSkkgOlx0XHQxIDw8IDNcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUkVycm9yQ29ycmVjdExldmVsXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy9leHBvcnRlZFxuXG52YXIgUVJFcnJvckNvcnJlY3RMZXZlbCA9IGV4cG9ydHMuUVJFcnJvckNvcnJlY3RMZXZlbCA9IHtcblx0TCA6IDEsXG5cdE0gOiAwLFxuXHRRIDogMyxcblx0SCA6IDJcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUk1hc2tQYXR0ZXJuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgUVJNYXNrUGF0dGVybiA9ICB7XG5cdFBBVFRFUk4wMDAgOiAwLFxuXHRQQVRURVJOMDAxIDogMSxcblx0UEFUVEVSTjAxMCA6IDIsXG5cdFBBVFRFUk4wMTEgOiAzLFxuXHRQQVRURVJOMTAwIDogNCxcblx0UEFUVEVSTjEwMSA6IDUsXG5cdFBBVFRFUk4xMTAgOiA2LFxuXHRQQVRURVJOMTExIDogN1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSVXRpbFxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiBcbnZhciBRUlV0aWwgPSB7XG5cbiAgICBQQVRURVJOX1BPU0lUSU9OX1RBQkxFIDogW1xuXHQgICAgW10sXG5cdCAgICBbNiwgMThdLFxuXHQgICAgWzYsIDIyXSxcblx0ICAgIFs2LCAyNl0sXG5cdCAgICBbNiwgMzBdLFxuXHQgICAgWzYsIDM0XSxcblx0ICAgIFs2LCAyMiwgMzhdLFxuXHQgICAgWzYsIDI0LCA0Ml0sXG5cdCAgICBbNiwgMjYsIDQ2XSxcblx0ICAgIFs2LCAyOCwgNTBdLFxuXHQgICAgWzYsIDMwLCA1NF0sXHRcdFxuXHQgICAgWzYsIDMyLCA1OF0sXG5cdCAgICBbNiwgMzQsIDYyXSxcblx0ICAgIFs2LCAyNiwgNDYsIDY2XSxcblx0ICAgIFs2LCAyNiwgNDgsIDcwXSxcblx0ICAgIFs2LCAyNiwgNTAsIDc0XSxcblx0ICAgIFs2LCAzMCwgNTQsIDc4XSxcblx0ICAgIFs2LCAzMCwgNTYsIDgyXSxcblx0ICAgIFs2LCAzMCwgNTgsIDg2XSxcblx0ICAgIFs2LCAzNCwgNjIsIDkwXSxcblx0ICAgIFs2LCAyOCwgNTAsIDcyLCA5NF0sXG5cdCAgICBbNiwgMjYsIDUwLCA3NCwgOThdLFxuXHQgICAgWzYsIDMwLCA1NCwgNzgsIDEwMl0sXG5cdCAgICBbNiwgMjgsIDU0LCA4MCwgMTA2XSxcblx0ICAgIFs2LCAzMiwgNTgsIDg0LCAxMTBdLFxuXHQgICAgWzYsIDMwLCA1OCwgODYsIDExNF0sXG5cdCAgICBbNiwgMzQsIDYyLCA5MCwgMTE4XSxcblx0ICAgIFs2LCAyNiwgNTAsIDc0LCA5OCwgMTIyXSxcblx0ICAgIFs2LCAzMCwgNTQsIDc4LCAxMDIsIDEyNl0sXG5cdCAgICBbNiwgMjYsIDUyLCA3OCwgMTA0LCAxMzBdLFxuXHQgICAgWzYsIDMwLCA1NiwgODIsIDEwOCwgMTM0XSxcblx0ICAgIFs2LCAzNCwgNjAsIDg2LCAxMTIsIDEzOF0sXG5cdCAgICBbNiwgMzAsIDU4LCA4NiwgMTE0LCAxNDJdLFxuXHQgICAgWzYsIDM0LCA2MiwgOTAsIDExOCwgMTQ2XSxcblx0ICAgIFs2LCAzMCwgNTQsIDc4LCAxMDIsIDEyNiwgMTUwXSxcblx0ICAgIFs2LCAyNCwgNTAsIDc2LCAxMDIsIDEyOCwgMTU0XSxcblx0ICAgIFs2LCAyOCwgNTQsIDgwLCAxMDYsIDEzMiwgMTU4XSxcblx0ICAgIFs2LCAzMiwgNTgsIDg0LCAxMTAsIDEzNiwgMTYyXSxcblx0ICAgIFs2LCAyNiwgNTQsIDgyLCAxMTAsIDEzOCwgMTY2XSxcblx0ICAgIFs2LCAzMCwgNTgsIDg2LCAxMTQsIDE0MiwgMTcwXVxuICAgIF0sXG5cbiAgICBHMTUgOiAoMSA8PCAxMCkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgNCkgfCAoMSA8PCAyKSB8ICgxIDw8IDEpIHwgKDEgPDwgMCksXG4gICAgRzE4IDogKDEgPDwgMTIpIHwgKDEgPDwgMTEpIHwgKDEgPDwgMTApIHwgKDEgPDwgOSkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgMikgfCAoMSA8PCAwKSxcbiAgICBHMTVfTUFTSyA6ICgxIDw8IDE0KSB8ICgxIDw8IDEyKSB8ICgxIDw8IDEwKVx0fCAoMSA8PCA0KSB8ICgxIDw8IDEpLFxuXG4gICAgZ2V0QkNIVHlwZUluZm8gOiBmdW5jdGlvbihkYXRhKSB7XG5cdCAgICB2YXIgZCA9IGRhdGEgPDwgMTA7XG5cdCAgICB3aGlsZSAoUVJVdGlsLmdldEJDSERpZ2l0KGQpIC0gUVJVdGlsLmdldEJDSERpZ2l0KFFSVXRpbC5HMTUpID49IDApIHtcblx0XHQgICAgZCBePSAoUVJVdGlsLkcxNSA8PCAoUVJVdGlsLmdldEJDSERpZ2l0KGQpIC0gUVJVdGlsLmdldEJDSERpZ2l0KFFSVXRpbC5HMTUpICkgKTsgXHRcblx0ICAgIH1cblx0ICAgIHJldHVybiAoIChkYXRhIDw8IDEwKSB8IGQpIF4gUVJVdGlsLkcxNV9NQVNLO1xuICAgIH0sXG5cbiAgICBnZXRCQ0hUeXBlTnVtYmVyIDogZnVuY3Rpb24oZGF0YSkge1xuXHQgICAgdmFyIGQgPSBkYXRhIDw8IDEyO1xuXHQgICAgd2hpbGUgKFFSVXRpbC5nZXRCQ0hEaWdpdChkKSAtIFFSVXRpbC5nZXRCQ0hEaWdpdChRUlV0aWwuRzE4KSA+PSAwKSB7XG5cdFx0ICAgIGQgXj0gKFFSVXRpbC5HMTggPDwgKFFSVXRpbC5nZXRCQ0hEaWdpdChkKSAtIFFSVXRpbC5nZXRCQ0hEaWdpdChRUlV0aWwuRzE4KSApICk7IFx0XG5cdCAgICB9XG5cdCAgICByZXR1cm4gKGRhdGEgPDwgMTIpIHwgZDtcbiAgICB9LFxuXG4gICAgZ2V0QkNIRGlnaXQgOiBmdW5jdGlvbihkYXRhKSB7XG5cblx0ICAgIHZhciBkaWdpdCA9IDA7XG5cblx0ICAgIHdoaWxlIChkYXRhICE9IDApIHtcblx0XHQgICAgZGlnaXQrKztcblx0XHQgICAgZGF0YSA+Pj49IDE7XG5cdCAgICB9XG5cblx0ICAgIHJldHVybiBkaWdpdDtcbiAgICB9LFxuXG4gICAgZ2V0UGF0dGVyblBvc2l0aW9uIDogZnVuY3Rpb24odHlwZU51bWJlcikge1xuXHQgICAgcmV0dXJuIFFSVXRpbC5QQVRURVJOX1BPU0lUSU9OX1RBQkxFW3R5cGVOdW1iZXIgLSAxXTtcbiAgICB9LFxuXG4gICAgZ2V0TWFzayA6IGZ1bmN0aW9uKG1hc2tQYXR0ZXJuLCBpLCBqKSB7XG5cdCAgICBcblx0ICAgIHN3aXRjaCAobWFza1BhdHRlcm4pIHtcblx0XHQgICAgXG5cdCAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAwMCA6IHJldHVybiAoaSArIGopICUgMiA9PSAwO1xuXHQgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMDEgOiByZXR1cm4gaSAlIDIgPT0gMDtcblx0ICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDEwIDogcmV0dXJuIGogJSAzID09IDA7XG5cdCAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAxMSA6IHJldHVybiAoaSArIGopICUgMyA9PSAwO1xuXHQgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMDAgOiByZXR1cm4gKE1hdGguZmxvb3IoaSAvIDIpICsgTWF0aC5mbG9vcihqIC8gMykgKSAlIDIgPT0gMDtcblx0ICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMTAxIDogcmV0dXJuIChpICogaikgJSAyICsgKGkgKiBqKSAlIDMgPT0gMDtcblx0ICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMTEwIDogcmV0dXJuICggKGkgKiBqKSAlIDIgKyAoaSAqIGopICUgMykgJSAyID09IDA7XG5cdCAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjExMSA6IHJldHVybiAoIChpICogaikgJSAzICsgKGkgKyBqKSAlIDIpICUgMiA9PSAwO1xuXG5cdCAgICBkZWZhdWx0IDpcblx0XHQgICAgdGhyb3cgbmV3IEVycm9yKFwiYmFkIG1hc2tQYXR0ZXJuOlwiICsgbWFza1BhdHRlcm4pO1xuXHQgICAgfVxuICAgIH0sXG5cbiAgICBnZXRFcnJvckNvcnJlY3RQb2x5bm9taWFsIDogZnVuY3Rpb24oZXJyb3JDb3JyZWN0TGVuZ3RoKSB7XG5cblx0ICAgIHZhciBhID0gbmV3IFFSUG9seW5vbWlhbChbMV0sIDApO1xuXG5cdCAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVycm9yQ29ycmVjdExlbmd0aDsgaSsrKSB7XG5cdFx0ICAgIGEgPSBhLm11bHRpcGx5KG5ldyBRUlBvbHlub21pYWwoWzEsIFFSTWF0aC5nZXhwKGkpXSwgMCkgKTtcblx0ICAgIH1cblxuXHQgICAgcmV0dXJuIGE7XG4gICAgfSxcblxuICAgIGdldExlbmd0aEluQml0cyA6IGZ1bmN0aW9uKG1vZGUsIHR5cGUpIHtcblxuXHQgICAgaWYgKDEgPD0gdHlwZSAmJiB0eXBlIDwgMTApIHtcblxuXHRcdCAgICAvLyAxIC0gOVxuXG5cdFx0ICAgIHN3aXRjaChtb2RlKSB7XG5cdFx0ICAgIGNhc2UgUVJNb2RlLk1PREVfTlVNQkVSIFx0OiByZXR1cm4gMTA7XG5cdFx0ICAgIGNhc2UgUVJNb2RlLk1PREVfQUxQSEFfTlVNIFx0OiByZXR1cm4gOTtcblx0XHQgICAgY2FzZSBRUk1vZGUuTU9ERV84QklUX0JZVEVcdDogcmV0dXJuIDg7XG5cdFx0ICAgIGNhc2UgUVJNb2RlLk1PREVfS0FOSkkgIFx0OiByZXR1cm4gODtcblx0XHQgICAgZGVmYXVsdCA6XG5cdFx0XHQgICAgdGhyb3cgbmV3IEVycm9yKFwibW9kZTpcIiArIG1vZGUpO1xuXHRcdCAgICB9XG5cblx0ICAgIH0gZWxzZSBpZiAodHlwZSA8IDI3KSB7XG5cblx0XHQgICAgLy8gMTAgLSAyNlxuXG5cdFx0ICAgIHN3aXRjaChtb2RlKSB7XG5cdFx0ICAgIGNhc2UgUVJNb2RlLk1PREVfTlVNQkVSIFx0OiByZXR1cm4gMTI7XG5cdFx0ICAgIGNhc2UgUVJNb2RlLk1PREVfQUxQSEFfTlVNIFx0OiByZXR1cm4gMTE7XG5cdFx0ICAgIGNhc2UgUVJNb2RlLk1PREVfOEJJVF9CWVRFXHQ6IHJldHVybiAxNjtcblx0XHQgICAgY2FzZSBRUk1vZGUuTU9ERV9LQU5KSSAgXHQ6IHJldHVybiAxMDtcblx0XHQgICAgZGVmYXVsdCA6XG5cdFx0XHQgICAgdGhyb3cgbmV3IEVycm9yKFwibW9kZTpcIiArIG1vZGUpO1xuXHRcdCAgICB9XG5cblx0ICAgIH0gZWxzZSBpZiAodHlwZSA8IDQxKSB7XG5cblx0XHQgICAgLy8gMjcgLSA0MFxuXG5cdFx0ICAgIHN3aXRjaChtb2RlKSB7XG5cdFx0ICAgIGNhc2UgUVJNb2RlLk1PREVfTlVNQkVSIFx0OiByZXR1cm4gMTQ7XG5cdFx0ICAgIGNhc2UgUVJNb2RlLk1PREVfQUxQSEFfTlVNXHQ6IHJldHVybiAxMztcblx0XHQgICAgY2FzZSBRUk1vZGUuTU9ERV84QklUX0JZVEVcdDogcmV0dXJuIDE2O1xuXHRcdCAgICBjYXNlIFFSTW9kZS5NT0RFX0tBTkpJICBcdDogcmV0dXJuIDEyO1xuXHRcdCAgICBkZWZhdWx0IDpcblx0XHRcdCAgICB0aHJvdyBuZXcgRXJyb3IoXCJtb2RlOlwiICsgbW9kZSk7XG5cdFx0ICAgIH1cblxuXHQgICAgfSBlbHNlIHtcblx0XHQgICAgdGhyb3cgbmV3IEVycm9yKFwidHlwZTpcIiArIHR5cGUpO1xuXHQgICAgfVxuICAgIH0sXG5cbiAgICBnZXRMb3N0UG9pbnQgOiBmdW5jdGlvbihxckNvZGUpIHtcblx0ICAgIFxuXHQgICAgdmFyIG1vZHVsZUNvdW50ID0gcXJDb2RlLmdldE1vZHVsZUNvdW50KCk7XG5cdCAgICBcblx0ICAgIHZhciBsb3N0UG9pbnQgPSAwO1xuXHQgICAgXG5cdCAgICAvLyBMRVZFTDFcblx0ICAgIFxuXHQgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQ7IHJvdysrKSB7XG5cblx0XHQgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQ7IGNvbCsrKSB7XG5cblx0XHRcdCAgICB2YXIgc2FtZUNvdW50ID0gMDtcblx0XHRcdCAgICB2YXIgZGFyayA9IHFyQ29kZS5pc0Rhcmsocm93LCBjb2wpO1xuXG5cdFx0XHRcdGZvciAodmFyIHIgPSAtMTsgciA8PSAxOyByKyspIHtcblxuXHRcdFx0XHQgICAgaWYgKHJvdyArIHIgPCAwIHx8IG1vZHVsZUNvdW50IDw9IHJvdyArIHIpIHtcblx0XHRcdFx0XHQgICAgY29udGludWU7XG5cdFx0XHRcdCAgICB9XG5cblx0XHRcdFx0ICAgIGZvciAodmFyIGMgPSAtMTsgYyA8PSAxOyBjKyspIHtcblxuXHRcdFx0XHRcdCAgICBpZiAoY29sICsgYyA8IDAgfHwgbW9kdWxlQ291bnQgPD0gY29sICsgYykge1xuXHRcdFx0XHRcdFx0ICAgIGNvbnRpbnVlO1xuXHRcdFx0XHRcdCAgICB9XG5cblx0XHRcdFx0XHQgICAgaWYgKHIgPT0gMCAmJiBjID09IDApIHtcblx0XHRcdFx0XHRcdCAgICBjb250aW51ZTtcblx0XHRcdFx0XHQgICAgfVxuXG5cdFx0XHRcdFx0ICAgIGlmIChkYXJrID09IHFyQ29kZS5pc0Rhcmsocm93ICsgciwgY29sICsgYykgKSB7XG5cdFx0XHRcdFx0XHQgICAgc2FtZUNvdW50Kys7XG5cdFx0XHRcdFx0ICAgIH1cblx0XHRcdFx0ICAgIH1cblx0XHRcdCAgICB9XG5cblx0XHRcdCAgICBpZiAoc2FtZUNvdW50ID4gNSkge1xuXHRcdFx0XHQgICAgbG9zdFBvaW50ICs9ICgzICsgc2FtZUNvdW50IC0gNSk7XG5cdFx0XHQgICAgfVxuXHRcdCAgICB9XG5cdCAgICB9XG5cblx0ICAgIC8vIExFVkVMMlxuXG5cdCAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudCAtIDE7IHJvdysrKSB7XG5cdFx0ICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50IC0gMTsgY29sKyspIHtcblx0XHRcdCAgICB2YXIgY291bnQgPSAwO1xuXHRcdFx0ICAgIGlmIChxckNvZGUuaXNEYXJrKHJvdywgICAgIGNvbCAgICApICkgY291bnQrKztcblx0XHRcdCAgICBpZiAocXJDb2RlLmlzRGFyayhyb3cgKyAxLCBjb2wgICAgKSApIGNvdW50Kys7XG5cdFx0XHQgICAgaWYgKHFyQ29kZS5pc0Rhcmsocm93LCAgICAgY29sICsgMSkgKSBjb3VudCsrO1xuXHRcdFx0ICAgIGlmIChxckNvZGUuaXNEYXJrKHJvdyArIDEsIGNvbCArIDEpICkgY291bnQrKztcblx0XHRcdCAgICBpZiAoY291bnQgPT0gMCB8fCBjb3VudCA9PSA0KSB7XG5cdFx0XHRcdCAgICBsb3N0UG9pbnQgKz0gMztcblx0XHRcdCAgICB9XG5cdFx0ICAgIH1cblx0ICAgIH1cblxuXHQgICAgLy8gTEVWRUwzXG5cblx0ICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50OyByb3crKykge1xuXHRcdCAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudCAtIDY7IGNvbCsrKSB7XG5cdFx0XHQgICAgaWYgKHFyQ29kZS5pc0Rhcmsocm93LCBjb2wpXG5cdFx0XHRcdFx0ICAgICYmICFxckNvZGUuaXNEYXJrKHJvdywgY29sICsgMSlcblx0XHRcdFx0XHQgICAgJiYgIHFyQ29kZS5pc0Rhcmsocm93LCBjb2wgKyAyKVxuXHRcdFx0XHRcdCAgICAmJiAgcXJDb2RlLmlzRGFyayhyb3csIGNvbCArIDMpXG5cdFx0XHRcdFx0ICAgICYmICBxckNvZGUuaXNEYXJrKHJvdywgY29sICsgNClcblx0XHRcdFx0XHQgICAgJiYgIXFyQ29kZS5pc0Rhcmsocm93LCBjb2wgKyA1KVxuXHRcdFx0XHRcdCAgICAmJiAgcXJDb2RlLmlzRGFyayhyb3csIGNvbCArIDYpICkge1xuXHRcdFx0XHQgICAgbG9zdFBvaW50ICs9IDQwO1xuXHRcdFx0ICAgIH1cblx0XHQgICAgfVxuXHQgICAgfVxuXG5cdCAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudDsgY29sKyspIHtcblx0XHQgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQgLSA2OyByb3crKykge1xuXHRcdFx0ICAgIGlmIChxckNvZGUuaXNEYXJrKHJvdywgY29sKVxuXHRcdFx0XHRcdCAgICAmJiAhcXJDb2RlLmlzRGFyayhyb3cgKyAxLCBjb2wpXG5cdFx0XHRcdFx0ICAgICYmICBxckNvZGUuaXNEYXJrKHJvdyArIDIsIGNvbClcblx0XHRcdFx0XHQgICAgJiYgIHFyQ29kZS5pc0Rhcmsocm93ICsgMywgY29sKVxuXHRcdFx0XHRcdCAgICAmJiAgcXJDb2RlLmlzRGFyayhyb3cgKyA0LCBjb2wpXG5cdFx0XHRcdFx0ICAgICYmICFxckNvZGUuaXNEYXJrKHJvdyArIDUsIGNvbClcblx0XHRcdFx0XHQgICAgJiYgIHFyQ29kZS5pc0Rhcmsocm93ICsgNiwgY29sKSApIHtcblx0XHRcdFx0ICAgIGxvc3RQb2ludCArPSA0MDtcblx0XHRcdCAgICB9XG5cdFx0ICAgIH1cblx0ICAgIH1cblxuXHQgICAgLy8gTEVWRUw0XG5cdCAgICBcblx0ICAgIHZhciBkYXJrQ291bnQgPSAwO1xuXG5cdCAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudDsgY29sKyspIHtcblx0XHQgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQ7IHJvdysrKSB7XG5cdFx0XHQgICAgaWYgKHFyQ29kZS5pc0Rhcmsocm93LCBjb2wpICkge1xuXHRcdFx0XHQgICAgZGFya0NvdW50Kys7XG5cdFx0XHQgICAgfVxuXHRcdCAgICB9XG5cdCAgICB9XG5cdCAgICBcblx0ICAgIHZhciByYXRpbyA9IE1hdGguYWJzKDEwMCAqIGRhcmtDb3VudCAvIG1vZHVsZUNvdW50IC8gbW9kdWxlQ291bnQgLSA1MCkgLyA1O1xuXHQgICAgbG9zdFBvaW50ICs9IHJhdGlvICogMTA7XG5cblx0ICAgIHJldHVybiBsb3N0UG9pbnQ7XHRcdFxuICAgIH1cblxufTtcblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVJNYXRoXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgUVJNYXRoID0ge1xuXG5cdGdsb2cgOiBmdW5jdGlvbihuKSB7XG5cdFxuXHRcdGlmIChuIDwgMSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiZ2xvZyhcIiArIG4gKyBcIilcIik7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBRUk1hdGguTE9HX1RBQkxFW25dO1xuXHR9LFxuXHRcblx0Z2V4cCA6IGZ1bmN0aW9uKG4pIHtcblx0XG5cdFx0d2hpbGUgKG4gPCAwKSB7XG5cdFx0XHRuICs9IDI1NTtcblx0XHR9XG5cdFxuXHRcdHdoaWxlIChuID49IDI1Nikge1xuXHRcdFx0biAtPSAyNTU7XG5cdFx0fVxuXHRcblx0XHRyZXR1cm4gUVJNYXRoLkVYUF9UQUJMRVtuXTtcblx0fSxcblx0XG5cdEVYUF9UQUJMRSA6IG5ldyBBcnJheSgyNTYpLFxuXHRcblx0TE9HX1RBQkxFIDogbmV3IEFycmF5KDI1NilcblxufTtcblx0XG5mb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuXHRRUk1hdGguRVhQX1RBQkxFW2ldID0gMSA8PCBpO1xufVxuZm9yICh2YXIgaSA9IDg7IGkgPCAyNTY7IGkrKykge1xuXHRRUk1hdGguRVhQX1RBQkxFW2ldID0gUVJNYXRoLkVYUF9UQUJMRVtpIC0gNF1cblx0XHReIFFSTWF0aC5FWFBfVEFCTEVbaSAtIDVdXG5cdFx0XiBRUk1hdGguRVhQX1RBQkxFW2kgLSA2XVxuXHRcdF4gUVJNYXRoLkVYUF9UQUJMRVtpIC0gOF07XG59XG5mb3IgKHZhciBpID0gMDsgaSA8IDI1NTsgaSsrKSB7XG5cdFFSTWF0aC5MT0dfVEFCTEVbUVJNYXRoLkVYUF9UQUJMRVtpXSBdID0gaTtcbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSUG9seW5vbWlhbFxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gUVJQb2x5bm9taWFsKG51bSwgc2hpZnQpIHtcblxuXHRpZiAobnVtLmxlbmd0aCA9PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IobnVtLmxlbmd0aCArIFwiL1wiICsgc2hpZnQpO1xuXHR9XG5cblx0dmFyIG9mZnNldCA9IDA7XG5cblx0d2hpbGUgKG9mZnNldCA8IG51bS5sZW5ndGggJiYgbnVtW29mZnNldF0gPT0gMCkge1xuXHRcdG9mZnNldCsrO1xuXHR9XG5cblx0dGhpcy5udW0gPSBuZXcgQXJyYXkobnVtLmxlbmd0aCAtIG9mZnNldCArIHNoaWZ0KTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBudW0ubGVuZ3RoIC0gb2Zmc2V0OyBpKyspIHtcblx0XHR0aGlzLm51bVtpXSA9IG51bVtpICsgb2Zmc2V0XTtcblx0fVxufVxuXG5RUlBvbHlub21pYWwucHJvdG90eXBlID0ge1xuXG5cdGdldCA6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0cmV0dXJuIHRoaXMubnVtW2luZGV4XTtcblx0fSxcblx0XG5cdGdldExlbmd0aCA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLm51bS5sZW5ndGg7XG5cdH0sXG5cdFxuXHRtdWx0aXBseSA6IGZ1bmN0aW9uKGUpIHtcblx0XG5cdFx0dmFyIG51bSA9IG5ldyBBcnJheSh0aGlzLmdldExlbmd0aCgpICsgZS5nZXRMZW5ndGgoKSAtIDEpO1xuXHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2V0TGVuZ3RoKCk7IGkrKykge1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBlLmdldExlbmd0aCgpOyBqKyspIHtcblx0XHRcdFx0bnVtW2kgKyBqXSBePSBRUk1hdGguZ2V4cChRUk1hdGguZ2xvZyh0aGlzLmdldChpKSApICsgUVJNYXRoLmdsb2coZS5nZXQoaikgKSApO1xuXHRcdFx0fVxuXHRcdH1cblx0XG5cdFx0cmV0dXJuIG5ldyBRUlBvbHlub21pYWwobnVtLCAwKTtcblx0fSxcblx0XG5cdG1vZCA6IGZ1bmN0aW9uKGUpIHtcblx0XG5cdFx0aWYgKHRoaXMuZ2V0TGVuZ3RoKCkgLSBlLmdldExlbmd0aCgpIDwgMCkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHRcblx0XHR2YXIgcmF0aW8gPSBRUk1hdGguZ2xvZyh0aGlzLmdldCgwKSApIC0gUVJNYXRoLmdsb2coZS5nZXQoMCkgKTtcblx0XG5cdFx0dmFyIG51bSA9IG5ldyBBcnJheSh0aGlzLmdldExlbmd0aCgpICk7XG5cdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdldExlbmd0aCgpOyBpKyspIHtcblx0XHRcdG51bVtpXSA9IHRoaXMuZ2V0KGkpO1xuXHRcdH1cblx0XHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGUuZ2V0TGVuZ3RoKCk7IGkrKykge1xuXHRcdFx0bnVtW2ldIF49IFFSTWF0aC5nZXhwKFFSTWF0aC5nbG9nKGUuZ2V0KGkpICkgKyByYXRpbyk7XG5cdFx0fVxuXHRcblx0XHQvLyByZWN1cnNpdmUgY2FsbFxuXHRcdHJldHVybiBuZXcgUVJQb2x5bm9taWFsKG51bSwgMCkubW9kKGUpO1xuXHR9XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVJSU0Jsb2NrXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBRUlJTQmxvY2sodG90YWxDb3VudCwgZGF0YUNvdW50KSB7XG5cdHRoaXMudG90YWxDb3VudCA9IHRvdGFsQ291bnQ7XG5cdHRoaXMuZGF0YUNvdW50ICA9IGRhdGFDb3VudDtcbn1cblxuUVJSU0Jsb2NrLlJTX0JMT0NLX1RBQkxFID0gW1xuLy8gTFxuLy8gTVxuLy8gUVxuLy8gSFxuXG4vLyAxXG5bMSwgMjYsIDE5XSxcblsxLCAyNiwgMTZdLFxuWzEsIDI2LCAxM10sXG5bMSwgMjYsIDldLFxuLy8gMlxuWzEsIDQ0LCAzNF0sXG5bMSwgNDQsIDI4XSxcblsxLCA0NCwgMjJdLFxuWzEsIDQ0LCAxNl0sXG4vLyAzXG5bMSwgNzAsIDU1XSxcblsxLCA3MCwgNDRdLFxuWzIsIDM1LCAxN10sXG5bMiwgMzUsIDEzXSxcbi8vIDRcdFx0XG5bMSwgMTAwLCA4MF0sXG5bMiwgNTAsIDMyXSxcblsyLCA1MCwgMjRdLFxuWzQsIDI1LCA5XSxcbi8vIDVcblsxLCAxMzQsIDEwOF0sXG5bMiwgNjcsIDQzXSxcblsyLCAzMywgMTUsIDIsIDM0LCAxNl0sXG5bMiwgMzMsIDExLCAyLCAzNCwgMTJdLFxuLy8gNlxuWzIsIDg2LCA2OF0sXG5bNCwgNDMsIDI3XSxcbls0LCA0MywgMTldLFxuWzQsIDQzLCAxNV0sXG4vLyA3XHRcdFxuWzIsIDk4LCA3OF0sXG5bNCwgNDksIDMxXSxcblsyLCAzMiwgMTQsIDQsIDMzLCAxNV0sXG5bNCwgMzksIDEzLCAxLCA0MCwgMTRdLFxuLy8gOFxuWzIsIDEyMSwgOTddLFxuWzIsIDYwLCAzOCwgMiwgNjEsIDM5XSxcbls0LCA0MCwgMTgsIDIsIDQxLCAxOV0sXG5bNCwgNDAsIDE0LCAyLCA0MSwgMTVdLFxuLy8gOVxuWzIsIDE0NiwgMTE2XSxcblszLCA1OCwgMzYsIDIsIDU5LCAzN10sXG5bNCwgMzYsIDE2LCA0LCAzNywgMTddLFxuWzQsIDM2LCAxMiwgNCwgMzcsIDEzXSxcbi8vIDEwXHRcdFxuWzIsIDg2LCA2OCwgMiwgODcsIDY5XSxcbls0LCA2OSwgNDMsIDEsIDcwLCA0NF0sXG5bNiwgNDMsIDE5LCAyLCA0NCwgMjBdLFxuWzYsIDQzLCAxNSwgMiwgNDQsIDE2XVxuLy9OT1RFIGFkZGVkIGJ5IFJ5YW4gRGF5LnRvIG1ha2UgZ3JlYXRlciB0aGFuIHZlcnNpb24gMTAgcXJjb2Rlc1xuLy8gdGhpcyB0YWJsZSBzdGFydHMgb24gcGFnZSA0MCBvZiB0aGUgc3BlYyBQREYuIGdvb2dsZSBJU08vSUVDIDE4MDA0XG4vLyAxMVxuLFs0LDEwMSw4MV1cbixbMSw4MCw1MCw0LDgxLDUxXVxuLFs0LDUwLDIyLDQsNTEsMjNdXG4sWzMsMzYsMTIsOCwzNywxM11cbi8vMTJcbixbMiwxMTYsOTIsMiwxMTcsOTNdXG4sWzYsNTgsMzYsMiw1OSwzN11cbixbNCw0NiwyMCw2LDQ3LDIxXVxuLFs3LDQyLDE0LDQsNDMsMTVdXG4vLzEzXG4sWzQsMTMzLDEwN11cbixbOCw1OSwzNywxLDYwLDM4XVxuLFs4LDQ0LDIwLDQsNDUsMjFdXG4sWzEyLDMzLDExLDQsMzQsMTJdXG4vLzE0XG4sWzMsMTQ1LDExNSwxLDE0NiwxMTZdXG4sWzQsNjQsNDAsNSw2NSw0MV1cbixbMTEsMzYsMTYsNSwzNywxN11cbixbMTEsMzYsMTIsNSwzNywxM11cbi8vMTVcbixbNSwxMDksODcsMSwxMTAsODhdXG4sWzUsNjUsNDEsNSw2Niw0Ml1cbixbNSw1NCwyNCw3LDU1LDI1XVxuLFsxMSwzNiwxMiw3LDM3LDEzXVxuLy8xNlxuLFs1LDEyMiw5OCwxLDEyMyw5OV1cbixbNyw3Myw0NSwzLDc0LDQ2XVxuLFsxNSw0MywxOSwyLDQ0LDIwXVxuLFszLDQ1LDE1LDEzLDQ2LDE2XVxuLy8xN1xuLFsxLDEzNSwxMDcsNSwxMzYsMTA4XVxuLFsxMCw3NCw0NiwxLDc1LDQ3XVxuLFsxLDUwLDIyLDE1LDUxLDIzXVxuLFsyLDQyLDE0LDE3LDQzLDE1XVxuLy8xOFxuLFs1LDE1MCwxMjAsMSwxNTEsMTIxXVxuLFs5LDY5LDQzLDQsNzAsNDRdXG4sWzE3LDUwLDIyLDEsNTEsMjNdXG4sWzIsNDIsMTQsMTksNDMsMTVdXG4vLzE5XG4sWzMsMTQxLDExMyw0LDE0MiwxMTRdXG4sWzMsNzAsNDQsMTEsNzEsNDVdXG4sWzE3LDQ3LDIxLDQsNDgsMjJdXG4sWzksMzksMTMsMTYsNDAsMTRdXG4vLzIwXG4sWzMsMTM1LDEwNyw1LDEzNiwxMDhdXG4sWzMsNjcsNDEsMTMsNjgsNDJdXG4sWzE1LDU0LDI0LDUsNTUsMjVdXG4sWzE1LDQzLDE1LDEwLDQ0LDE2XVxuLy8yMVxuLFs0LDE0NCwxMTYsNCwxNDUsMTE3XVxuLFsxNyw2OCw0Ml1cbixbMTcsNTAsMjIsNiw1MSwyM11cbixbMTksNDYsMTYsNiw0NywxN11cbi8vMjJcbixbMiwxMzksMTExLDcsMTQwLDExMl1cbixbMTcsNzQsNDZdXG4sWzcsNTQsMjQsMTYsNTUsMjVdXG4sWzM0LDM3LDEzXVxuLy8yM1xuLFs0LDE1MSwxMjEsNSwxNTIsMTIyXVxuLFs0LDc1LDQ3LDE0LDc2LDQ4XVxuLFsxMSw1NCwyNCwxNCw1NSwyNV1cbixbMTYsNDUsMTUsMTQsNDYsMTZdXG4vLzI0XG4sWzYsMTQ3LDExNyw0LDE0OCwxMThdXG4sWzYsNzMsNDUsMTQsNzQsNDZdXG4sWzExLDU0LDI0LDE2LDU1LDI1XVxuLFszMCw0NiwxNiwyLDQ3LDE3XVxuLy8yNVxuLFs4LDEzMiwxMDYsNCwxMzMsMTA3XVxuLFs4LDc1LDQ3LDEzLDc2LDQ4XVxuLFs3LDU0LDI0LDIyLDU1LDI1XVxuLFsyMiw0NSwxNSwxMyw0NiwxNl1cbi8vMjZcbixbMTAsMTQyLDExNCwyLDE0MywxMTVdXG4sWzE5LDc0LDQ2LDQsNzUsNDddXG4sWzI4LDUwLDIyLDYsNTEsMjNdXG4sWzMzLDQ2LDE2LDQsNDcsMTddXG4vLzI3XG4sWzgsMTUyLDEyMiw0LDE1MywxMjNdXG4sWzIyLDczLDQ1LDMsNzQsNDZdXG4sWzgsNTMsMjMsMjYsNTQsMjRdXG4sWzEyLDQ1LDE1LDI4LDQ2LDE2XVxuLy8yOFxuLFszLDE0NywxMTcsMTAsMTQ4LDExOF1cbixbMyw3Myw0NSwyMyw3NCw0Nl1cbixbNCw1NCwyNCwzMSw1NSwyNV1cbixbMTEsNDUsMTUsMzEsNDYsMTZdXG4vLzI5XG4sWzcsMTQ2LDExNiw3LDE0NywxMTddXG4sWzIxLDczLDQ1LDcsNzQsNDZdXG4sWzEsNTMsMjMsMzcsNTQsMjRdXG4sWzE5LDQ1LDE1LDI2LDQ2LDE2XVxuLy8zMFxuLFs1LDE0NSwxMTUsMTAsMTQ2LDExNl1cbixbMTksNzUsNDcsMTAsNzYsNDhdXG4sWzE1LDU0LDI0LDI1LDU1LDI1XVxuLFsyMyw0NSwxNSwyNSw0NiwxNl1cbi8vMzFcbixbMTMsMTQ1LDExNSwzLDE0NiwxMTZdXG4sWzIsNzQsNDYsMjksNzUsNDddXG4sWzQyLDU0LDI0LDEsNTUsMjVdXG4sWzIzLDQ1LDE1LDI4LDQ2LDE2XVxuLy8zMlxuLFsxNywxNDUsMTE1XVxuLFsxMCw3NCw0NiwyMyw3NSw0N11cbixbMTAsNTQsMjQsMzUsNTUsMjVdXG4sWzE5LDQ1LDE1LDM1LDQ2LDE2XVxuLy8zM1xuLFsxNywxNDUsMTE1LDEsMTQ2LDExNl1cbixbMTQsNzQsNDYsMjEsNzUsNDddXG4sWzI5LDU0LDI0LDE5LDU1LDI1XVxuLFsxMSw0NSwxNSw0Niw0NiwxNl1cbi8vMzRcbixbMTMsMTQ1LDExNSw2LDE0NiwxMTZdXG4sWzE0LDc0LDQ2LDIzLDc1LDQ3XVxuLFs0NCw1NCwyNCw3LDU1LDI1XVxuLFs1OSw0NiwxNiwxLDQ3LDE3XVxuLy8zNVxuLFsxMiwxNTEsMTIxLDcsMTUyLDEyMl1cbixbMTIsNzUsNDcsMjYsNzYsNDhdXG4sWzM5LDU0LDI0LDE0LDU1LDI1XVxuLFsyMiw0NSwxNSw0MSw0NiwxNl1cbi8vMzZcbixbNiwxNTEsMTIxLDE0LDE1MiwxMjJdXG4sWzYsNzUsNDcsMzQsNzYsNDhdXG4sWzQ2LDU0LDI0LDEwLDU1LDI1XVxuLFsyLDQ1LDE1LDY0LDQ2LDE2XVxuLy8zN1xuLFsxNywxNTIsMTIyLDQsMTUzLDEyM11cbixbMjksNzQsNDYsMTQsNzUsNDddXG4sWzQ5LDU0LDI0LDEwLDU1LDI1XVxuLFsyNCw0NSwxNSw0Niw0NiwxNl1cbi8vMzhcbixbNCwxNTIsMTIyLDE4LDE1MywxMjNdXG4sWzEzLDc0LDQ2LDMyLDc1LDQ3XVxuLFs0OCw1NCwyNCwxNCw1NSwyNV1cbixbNDIsNDUsMTUsMzIsNDYsMTZdXG4vLzM5XG4sWzIwLDE0NywxMTcsNCwxNDgsMTE4XVxuLFs0MCw3NSw0Nyw3LDc2LDQ4XVxuLFs0Myw1NCwyNCwyMiw1NSwyNV1cbixbMTAsNDUsMTUsNjcsNDYsMTZdXG4vLzQwXG4sWzE5LDE0OCwxMTgsNiwxNDksMTE5XVxuLFsxOCw3NSw0NywzMSw3Niw0OF1cbixbMzQsNTQsMjQsMzQsNTUsMjVdXG4sWzIwLDQ1LDE1LDYxLDQ2LDE2XVx0XG5dO1xuXG5RUlJTQmxvY2suZ2V0UlNCbG9ja3MgPSBmdW5jdGlvbih0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3RMZXZlbCkge1xuXHRcblx0dmFyIHJzQmxvY2sgPSBRUlJTQmxvY2suZ2V0UnNCbG9ja1RhYmxlKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdExldmVsKTtcblx0XG5cdGlmIChyc0Jsb2NrID09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImJhZCBycyBibG9jayBAIHR5cGVOdW1iZXI6XCIgKyB0eXBlTnVtYmVyICsgXCIvZXJyb3JDb3JyZWN0TGV2ZWw6XCIgKyBlcnJvckNvcnJlY3RMZXZlbCk7XG5cdH1cblxuXHR2YXIgbGVuZ3RoID0gcnNCbG9jay5sZW5ndGggLyAzO1xuXHRcblx0dmFyIGxpc3QgPSBuZXcgQXJyYXkoKTtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblxuXHRcdHZhciBjb3VudCA9IHJzQmxvY2tbaSAqIDMgKyAwXTtcblx0XHR2YXIgdG90YWxDb3VudCA9IHJzQmxvY2tbaSAqIDMgKyAxXTtcblx0XHR2YXIgZGF0YUNvdW50ICA9IHJzQmxvY2tbaSAqIDMgKyAyXTtcblxuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY291bnQ7IGorKykge1xuXHRcdFx0bGlzdC5wdXNoKG5ldyBRUlJTQmxvY2sodG90YWxDb3VudCwgZGF0YUNvdW50KSApO1x0XG5cdFx0fVxuXHR9XG5cdFxuXHRyZXR1cm4gbGlzdDtcbn1cblxuUVJSU0Jsb2NrLmdldFJzQmxvY2tUYWJsZSA9IGZ1bmN0aW9uKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdExldmVsKSB7XG5cblx0c3dpdGNoKGVycm9yQ29ycmVjdExldmVsKSB7XG5cdGNhc2UgUVJFcnJvckNvcnJlY3RMZXZlbC5MIDpcblx0XHRyZXR1cm4gUVJSU0Jsb2NrLlJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyIC0gMSkgKiA0ICsgMF07XG5cdGNhc2UgUVJFcnJvckNvcnJlY3RMZXZlbC5NIDpcblx0XHRyZXR1cm4gUVJSU0Jsb2NrLlJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyIC0gMSkgKiA0ICsgMV07XG5cdGNhc2UgUVJFcnJvckNvcnJlY3RMZXZlbC5RIDpcblx0XHRyZXR1cm4gUVJSU0Jsb2NrLlJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyIC0gMSkgKiA0ICsgMl07XG5cdGNhc2UgUVJFcnJvckNvcnJlY3RMZXZlbC5IIDpcblx0XHRyZXR1cm4gUVJSU0Jsb2NrLlJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyIC0gMSkgKiA0ICsgM107XG5cdGRlZmF1bHQgOlxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSQml0QnVmZmVyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBRUkJpdEJ1ZmZlcigpIHtcblx0dGhpcy5idWZmZXIgPSBuZXcgQXJyYXkoKTtcblx0dGhpcy5sZW5ndGggPSAwO1xufVxuXG5RUkJpdEJ1ZmZlci5wcm90b3R5cGUgPSB7XG5cblx0Z2V0IDogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHR2YXIgYnVmSW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gOCk7XG5cdFx0cmV0dXJuICggKHRoaXMuYnVmZmVyW2J1ZkluZGV4XSA+Pj4gKDcgLSBpbmRleCAlIDgpICkgJiAxKSA9PSAxO1xuXHR9LFxuXHRcblx0cHV0IDogZnVuY3Rpb24obnVtLCBsZW5ndGgpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLnB1dEJpdCggKCAobnVtID4+PiAobGVuZ3RoIC0gaSAtIDEpICkgJiAxKSA9PSAxKTtcblx0XHR9XG5cdH0sXG5cdFxuXHRnZXRMZW5ndGhJbkJpdHMgOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5sZW5ndGg7XG5cdH0sXG5cdFxuXHRwdXRCaXQgOiBmdW5jdGlvbihiaXQpIHtcblx0XG5cdFx0dmFyIGJ1ZkluZGV4ID0gTWF0aC5mbG9vcih0aGlzLmxlbmd0aCAvIDgpO1xuXHRcdGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPD0gYnVmSW5kZXgpIHtcblx0XHRcdHRoaXMuYnVmZmVyLnB1c2goMCk7XG5cdFx0fVxuXHRcblx0XHRpZiAoYml0KSB7XG5cdFx0XHR0aGlzLmJ1ZmZlcltidWZJbmRleF0gfD0gKDB4ODAgPj4+ICh0aGlzLmxlbmd0aCAlIDgpICk7XG5cdFx0fVxuXHRcblx0XHR0aGlzLmxlbmd0aCsrO1xuXHR9XG59O1xuIiwidmFyIHByb3RvID0ge31cbm1vZHVsZS5leHBvcnRzID0gcHJvdG9cblxucHJvdG8uZnJvbSA9IHJlcXVpcmUoJy4vZnJvbS5qcycpXG5wcm90by50byA9IHJlcXVpcmUoJy4vdG8uanMnKVxucHJvdG8uaXMgPSByZXF1aXJlKCcuL2lzLmpzJylcbnByb3RvLnN1YmFycmF5ID0gcmVxdWlyZSgnLi9zdWJhcnJheS5qcycpXG5wcm90by5qb2luID0gcmVxdWlyZSgnLi9qb2luLmpzJylcbnByb3RvLmNvcHkgPSByZXF1aXJlKCcuL2NvcHkuanMnKVxucHJvdG8uY3JlYXRlID0gcmVxdWlyZSgnLi9jcmVhdGUuanMnKVxuXG5taXgocmVxdWlyZSgnLi9yZWFkLmpzJyksIHByb3RvKVxubWl4KHJlcXVpcmUoJy4vd3JpdGUuanMnKSwgcHJvdG8pXG5cbmZ1bmN0aW9uIG1peChmcm9tLCBpbnRvKSB7XG4gIGZvcih2YXIga2V5IGluIGZyb20pIHtcbiAgICBpbnRvW2tleV0gPSBmcm9tW2tleV1cbiAgfVxufVxuIiwiKGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5KGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyO1xuXHRcblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyAnSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCc7XG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHBsYWNlSG9sZGVycyA9IGI2NC5pbmRleE9mKCc9Jyk7XG5cdFx0cGxhY2VIb2xkZXJzID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSBwbGFjZUhvbGRlcnMgOiAwO1xuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gW107Ly9uZXcgVWludDhBcnJheShiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpO1xuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoO1xuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGxvb2t1cC5pbmRleE9mKGI2NFtpXSkgPDwgMTgpIHwgKGxvb2t1cC5pbmRleE9mKGI2NFtpICsgMV0pIDw8IDEyKSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDJdKSA8PCA2KSB8IGxvb2t1cC5pbmRleE9mKGI2NFtpICsgM10pO1xuXHRcdFx0YXJyLnB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNik7XG5cdFx0XHRhcnIucHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KTtcblx0XHRcdGFyci5wdXNoKHRtcCAmIDB4RkYpO1xuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChsb29rdXAuaW5kZXhPZihiNjRbaV0pIDw8IDIpIHwgKGxvb2t1cC5pbmRleE9mKGI2NFtpICsgMV0pID4+IDQpO1xuXHRcdFx0YXJyLnB1c2godG1wICYgMHhGRik7XG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChsb29rdXAuaW5kZXhPZihiNjRbaV0pIDw8IDEwKSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDFdKSA8PCA0KSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDJdKSA+PiAyKTtcblx0XHRcdGFyci5wdXNoKCh0bXAgPj4gOCkgJiAweEZGKTtcblx0XHRcdGFyci5wdXNoKHRtcCAmIDB4RkYpO1xuXHRcdH1cblxuXHRcdHJldHVybiBhcnI7XG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0KHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGg7XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cFtudW0gPj4gMTggJiAweDNGXSArIGxvb2t1cFtudW0gPj4gMTIgJiAweDNGXSArIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICsgbG9va3VwW251bSAmIDB4M0ZdO1xuXHRcdH07XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKTtcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcCk7XG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV07XG5cdFx0XHRcdG91dHB1dCArPSBsb29rdXBbdGVtcCA+PiAyXTtcblx0XHRcdFx0b3V0cHV0ICs9IGxvb2t1cFsodGVtcCA8PCA0KSAmIDB4M0ZdO1xuXHRcdFx0XHRvdXRwdXQgKz0gJz09Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pO1xuXHRcdFx0XHRvdXRwdXQgKz0gbG9va3VwW3RlbXAgPj4gMTBdO1xuXHRcdFx0XHRvdXRwdXQgKz0gbG9va3VwWyh0ZW1wID4+IDQpICYgMHgzRl07XG5cdFx0XHRcdG91dHB1dCArPSBsb29rdXBbKHRlbXAgPDwgMikgJiAweDNGXTtcblx0XHRcdFx0b3V0cHV0ICs9ICc9Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdG1vZHVsZS5leHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXk7XG5cdG1vZHVsZS5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0O1xufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gdG9fdXRmOFxuXG52YXIgb3V0ID0gW11cbiAgLCBjb2wgPSBbXVxuICAsIGZjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGVcbiAgLCBtYXNrID0gWzB4NDAsIDB4MjAsIDB4MTAsIDB4MDgsIDB4MDQsIDB4MDIsIDB4MDFdXG4gICwgdW5tYXNrID0gW1xuICAgICAgMHgwMFxuICAgICwgMHgwMVxuICAgICwgMHgwMiB8IDB4MDFcbiAgICAsIDB4MDQgfCAweDAyIHwgMHgwMVxuICAgICwgMHgwOCB8IDB4MDQgfCAweDAyIHwgMHgwMVxuICAgICwgMHgxMCB8IDB4MDggfCAweDA0IHwgMHgwMiB8IDB4MDFcbiAgICAsIDB4MjAgfCAweDEwIHwgMHgwOCB8IDB4MDQgfCAweDAyIHwgMHgwMVxuICAgICwgMHg0MCB8IDB4MjAgfCAweDEwIHwgMHgwOCB8IDB4MDQgfCAweDAyIHwgMHgwMVxuICBdXG5cbmZ1bmN0aW9uIHRvX3V0ZjgoYnl0ZXMsIHN0YXJ0LCBlbmQpIHtcbiAgc3RhcnQgPSBzdGFydCA9PT0gdW5kZWZpbmVkID8gMCA6IHN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gYnl0ZXMubGVuZ3RoIDogZW5kXG5cbiAgdmFyIGlkeCA9IDBcbiAgICAsIGhpID0gMHg4MFxuICAgICwgY29sbGVjdGluZyA9IDBcbiAgICAsIHBvc1xuICAgICwgYnlcblxuICBjb2wubGVuZ3RoID1cbiAgb3V0Lmxlbmd0aCA9IDBcblxuICB3aGlsZShpZHggPCBieXRlcy5sZW5ndGgpIHtcbiAgICBieSA9IGJ5dGVzW2lkeF1cbiAgICBpZighY29sbGVjdGluZyAmJiBieSAmIGhpKSB7XG4gICAgICBwb3MgPSBmaW5kX3BhZF9wb3NpdGlvbihieSlcbiAgICAgIGNvbGxlY3RpbmcgKz0gcG9zXG4gICAgICBpZihwb3MgPCA4KSB7XG4gICAgICAgIGNvbFtjb2wubGVuZ3RoXSA9IGJ5ICYgdW5tYXNrWzYgLSBwb3NdXG4gICAgICB9XG4gICAgfSBlbHNlIGlmKGNvbGxlY3RpbmcpIHtcbiAgICAgIGNvbFtjb2wubGVuZ3RoXSA9IGJ5ICYgdW5tYXNrWzZdXG4gICAgICAtLWNvbGxlY3RpbmdcbiAgICAgIGlmKCFjb2xsZWN0aW5nICYmIGNvbC5sZW5ndGgpIHtcbiAgICAgICAgb3V0W291dC5sZW5ndGhdID0gZmNjKHJlZHVjZWQoY29sLCBwb3MpKVxuICAgICAgICBjb2wubGVuZ3RoID0gMFxuICAgICAgfVxuICAgIH0gZWxzZSB7IFxuICAgICAgb3V0W291dC5sZW5ndGhdID0gZmNjKGJ5KVxuICAgIH1cbiAgICArK2lkeFxuICB9XG4gIGlmKGNvbC5sZW5ndGggJiYgIWNvbGxlY3RpbmcpIHtcbiAgICBvdXRbb3V0Lmxlbmd0aF0gPSBmY2MocmVkdWNlZChjb2wsIHBvcykpXG4gICAgY29sLmxlbmd0aCA9IDBcbiAgfVxuICByZXR1cm4gb3V0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZpbmRfcGFkX3Bvc2l0aW9uKGJ5dCkge1xuICBmb3IodmFyIGkgPSAwOyBpIDwgNzsgKytpKSB7XG4gICAgaWYoIShieXQgJiBtYXNrW2ldKSkge1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gcmVkdWNlZChsaXN0KSB7XG4gIHZhciBvdXQgPSAwXG4gIGZvcih2YXIgaSA9IDAsIGxlbiA9IGxpc3QubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBvdXQgfD0gbGlzdFtpXSA8PCAoKGxlbiAtIGkgLSAxKSAqIDYpXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBjb3B5XG5cbnZhciBzbGljZSA9IFtdLnNsaWNlXG5cbmZ1bmN0aW9uIGNvcHkoc291cmNlLCB0YXJnZXQsIHRhcmdldF9zdGFydCwgc291cmNlX3N0YXJ0LCBzb3VyY2VfZW5kKSB7XG4gIHRhcmdldF9zdGFydCA9IGFyZ3VtZW50cy5sZW5ndGggPCAzID8gMCA6IHRhcmdldF9zdGFydFxuICBzb3VyY2Vfc3RhcnQgPSBhcmd1bWVudHMubGVuZ3RoIDwgNCA/IDAgOiBzb3VyY2Vfc3RhcnRcbiAgc291cmNlX2VuZCA9IGFyZ3VtZW50cy5sZW5ndGggPCA1ID8gc291cmNlLmxlbmd0aCA6IHNvdXJjZV9lbmRcblxuICBpZihzb3VyY2VfZW5kID09PSBzb3VyY2Vfc3RhcnQpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgaWYoc291cmNlX2VuZCA+IHNvdXJjZS5sZW5ndGgpIHtcbiAgICBzb3VyY2VfZW5kID0gc291cmNlLmxlbmd0aFxuICB9XG5cbiAgaWYodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IHNvdXJjZV9lbmQgLSBzb3VyY2Vfc3RhcnQpIHtcbiAgICBzb3VyY2VfZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG4gIH1cblxuICBpZihzb3VyY2UuYnVmZmVyICE9PSB0YXJnZXQuYnVmZmVyKSB7XG4gICAgcmV0dXJuIGZhc3RfY29weShzb3VyY2UsIHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzb3VyY2Vfc3RhcnQsIHNvdXJjZV9lbmQpXG4gIH1cbiAgcmV0dXJuIHNsb3dfY29weShzb3VyY2UsIHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzb3VyY2Vfc3RhcnQsIHNvdXJjZV9lbmQpXG59XG5cbmZ1bmN0aW9uIGZhc3RfY29weShzb3VyY2UsIHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzb3VyY2Vfc3RhcnQsIHNvdXJjZV9lbmQpIHtcbiAgdmFyIGxlbiA9IChzb3VyY2VfZW5kIC0gc291cmNlX3N0YXJ0KSArIHRhcmdldF9zdGFydFxuXG4gIGZvcih2YXIgaSA9IHRhcmdldF9zdGFydCwgaiA9IHNvdXJjZV9zdGFydDtcbiAgICAgIGkgPCBsZW47XG4gICAgICArK2ksXG4gICAgICArK2opIHtcbiAgICB0YXJnZXRbaV0gPSBzb3VyY2Vbal1cbiAgfVxufVxuXG5mdW5jdGlvbiBzbG93X2NvcHkoZnJvbSwgdG8sIGosIGksIGplbmQpIHtcbiAgLy8gdGhlIGJ1ZmZlcnMgY291bGQgb3ZlcmxhcC5cbiAgdmFyIGllbmQgPSBqZW5kICsgaVxuICAgICwgdG1wID0gbmV3IFVpbnQ4QXJyYXkoc2xpY2UuY2FsbChmcm9tLCBpLCBpZW5kKSlcbiAgICAsIHggPSAwXG5cbiAgZm9yKDsgaSA8IGllbmQ7ICsraSwgKyt4KSB7XG4gICAgdG9baisrXSA9IHRtcFt4XVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNpemUpIHtcbiAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHNpemUpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZyb21cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG5cbnZhciBkZWNvZGVycyA9IHtcbiAgICBoZXg6IGZyb21faGV4XG4gICwgdXRmODogZnJvbV91dGZcbiAgLCBiYXNlNjQ6IGZyb21fYmFzZTY0XG59XG5cbmZ1bmN0aW9uIGZyb20oc291cmNlLCBlbmNvZGluZykge1xuICBpZihBcnJheS5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoc291cmNlKVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZXJzW2VuY29kaW5nIHx8ICd1dGY4J10oc291cmNlKVxufVxuXG5mdW5jdGlvbiBmcm9tX2hleChzdHIpIHtcbiAgdmFyIHNpemUgPSBzdHIubGVuZ3RoIC8gMlxuICAgICwgYnVmID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSlcbiAgICAsIGNoYXJhY3RlciA9ICcnXG5cbiAgZm9yKHZhciBpID0gMCwgbGVuID0gc3RyLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgY2hhcmFjdGVyICs9IHN0ci5jaGFyQXQoaSlcblxuICAgIGlmKGkgPiAwICYmIChpICUgMikgPT09IDEpIHtcbiAgICAgIGJ1ZltpPj4+MV0gPSBwYXJzZUludChjaGFyYWN0ZXIsIDE2KVxuICAgICAgY2hhcmFjdGVyID0gJycgXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZiBcbn1cblxuZnVuY3Rpb24gZnJvbV91dGYoc3RyKSB7XG4gIHZhciBieXRlcyA9IFtdXG4gICAgLCB0bXBcbiAgICAsIGNoXG5cbiAgZm9yKHZhciBpID0gMCwgbGVuID0gc3RyLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgY2ggPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmKGNoICYgMHg4MCkge1xuICAgICAgdG1wID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5jaGFyQXQoaSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IodmFyIGogPSAwLCBqbGVuID0gdG1wLmxlbmd0aDsgaiA8IGpsZW47ICsraikge1xuICAgICAgICBieXRlc1tieXRlcy5sZW5ndGhdID0gcGFyc2VJbnQodG1wW2pdLCAxNilcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYnl0ZXNbYnl0ZXMubGVuZ3RoXSA9IGNoIFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVWludDhBcnJheShieXRlcylcbn1cblxuZnVuY3Rpb24gZnJvbV9iYXNlNjQoc3RyKSB7XG4gIHJldHVybiBuZXcgVWludDhBcnJheShiYXNlNjQudG9CeXRlQXJyYXkoc3RyKSkgXG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gIHJldHVybiBidWZmZXIgaW5zdGFuY2VvZiBVaW50OEFycmF5O1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBqb2luXG5cbmZ1bmN0aW9uIGpvaW4odGFyZ2V0cywgaGludCkge1xuICBpZighdGFyZ2V0cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoMClcbiAgfVxuXG4gIHZhciBsZW4gPSBoaW50ICE9PSB1bmRlZmluZWQgPyBoaW50IDogZ2V0X2xlbmd0aCh0YXJnZXRzKVxuICAgICwgb3V0ID0gbmV3IFVpbnQ4QXJyYXkobGVuKVxuICAgICwgY3VyID0gdGFyZ2V0c1swXVxuICAgICwgY3VybGVuID0gY3VyLmxlbmd0aFxuICAgICwgY3VyaWR4ID0gMFxuICAgICwgY3Vyb2ZmID0gMFxuICAgICwgaSA9IDBcblxuICB3aGlsZShpIDwgbGVuKSB7XG4gICAgaWYoY3Vyb2ZmID09PSBjdXJsZW4pIHtcbiAgICAgIGN1cm9mZiA9IDBcbiAgICAgICsrY3VyaWR4XG4gICAgICBjdXIgPSB0YXJnZXRzW2N1cmlkeF1cbiAgICAgIGN1cmxlbiA9IGN1ciAmJiBjdXIubGVuZ3RoXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBvdXRbaSsrXSA9IGN1cltjdXJvZmYrK10gXG4gIH1cblxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIGdldF9sZW5ndGgodGFyZ2V0cykge1xuICB2YXIgc2l6ZSA9IDBcbiAgZm9yKHZhciBpID0gMCwgbGVuID0gdGFyZ2V0cy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHNpemUgKz0gdGFyZ2V0c1tpXS5ieXRlTGVuZ3RoXG4gIH1cbiAgcmV0dXJuIHNpemVcbn1cbiIsInZhciBwcm90b1xuICAsIG1hcFxuXG5tb2R1bGUuZXhwb3J0cyA9IHByb3RvID0ge31cblxubWFwID0gdHlwZW9mIFdlYWtNYXAgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IG5ldyBXZWFrTWFwXG5cbnByb3RvLmdldCA9ICFtYXAgPyBub193ZWFrbWFwX2dldCA6IGdldFxuXG5mdW5jdGlvbiBub193ZWFrbWFwX2dldCh0YXJnZXQpIHtcbiAgcmV0dXJuIG5ldyBEYXRhVmlldyh0YXJnZXQuYnVmZmVyLCAwKVxufVxuXG5mdW5jdGlvbiBnZXQodGFyZ2V0KSB7XG4gIHZhciBvdXQgPSBtYXAuZ2V0KHRhcmdldC5idWZmZXIpXG4gIGlmKCFvdXQpIHtcbiAgICBtYXAuc2V0KHRhcmdldC5idWZmZXIsIG91dCA9IG5ldyBEYXRhVmlldyh0YXJnZXQuYnVmZmVyLCAwKSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZWFkVUludDg6ICAgICAgcmVhZF91aW50OFxuICAsIHJlYWRJbnQ4OiAgICAgICByZWFkX2ludDhcbiAgLCByZWFkVUludDE2TEU6ICAgcmVhZF91aW50MTZfbGVcbiAgLCByZWFkVUludDMyTEU6ICAgcmVhZF91aW50MzJfbGVcbiAgLCByZWFkSW50MTZMRTogICAgcmVhZF9pbnQxNl9sZVxuICAsIHJlYWRJbnQzMkxFOiAgICByZWFkX2ludDMyX2xlXG4gICwgcmVhZEZsb2F0TEU6ICAgIHJlYWRfZmxvYXRfbGVcbiAgLCByZWFkRG91YmxlTEU6ICAgcmVhZF9kb3VibGVfbGVcbiAgLCByZWFkVUludDE2QkU6ICAgcmVhZF91aW50MTZfYmVcbiAgLCByZWFkVUludDMyQkU6ICAgcmVhZF91aW50MzJfYmVcbiAgLCByZWFkSW50MTZCRTogICAgcmVhZF9pbnQxNl9iZVxuICAsIHJlYWRJbnQzMkJFOiAgICByZWFkX2ludDMyX2JlXG4gICwgcmVhZEZsb2F0QkU6ICAgIHJlYWRfZmxvYXRfYmVcbiAgLCByZWFkRG91YmxlQkU6ICAgcmVhZF9kb3VibGVfYmVcbn1cblxudmFyIG1hcCA9IHJlcXVpcmUoJy4vbWFwcGVkLmpzJylcblxuZnVuY3Rpb24gcmVhZF91aW50OCh0YXJnZXQsIGF0KSB7XG4gIHJldHVybiB0YXJnZXRbYXRdXG59XG5cbmZ1bmN0aW9uIHJlYWRfaW50OCh0YXJnZXQsIGF0KSB7XG4gIHZhciB2ID0gdGFyZ2V0W2F0XTtcbiAgcmV0dXJuIHYgPCAweDgwID8gdiA6IHYgLSAweDEwMFxufVxuXG5mdW5jdGlvbiByZWFkX3VpbnQxNl9sZSh0YXJnZXQsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LmdldFVpbnQxNihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB0cnVlKVxufVxuXG5mdW5jdGlvbiByZWFkX3VpbnQzMl9sZSh0YXJnZXQsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LmdldFVpbnQzMihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB0cnVlKVxufVxuXG5mdW5jdGlvbiByZWFkX2ludDE2X2xlKHRhcmdldCwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuZ2V0SW50MTYoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gcmVhZF9pbnQzMl9sZSh0YXJnZXQsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LmdldEludDMyKGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHRydWUpXG59XG5cbmZ1bmN0aW9uIHJlYWRfZmxvYXRfbGUodGFyZ2V0LCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5nZXRGbG9hdDMyKGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHRydWUpXG59XG5cbmZ1bmN0aW9uIHJlYWRfZG91YmxlX2xlKHRhcmdldCwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuZ2V0RmxvYXQ2NChhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB0cnVlKVxufVxuXG5mdW5jdGlvbiByZWFkX3VpbnQxNl9iZSh0YXJnZXQsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LmdldFVpbnQxNihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gcmVhZF91aW50MzJfYmUodGFyZ2V0LCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5nZXRVaW50MzIoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIHJlYWRfaW50MTZfYmUodGFyZ2V0LCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5nZXRJbnQxNihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gcmVhZF9pbnQzMl9iZSh0YXJnZXQsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LmdldEludDMyKGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiByZWFkX2Zsb2F0X2JlKHRhcmdldCwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuZ2V0RmxvYXQzMihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gcmVhZF9kb3VibGVfYmUodGFyZ2V0LCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5nZXRGbG9hdDY0KGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIGZhbHNlKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBzdWJhcnJheVxuXG5mdW5jdGlvbiBzdWJhcnJheShidWYsIGZyb20sIHRvKSB7XG4gIHJldHVybiBidWYuc3ViYXJyYXkoZnJvbSB8fCAwLCB0byB8fCBidWYubGVuZ3RoKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB0b1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbiAgLCB0b3V0ZjggPSByZXF1aXJlKCd0by11dGY4JylcblxudmFyIGVuY29kZXJzID0ge1xuICAgIGhleDogdG9faGV4XG4gICwgdXRmODogdG9fdXRmXG4gICwgYmFzZTY0OiB0b19iYXNlNjRcbn1cblxuZnVuY3Rpb24gdG8oYnVmLCBlbmNvZGluZykge1xuICByZXR1cm4gZW5jb2RlcnNbZW5jb2RpbmcgfHwgJ3V0ZjgnXShidWYpXG59XG5cbmZ1bmN0aW9uIHRvX2hleChidWYpIHtcbiAgdmFyIHN0ciA9ICcnXG4gICAgLCBieXRcblxuICBmb3IodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBieXQgPSBidWZbaV1cbiAgICBzdHIgKz0gKChieXQgJiAweEYwKSA+Pj4gNCkudG9TdHJpbmcoMTYpXG4gICAgc3RyICs9IChieXQgJiAweDBGKS50b1N0cmluZygxNilcbiAgfVxuXG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gdG9fdXRmKGJ1Zikge1xuICByZXR1cm4gdG91dGY4KGJ1Zilcbn1cblxuZnVuY3Rpb24gdG9fYmFzZTY0KGJ1Zikge1xuICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB3cml0ZVVJbnQ4OiAgICAgIHdyaXRlX3VpbnQ4XG4gICwgd3JpdGVJbnQ4OiAgICAgICB3cml0ZV9pbnQ4XG4gICwgd3JpdGVVSW50MTZMRTogICB3cml0ZV91aW50MTZfbGVcbiAgLCB3cml0ZVVJbnQzMkxFOiAgIHdyaXRlX3VpbnQzMl9sZVxuICAsIHdyaXRlSW50MTZMRTogICAgd3JpdGVfaW50MTZfbGVcbiAgLCB3cml0ZUludDMyTEU6ICAgIHdyaXRlX2ludDMyX2xlXG4gICwgd3JpdGVGbG9hdExFOiAgICB3cml0ZV9mbG9hdF9sZVxuICAsIHdyaXRlRG91YmxlTEU6ICAgd3JpdGVfZG91YmxlX2xlXG4gICwgd3JpdGVVSW50MTZCRTogICB3cml0ZV91aW50MTZfYmVcbiAgLCB3cml0ZVVJbnQzMkJFOiAgIHdyaXRlX3VpbnQzMl9iZVxuICAsIHdyaXRlSW50MTZCRTogICAgd3JpdGVfaW50MTZfYmVcbiAgLCB3cml0ZUludDMyQkU6ICAgIHdyaXRlX2ludDMyX2JlXG4gICwgd3JpdGVGbG9hdEJFOiAgICB3cml0ZV9mbG9hdF9iZVxuICAsIHdyaXRlRG91YmxlQkU6ICAgd3JpdGVfZG91YmxlX2JlXG59XG5cbnZhciBtYXAgPSByZXF1aXJlKCcuL21hcHBlZC5qcycpXG5cbmZ1bmN0aW9uIHdyaXRlX3VpbnQ4KHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHJldHVybiB0YXJnZXRbYXRdID0gdmFsdWVcbn1cblxuZnVuY3Rpb24gd3JpdGVfaW50OCh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICByZXR1cm4gdGFyZ2V0W2F0XSA9IHZhbHVlIDwgMCA/IHZhbHVlICsgMHgxMDAgOiB2YWx1ZVxufVxuXG5mdW5jdGlvbiB3cml0ZV91aW50MTZfbGUodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuc2V0VWludDE2KGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHZhbHVlLCB0cnVlKVxufVxuXG5mdW5jdGlvbiB3cml0ZV91aW50MzJfbGUodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuc2V0VWludDMyKGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHZhbHVlLCB0cnVlKVxufVxuXG5mdW5jdGlvbiB3cml0ZV9pbnQxNl9sZSh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5zZXRJbnQxNihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB2YWx1ZSwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gd3JpdGVfaW50MzJfbGUodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuc2V0SW50MzIoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdmFsdWUsIHRydWUpXG59XG5cbmZ1bmN0aW9uIHdyaXRlX2Zsb2F0X2xlKHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LnNldEZsb2F0MzIoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdmFsdWUsIHRydWUpXG59XG5cbmZ1bmN0aW9uIHdyaXRlX2RvdWJsZV9sZSh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5zZXRGbG9hdDY0KGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHZhbHVlLCB0cnVlKVxufVxuXG5mdW5jdGlvbiB3cml0ZV91aW50MTZfYmUodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuc2V0VWludDE2KGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHZhbHVlLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gd3JpdGVfdWludDMyX2JlKHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LnNldFVpbnQzMihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB2YWx1ZSwgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIHdyaXRlX2ludDE2X2JlKHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LnNldEludDE2KGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHZhbHVlLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gd3JpdGVfaW50MzJfYmUodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuc2V0SW50MzIoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdmFsdWUsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiB3cml0ZV9mbG9hdF9iZSh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5zZXRGbG9hdDMyKGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHZhbHVlLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gd3JpdGVfZG91YmxlX2JlKHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LnNldEZsb2F0NjQoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdmFsdWUsIGZhbHNlKVxufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3FyY29kZS1kcmF3LmpzJyk7XG4iLCI7KGZ1bmN0aW9uKCl7XG4gICAgdmFyIFFSQ29kZSA9IHJlcXVpcmUoJ3FyY29kZScpO1xuICAgIHZhciBTSyA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgICAgICB0aGlzLmJhc2VDb25mID0gdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmRldmljZSA9IHRoaXMuZGV0ZWN0RGV2aWNlKG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgICB0aGlzLmluaXRFbGUodGhpcy5iYXNlQ29uZi5wcmVmaXgpO1xuICAgICAgICB0aGlzLmJpbmQodGhpcy5xekVsZSwgdGhpcy5xem9uZUZ1bmMpO1xuICAgICAgICB0aGlzLmJpbmQodGhpcy50d0VsZSwgdGhpcy50d2l0dGVyRnVuYyk7XG4gICAgICAgIHRoaXMuYmluZCh0aGlzLndiRWxlLCB0aGlzLndlaWJvRnVuYyk7XG4gICAgICAgIHRoaXMuYmluZCh0aGlzLnd4RWxlLCB0aGlzLndlY2hhdEZ1bmMpO1xuICAgIH07XG4gICAgU0sucHJvdG90eXBlLmluaXRFbGUgPSBmdW5jdGlvbihwcmVmaXgpIHtcbiAgICAgICAgdGhpcy53cmFwRWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtJytwcmVmaXgpWzBdO1xuICAgICAgICB0aGlzLnF6RWxlID0gdGhpcy53cmFwRWxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLScrcHJlZml4KyctcXpvbmUnKVswXTtcbiAgICAgICAgdGhpcy53YkVsZSA9IHRoaXMud3JhcEVsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy0nK3ByZWZpeCsnLXdlaWJvJylbMF07XG4gICAgICAgIHRoaXMudHdFbGUgPSB0aGlzLndyYXBFbGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtJytwcmVmaXgrJy10d2l0dGVyJylbMF07XG4gICAgICAgIHRoaXMud3hFbGUgPSB0aGlzLndyYXBFbGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtJytwcmVmaXgrJy13ZWNoYXQnKVswXTtcbiAgICB9O1xuXG4gICAgU0sucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihlbGUsIGhhbmRsZXIpe1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGVsZS5vbmNsaWNrID0gZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBoYW5kbGVyKHNlbGYpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBTSy5wcm90b3R5cGUub3BlbldpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgICAgICAvLyB1cmwgY2Fubm90IGJlIGVtcHR5XG4gICAgICAgIGlmKG9wdGlvbnMudXJsID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoZSB1cmwgdG8gb3BlbiBoYXZlIHRvIGJlIHBhc3NlZCBpbi4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGVtcCA9IHt9O1xuICAgICAgICB2YXIgdGl0bGUgPSBvcHRpb25zLnRpdGxlIHx8ICdzaGFyZUtpdFxcJ3Mgd2luZG93JztcbiAgICAgICAgdmFyIHVybCA9IG9wdGlvbnMudXJsO1xuICAgICAgICB2YXIgd2luZG93Q29uZj0nJztcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgaWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgdGVtcFtrZXldID0gb3B0aW9uc1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSB0ZW1wLnRpdGxlO1xuICAgICAgICBkZWxldGUgdGVtcC51cmw7XG4gICAgICAgIGlmKHRlbXAudmlhICE9IG51bGwpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0ZW1wLnZpYTtcbiAgICAgICAgfVxuICAgICAgICBpZih0ZW1wLnRleHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgZGVsZXRlIHRlbXAudGV4dDtcbiAgICAgICAgfVxuICAgICAgICBpZih0ZW1wLmNvdW50VXJsICE9IG51bGwpe1xuICAgICAgICAgICAgZGVsZXRlIHRlbXAuY291bnRVcmw7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKGtleSBpbiB0ZW1wKSB7XG4gICAgICAgICAgICB3aW5kb3dDb25mICs9IChrZXkrJz0nK3RlbXBba2V5XSsnLCcpO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvd0NvbmYgPSB3aW5kb3dDb25mLnNsaWNlKDAsLTEpO1xuICAgICAgICB3aW5kb3cub3Blbih0aXRsZSwgdXJsLCB3aW5kb3dDb25mKTtcbiAgICB9O1xuXG4gICAgLy8gcXpvbmUgc2hhcmUgaGFuZGxlclxuICAgIFNLLnByb3RvdHlwZS5xem9uZUZ1bmMgPSBmdW5jdGlvbihzZWxmKXtcbiAgICAgICAgdmFyIGNvbmYgPSBzZWxmLmdldE9wdGlvbigpO1xuICAgICAgICB2YXIgcCA9IHtcbiAgICAgICAgICAgIHVybDogY29uZi5saW5rLFxuICAgICAgICAgICAgc2hvd2NvdW50OicxJywvKuaYr+WQpuaYvuekuuWIhuS6q+aAu+aVsCzmmL7npLrvvJonMSfvvIzkuI3mmL7npLrvvJonMCcgKi9cbiAgICAgICAgICAgIGRlc2M6ICcnLC8q6buY6K6k5YiG5Lqr55CG55SxKOWPr+mAiSkqL1xuICAgICAgICAgICAgc3VtbWFyeTogY29uZi5kZXNjLC8q5YiG5Lqr5pGY6KaBKOWPr+mAiSkqL1xuICAgICAgICAgICAgdGl0bGU6IGNvbmYudGl0bGUsLyrliIbkuqvmoIfpopgo5Y+v6YCJKSovXG4gICAgICAgICAgICBzaXRlOicnLC8q5YiG5Lqr5p2l5rqQIOWmgu+8muiFvuiur+e9kSjlj6/pgIkpKi9cbiAgICAgICAgICAgIHBpY3M6JycsIC8q5YiG5Lqr5Zu+54mH55qE6Lev5b6EKOWPr+mAiSkqL1xuICAgICAgICAgICAgc3R5bGU6JzIwMycsXG4gICAgICAgICAgICB3aWR0aDo5OCxcbiAgICAgICAgICAgIGhlaWdodDoyMlxuICAgICAgICB9O1xuICAgICAgICB2YXIgbGluaztcbiAgICAgICAgbGluayA9IHVybENvbmNhdChwLCAnaHR0cDovL3Nucy5xem9uZS5xcS5jb20vY2dpLWJpbi9xenNoYXJlL2NnaV9xenNoYXJlX29uZWtleScpO1xuICAgICAgICBzZWxmLm9wZW5XaW4oe1xuICAgICAgICAgICAgdXJsOiBsaW5rLFxuICAgICAgICAgICAgdGl0bGU6ICdTaGFyaW5nIHRvIFF6b25lJyxcbiAgICAgICAgICAgIHRvb2xiYXI6ICdubycsXG4gICAgICAgICAgICByZXNpemFibGU6ICdubycsXG4gICAgICAgICAgICBzdGF0dXM6ICdubycsXG4gICAgICAgICAgICBtZW51YmFyOiAnbm8nLFxuICAgICAgICAgICAgc2Nyb2xsYmFyczogJ25vJyxcbiAgICAgICAgICAgIGhlaWdodDogNjUwLFxuICAgICAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgICAgIGxlZnQ6IDIwMCxcbiAgICAgICAgICAgIHRvcDogNTBcbiAgICAgICAgfSk7XG4gICAgfTtcblxuLy8gICAgd2VpYm8gc2hhcmUgaGFuZGxlclxuICAgIFNLLnByb3RvdHlwZS53ZWlib0Z1bmMgPSBmdW5jdGlvbihzZWxmKXtcbiAgICAgICAgdmFyIGNvbmYgPSBzZWxmLmdldE9wdGlvbigpO1xuICAgICAgICB2YXIgZGVmYXVsdFRleHQgPSBjb25mLnRpdGxlKyctLScrY29uZi5kZXNjKyc6ICcrY29uZi5saW5rO1xuICAgICAgICAvLyAgICBpbml0IHdlaWJvIGVsZW1lbnQncyBpZFxuICAgICAgICBzZWxmLndiRWxlLmlkID0gJ3diX3B1Ymxpc2gnO1xuICAgICAgICBXQjIuYW55V2hlcmUoZnVuY3Rpb24oVyl7XG4gICAgICAgICAgICBXLndpZGdldC5wdWJsaXNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246J3B1Ymxpc2gnLFxuICAgICAgICAgICAgICAgIHR5cGU6J3dlYicsXG4gICAgICAgICAgICAgICAgcmVmZXI6J3knLFxuICAgICAgICAgICAgICAgIGxhbmd1YWdlOid6aF9jbicsXG4gICAgICAgICAgICAgICAgYnV0dG9uX3R5cGU6J3JlZCcsXG4gICAgICAgICAgICAgICAgYnV0dG9uX3NpemU6J21pZGRsZScsXG4gICAgICAgICAgICAgICAgYXBwa2V5OiczMTI1MjY1NzQ4JyxcbiAgICAgICAgICAgICAgICBpZDogJ3diX3B1Ymxpc2gnLFxuICAgICAgICAgICAgICAgIHVpZDogJzE2MjQxMTg3MTcnLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRfdGV4dDogZGVmYXVsdFRleHRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4vLyAgICB0d2l0dGVyIHNoYXJlIGhhbmRsZXJcbiAgICBTSy5wcm90b3R5cGUudHdpdHRlckZ1bmMgPSBmdW5jdGlvbihzZWxmKXtcbiAgICAgICAgdmFyIGNvbmYgPSBzZWxmLmdldE9wdGlvbigpO1xuICAgICAgICB2YXIgc2hhcmVVcmwgPSAnaHR0cHM6Ly90d2l0dGVyLmNvbS9zaGFyZSc7XG4gICAgICAgIHZhciBzaGFyZU9iaiA9IHtcbiAgICAgICAgICAgIHVybDogY29uZi5saW5rLFxuICAgICAgICAgICAgdGV4dDogY29uZi50aXRsZSArJyAtICcrY29uZi5kZXNjLFxuICAgICAgICAgICAgY291bnRVcmw6IGNvbmYubGluayxcbiAgICAgICAgICAgIHZpYTogY29uZi50d2l0dGVyTmFtZSB8fCAnJ1xuICAgICAgICB9O1xuICAgICAgICBzaGFyZVVybCA9IHVybENvbmNhdChzaGFyZU9iaiwgc2hhcmVVcmwpO1xuICAgICAgICBjb25mLnRpdGxlID0gJ1NoYXJpbmcgdG8gVHdpdHRlcic7XG4gICAgICAgIHNlbGYub3Blbldpbih7XG4gICAgICAgICAgICB1cmw6IHNoYXJlVXJsLFxuICAgICAgICAgICAgdGl0bGU6IGNvbmYudGl0bGUsXG4gICAgICAgICAgICB0b29sYmFyOiAnbm8nLFxuICAgICAgICAgICAgcmVzaXphYmxlOiAnbm8nLFxuICAgICAgICAgICAgbWVudWJhcjogJ25vJyxcbiAgICAgICAgICAgIHNjcm9sbGJhcnM6ICdubycsXG4gICAgICAgICAgICBoZWlnaHQ6IDY1MCxcbiAgICAgICAgICAgIHdpZHRoOiA2MDAsXG4gICAgICAgICAgICBsZWZ0OiAyMDAsXG4gICAgICAgICAgICB0b3A6IDUwXG4gICAgICAgIH0pO1xuICAgIH07XG5cbi8vICAgIHdlY2hhdCBzaGFyZSBIYW5kbGVyXG4gICAgU0sucHJvdG90eXBlLndlY2hhdEZ1bmMgPSBmdW5jdGlvbihzZWxmKXtcbiAgICAgICAgdmFyIGNvbmYgPSBzZWxmLmJhc2VDb25mO1xuICAgICAgICB2YXIgcXJjb2RlO1xuICAgICAgICB2YXIgd2NDYW52YXM7XG4gICAgICAgIHZhciBzaGFyZVJlYWR5O1xuICAgICAgICB2YXIgd3hPYmo7XG4gICAgICAgIGlmKHNlbGYuZGV2aWNlID09PSAncGhvbmUnKSB7XG4gICAgICAgICAgICB3eE9iaiA9IHt9O1xuICAgICAgICAgICAgd3hPYmoudGl0bGUgPSBjb25mLnRpdGxlO1xuICAgICAgICAgICAgd3hPYmoubGluayA9IGNvbmYubGluaztcbiAgICAgICAgICAgIHd4T2JqLmRlc2MgPSBjb25mLmRlc2M7XG4gICAgICAgICAgICB3eE9iai5pbWdfdXJsID0gY29uZi5wb3J0cmFpdDtcbiAgICAgICAgICAgIHNoYXJlUmVhZHkgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFdlaXhpbkpTQnJpZGdlLm9uKCdtZW51OnNoYXJlOmFwcG1lc3NhZ2UnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBXZWl4aW5KU0JyaWRnZS5pbnZva2UoJ3NlbmRBcHBNZXNzYWdlJywgd3hPYmosZnVuY3Rpb24oKXt9KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFdlaXhpbkpTQnJpZGdlLm9uKCdtZW51OnNoYXJlOnRpbWVsaW5lJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgV2VpeGluSlNCcmlkZ2UuaW52b2tlKCdzaGFyZVRpbWVsaW5lJywgd3hPYmosIGZ1bmN0aW9uKCl7fSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYodHlwZW9mIFdlaXhpbkpTQnJpZGdlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ1dlaXhpbkpTQnJpZGdlUmVhZHknLCBzaGFyZVJlYWR5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hhcmVSZWFkeSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYoc2VsZi5kZXZpY2UgPT09ICdwYycpIHtcbiAgICAgICAgICAgIHdjQ2FudmFzID0gc2VsZi53cmFwRWxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLScrY29uZi5wcmVmaXgrJy13ZWNoYXQtUVJDb2RlJylbMF07XG4gICAgICAgICAgICBxcmNvZGUgPSBuZXcgUVJDb2RlLlFSQ29kZURyYXcoKTtcbiAgICAgICAgICAgIHFyY29kZS5kcmF3KHdjQ2FudmFzLCBsb2NhdGlvbi5ocmVmLCBmdW5jdGlvbihlcnJvciwgY2FudmFzKXt9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbi8vICAgIG1ha2UgdGhlIGJhc2UgZGF0YVxuICAgIFNLLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGJhc2VDb25mID0ge307XG4gICAgICAgIGlmKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICAgICAgb3B0aW9ucyA9IGJhc2VDb25mO1xuICAgICAgICB9XG4gICAgICAgIGlmKG9wdGlvbnMudGl0bGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgYmFzZUNvbmYudGl0bGUgPSBkb2N1bWVudC50aXRsZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2VDb25mLnRpdGxlID0gb3B0aW9ucy50aXRsZTtcbiAgICAgICAgfVxuICAgICAgICBpZihvcHRpb25zLmxpbmsgPT0gbnVsbCkge1xuICAgICAgICAgICAgYmFzZUNvbmYubGluayA9IGxvY2F0aW9uLmhyZWY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlQ29uZi5saW5rID0gb3B0aW9ucy5saW5rO1xuICAgICAgICB9XG4gICAgICAgIGlmKG9wdGlvbnMuZGVzYyA9PSBudWxsKSB7XG4gICAgICAgICAgICBiYXNlQ29uZi5kZXNjID0gZmluZERlc2MoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2VDb25mLmRlc2MgPSBvcHRpb25zLmRlc2M7XG4gICAgICAgIH1cbiAgICAgICAgaWYob3B0aW9ucy50d2l0dGVyTmFtZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBiYXNlQ29uZi50d2l0dGVyTmFtZSA9IG9wdGlvbnMudHdpdHRlck5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYob3B0aW9ucy5wcmVmaXggPT0gbnVsbCkge1xuICAgICAgICAgICAgYmFzZUNvbmYucHJlZml4ID0gJ3NoYXJlS2l0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2VDb25mLnByZWZpeCA9IG9wdGlvbnMucHJlZml4O1xuICAgICAgICB9XG4gICAgICAgIGlmKG9wdGlvbnMucG9ydHJhaXQgPT0gbnVsbCkge1xuICAgICAgICAgICAgb3B0aW9ucy5wb3J0cmFpdCA9ICdodHRwOi8vdXN1YWxpbWFnZXMucWluaXVkbi5jb20vMS5qcGVnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2VDb25mLnBvcnRyYWl0ID0gb3B0aW9ucy5wb3J0cmFpdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzZUNvbmY7XG4gICAgfTtcblxuICAgIC8vIHJldHVybiBhIGNvcHkgb2Ygb3B0aW9uIG9iamVjdFxuICAgIFNLLnByb3RvdHlwZS5nZXRPcHRpb24gPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgcmUgPSB7fTtcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gdGhpcy5iYXNlQ29uZikge1xuICAgICAgICAgICAgcmVba2V5XSA9IHRoaXMuYmFzZUNvbmZba2V5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmU7XG4gICAgfTtcblxuICAgIC8vIGRldGVjdCBkZXZpY2UgdHlwZVxuICAgIFNLLnByb3RvdHlwZS5kZXRlY3REZXZpY2UgPSBmdW5jdGlvbih1YSl7XG4gICAgICAgIGlmKHVhLm1hdGNoKC9pcGhvbmV8aXBhZHxhbmRyb2lkL2dpKSAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3Bob25lJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAncGMnO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGZpbmREZXNjKCl7XG4gICAgICAgIHZhciBtZXRhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtZXRhJyk7XG4gICAgICAgIHZhciBtZXRhO1xuICAgICAgICBmb3IodmFyIGk9MDsgaTwgbWV0YXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG1ldGEgPSBtZXRhc1tpXTtcbiAgICAgICAgICAgIGlmKG1ldGEuZ2V0QXR0cmlidXRlKCduYW1lJykgPT09ICdkZXNjcmlwdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWV0YS5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuLy8gICAgY29uY2F0IHVybCBhbmQgcXVlcnkgZGF0YVxuICAgIHZhciB1cmxDb25jYXQgPSBmdW5jdGlvbihvLCB1cmwpe1xuICAgICAgICB2YXIgcyA9IFtdO1xuICAgICAgICBmb3IodmFyIGkgaW4gbyl7XG4gICAgICAgICAgICBzLnB1c2goaSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChvW2ldfHwnJykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1cmwgKyAnPycgKyBzLmpvaW4oJyYnKTtcbiAgICB9O1xuXG4vLyAgICBmb3IgdGVzdFxuICAgIGV4cG9ydHMudXJsQ29uY2F0ID0gdXJsQ29uY2F0O1xuICAgIGV4cG9ydHMuZmluZERlc2MgPWZpbmREZXNjO1xuICAgIGV4cG9ydHMuU0sgPSBTSztcbn0pKCk7IiwidmFyIGV4cGVjdCA9IGNoYWkuZXhwZWN0O1xudmFyIHNrT2JqID0gcmVxdWlyZSgnLi9zaGFyZUtpdC5qcycpO1xuZm9yKHZhciBrIGluIHNrT2JqKSB7XG4gICAgd2luZG93W2tdID0gc2tPYmpba107XG59XG5kZXNjcmliZSgnU2hhcmUgS2l0JywgZnVuY3Rpb24oKXtcbiAgICBkZXNjcmliZSgnVGVzdCBVcmwgQ29uY2F0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gZW5jb2RlIHVybCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgc3JjID0gdXJsQ29uY2F0KHtcbiAgICAgICAgICAgICAgICBhOidhJyxcbiAgICAgICAgICAgICAgICBiOidiYlxcL1xcLycsXG4gICAgICAgICAgICAgICAgYzogJzEyMz8/JScsXG4gICAgICAgICAgICAgICAgZDogNzc3LFxuICAgICAgICAgICAgICAgIGU6Jzg4OCdcbiAgICAgICAgICAgIH0sICdodHRwOi8vd3d3LmJhaWR1LmNvbScpO1xuICAgICAgICAgICAgdmFyIGRlc3QgPSAnaHR0cDovL3d3dy5iYWlkdS5jb20/JysnYT1hJmI9YmJcXC9cXC8mYz0xMjM/PyUmZD03NzcmZT04ODgnO1xuXG4gICAgICAgICAgICBleHBlY3Qoc3JjKS50by5ub3QuZXF1YWwoZGVzdCk7XG4gICAgICAgICAgICBleHBlY3QoZGVjb2RlVVJJQ29tcG9uZW50KHNyYykpLnRvLmVxdWFsKGRlc3QpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdEZXZpY2UgRGV0ZWN0aW5nJywgZnVuY3Rpb24oKXtcbiAgICAgICAgaXQoJ3Nob3VsZCBkZXZpY2UgZGV0ZWN0aW9uIGdldHRpbmcgcmlnaHQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHVhXzEgPSAnTW96aWxsYS81LjAgKExpbnV4OyBVOyBBbmRyb2lkIDQuMC4zOyBrby1rcjsgTEctTDE2MEwgQnVpbGQvSU1MNzRLKSBBcHBsZVdlYmtpdC81MzQuMzAgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzQuMCBNb2JpbGUgU2FmYXJpLzUzNC4zMCc7XG4gICAgICAgICAgICB2YXIgdWFfMiA9ICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjM7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8zNy4wLjIwNDkuMCBTYWZhcmkvNTM3LjM2JztcbiAgICAgICAgICAgIHZhciB1YV8zID0gJ01vemlsbGEvNS4wIChpUGFkOyBDUFUgT1MgNl8wIGxpa2UgTWFjIE9TIFgpIEFwcGxlV2ViS2l0LzUzNi4yNiAoS0hUTUwsIGxpa2UgR2Vja28pIFZlcnNpb24vNi4wIE1vYmlsZS8xMEE1MzU1ZCBTYWZhcmkvODUzNi4yNSc7XG4gICAgICAgICAgICB2YXIgcmVfMSA9IFNLLnByb3RvdHlwZS5kZXRlY3REZXZpY2UodWFfMSk7XG4gICAgICAgICAgICB2YXIgcmVfMiA9IFNLLnByb3RvdHlwZS5kZXRlY3REZXZpY2UodWFfMik7XG4gICAgICAgICAgICB2YXIgcmVfMyA9IFNLLnByb3RvdHlwZS5kZXRlY3REZXZpY2UodWFfMyk7XG4gICAgICAgICAgICBleHBlY3QocmVfMSkudG8uZXF1YWwoJ3Bob25lJyk7XG4gICAgICAgICAgICBleHBlY3QocmVfMikudG8uZXF1YWwoJ3BjJyk7XG4gICAgICAgICAgICBleHBlY3QocmVfMykudG8uZXF1YWwoJ3Bob25lJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCdTSyBPYmplY3QnLCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgZXZ0O1xuICAgICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudCcpO1xuICAgICAgICAgICAgZXZ0LmluaXRFdmVudCgnY2xpY2snLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRlc2NyaWJlKCdTSyBDb25maWd1cmF0aW9uIFRlc3QnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBlbXB0eSBvYmplY3QgaGFzIGRlZmF1bHQgb3B0aW9ucycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIHNrID0gbmV3IFNLKCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrKS50by5ub3QuYmUuYW4oJ3VuZGVmaW5lZCcpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChzay5iYXNlQ29uZi50aXRsZSkudG8uZXF1YWwoZG9jdW1lbnQudGl0bGUpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChzay5iYXNlQ29uZi5saW5rKS50by5lcXVhbChsb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc2suYmFzZUNvbmYuZGVzYykudG8uZXF1YWwoZmluZERlc2MoKSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLnR3aXR0ZXJOYW1lKS50by5iZS5hbigndW5kZWZpbmVkJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLnByZWZpeCkudG8uZXF1YWwoJ3NoYXJlS2l0Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdTaG91bGQgb2JqZWN0IHdpdGggY29uZmlndXJhdGlvbiBoYXMgc29tZSBvcHRpb25zJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICd0aXRsZScsXG4gICAgICAgICAgICAgICAgICAgIGxpbms6ICdodHRwOi8vYmFpZHUuY29tJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzYzogJ1RvZGF5IGlzblxcJyBhbm90aGVyIGRheS4nLFxuICAgICAgICAgICAgICAgICAgICB0d2l0dGVyTmFtZTogJ3N1bmFpd2VuJ1xuICAgICAgICAgICAgICAgICAgICAvL3ByZWZpeDogJ3lveW95bydcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSyhvKTtcblxuICAgICAgICAgICAgICAgIGV4cGVjdChzay5iYXNlQ29uZi50aXRsZSkudG8uZXF1YWwoby50aXRsZSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLmxpbmspLnRvLmVxdWFsKG8ubGluayk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLmRlc2MpLnRvLmVxdWFsKG8uZGVzYyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLmJhc2VDb25mLnR3aXR0ZXJOYW1lKS50by5lcXVhbChvLnR3aXR0ZXJOYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZGVzY3JpYmUoJ1NLIEZ1bmN0aW9uIFRlc3QnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHNrID0gbmV3IFNLKCk7XG4gICAgICAgICAgICBpdCgnU2hvdWxkIGhhdmUgZWxlbWVudCBhbmQgY29ycmVjdCBwcmVmaXgnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGV4cGVjdChzay53cmFwRWxlLmNsYXNzTmFtZS5pbmRleE9mKCdqcy0nK3NrLmJhc2VDb25mLnByZWZpeCkpLnRvLm5vdC5lcXVhbCgtMSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNrLnF6RWxlLmNsYXNzTmFtZS5pbmRleE9mKCdqcy0nK3NrLmJhc2VDb25mLnByZWZpeCsnLXF6b25lJykpLnRvLm5vdC5lcXVhbCgtMSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdTaG91bGQgYmluZCBhIGV2ZW50IGNvcnJlY3RseScsIGZ1bmN0aW9uKGRvbmUpe1xuICAgICAgICAgICAgICAgIHZhciByID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICByID0gJ2ZpcmUnO1xuICAgICAgICAgICAgICAgICAgICBleHBlY3QocikudG8uZXF1YWwoJ2ZpcmUnKTtcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2suYmluZChzay5xekVsZSwgaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgc2sucXpFbGUuZGlzcGF0Y2hFdmVudChldnQsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZXNjcmliZSgnU0sgQ29uc3RydWN0b3InLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCB0aGUgYmluZCBmdW5jdGlvbiBiZSBpbnZva2VkIDQgdGltZXMnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciBzcHkgPSBzaW5vbi5zcHkoU0sucHJvdG90eXBlLCAnYmluZCcpO1xuICAgICAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSygpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChzcHkuY2FsbENvdW50KS50by5lcXVhbCg0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZGVzY3JpYmUoJ1NLIGVsZW1lbnRzXFwnIGV2ZW50IGJpbmRpbmcnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBoYW5kbGVyIGJlIGZpcmVkJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgc3QgPSBzaW5vbi5zdHViKFNLLnByb3RvdHlwZSwgJ3F6b25lRnVuYycpO1xuICAgICAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSygpO1xuICAgICAgICAgICAgICAgIHNrLnF6RWxlLmRpc3BhdGNoRXZlbnQoZXZ0LHRydWUpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChzdC5jYWxsQ291bnQpLnRvLmVxdWFsKDEpO1xuICAgICAgICAgICAgICAgIHN0LnJlc3RvcmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZGVzY3JpYmUoJ1RoZSBRem9uZSBzaGFyZSBmdW5jdGlvbicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgYXJncyA9IG51bGw7XG4gICAgICAgICAgICB2YXIgY2FjaGUgPSBTSy5wcm90b3R5cGUub3BlbldpbjtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgZmFrZU9wZW5XaW4gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgU0sucHJvdG90eXBlLm9wZW5XaW4gPSBmYWtlT3BlbldpbjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBxem9uZUZ1bmMgb3BlbiBhIHdpbmRvdyB3aXRoIGNvcnJlY3Qgb3B0aW9ucycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIHNrID0gbmV3IFNLKHtcbiAgICAgICAgICAgICAgICAgICAgbGluazogJ2h0dHA6Ly9iYWlkdS5jb20nLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ3F6b25lIHNoYXJlIGZ1bmN0aW9uIHRlc3QnLFxuICAgICAgICAgICAgICAgICAgICB0d2l0dGVyTmFtZTogJ3N1bmFpd2VuJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzYzogJ3RoaXMgaXMgYSB0ZXN0IHRlc3RpbmcgcXpvbmUgc2hhcmUgZnVuY3Rpb24uJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgc2sucXpFbGUuZGlzcGF0Y2hFdmVudChldnQsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3MubWVudWJhcikudG8uZXF1YWwoJ25vJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3MucmVzaXphYmxlKS50by5lcXVhbCgnbm8nKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYXJncy5zdGF0dXMpLnRvLmVxdWFsKCdubycpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLnRvb2xiYXIpLnRvLmVxdWFsKCdubycpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLnRvcCkudG8uZXF1YWwoNTApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLmxlZnQpLnRvLmVxdWFsKDIwMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3Mud2lkdGgpLnRvLmVxdWFsKDYwMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGFyZ3MuaGVpZ2h0KS50by5lcXVhbCg2NTApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhcmdzLnRpdGxlKS50by5lcXVhbCgnU2hhcmluZyB0byBRem9uZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhZnRlckVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBTSy5wcm90b3R5cGUub3BlbldpbiA9IGNhY2hlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZXNjcmliZSgnVGhlIHdlY2hhdCBzaGFyZSBmdW5jdGlvbicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpdCgnU2hvdWxkIGNvbmR1Y3QgY29ycmVjdCBpbmZvIGluIHdlY2hhdCBzaGFyaW5nJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgY2FjaGUgPSBTSy5wcm90b3R5cGUuZGV0ZWN0RGV2aWNlO1xuICAgICAgICAgICAgICAgIFNLLnByb3RvdHlwZS5kZXRlY3REZXZpY2UgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3Bob25lJztcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBzayA9IG5ldyBTSyh7XG4gICAgICAgICAgICAgICAgICAgIGxpbms6IGxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnd2VjaGF0IGZ1bmN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzYzogJ3dlY2hhdCBmdW5jdGlvbiB0ZXN0IHlvdSB3ZXRoZXIgeW91IGxvdmUgbWUuJyxcbiAgICAgICAgICAgICAgICAgICAgcG9ydHJhaXQ6ICdodHRwczovL2QxM3lhY3VycWpnYXJhLmNsb3VkZnJvbnQubmV0L3VzZXJzLzUyMjc3L3NjcmVlbnNob3RzLzE4MDczMzMvZ2lsbGVfZHJpYmJibGVfYm9yZWFzX3YwMS0wMS5wbmcnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2sud3hFbGUuZGlzcGF0Y2hFdmVudChldnQsIHRydWUpO1xuICAgICAgICAgICAgICAgIFNLLnByb3RvdHlwZS5kZXRlY3REZXZpY2UgPSBjYWNoZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ1Nob3VsZCBzaG93IHFyY29kZSB3aGVuIGluIHBjIGVudicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIHNrID0gbmV3IFNLKHtcbiAgICAgICAgICAgICAgICAgICAgbGluazogbG9jYXRpb24uaHJlZlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNrLnd4RWxlLmRpc3BhdGNoRXZlbnQoZXZ0LCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pOyJdfQ==
