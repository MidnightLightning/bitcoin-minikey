// https://en.bitcoin.it/wiki/Mini_private_key_format

var crypto = require('crypto');
var bignum = require('bignum');
var ECKey = require('eckey');

var keysTarget = 50;
var keysGenerated = 0;
var totalTries = 0;
while (keysGenerated < keysTarget) {
	var miniKey = buildCandidate();
	if (miniKey === false) continue;
	totalTries++;
	
	// Valid candidate?
	var hash = sha256(miniKey+'?');
	if (hash.readUInt8(0) != 0)	continue;
	
	// This is a valid Mini Key
	var key = new ECKey(bufToArray(sha256(miniKey)));
	var wif = key.getExportedPrivateKey();
	var pubAddress = key.getBitcoinAddress().toString();
	
	console.log(miniKey, '=>', key.toString('hex'), '=>', pubAddress);
	keysGenerated++;
}
console.log('Took', totalTries, 'tries to generate', keysTarget, 'keys;', ((keysGenerated/totalTries)*100)+'% success rate');
	
function buildCandidate() {
	var minikey = 'S';
	var chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
	var buf = bignum.fromBuffer(crypto.randomBytes(50).slice(0));
	while (minikey.length < 30) {
		minikey = minikey + chars.charAt(buf.mod(chars.length));
		buf = buf.div(chars.length);
		if (buf.le(1)) {
			console.log('Ran out of entropy with key only', minikey.length, 'long');
			return false;
		}
	}
	return minikey;
}

function sha256(data) {
	return new Buffer(crypto.createHash('sha256').update(data).digest('binary'), 'binary');
}

function base58encode(data) {
	var chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
	var num = bignum.fromBuffer(data);
	var encoded = '';
	var base = chars.length;
	while(num.gt(0)) {
		encoded = chars.charAt(num.mod(base))+encoded;
		num = num.div(base);
	}
	
	// Convert leading zeroes
	for (var i = 0; i < data.length; i++) {
		if (data[i] == 0) {
			encoded = chars.charAt(0)+encoded;
		} else break;
	}
	return encoded;
}

function bufToArray(buf) {
	var rs = [];
	for(var i = 0; i < buf.length; i++) {
		rs.push(buf[i]);
	}
	return rs;
}