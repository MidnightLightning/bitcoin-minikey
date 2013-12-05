// https://en.bitcoin.it/wiki/Mini_private_key_format

var crypto = require('crypto');
var ECKey = require('eckey');
var BigInteger = require('cryptocoin-bigint')

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
	var charSize = BigInteger(chars.length+'');
	var buf = BigInteger.fromByteArrayUnsigned(bufToArray(crypto.randomBytes(50).slice(0)));
	while (minikey.length < 30) {
		var div = buf.divideAndRemainder(charSize);
		minikey = minikey + chars.charAt(div[1]);
		buf = div[0];
		if (buf.compareTo(BigInteger.ONE) <= 0) {
			console.log('Ran out of entropy with key only', minikey.length, 'long');
			return false;
		}
	}
	return minikey;
}

function sha256(data) {
	return new Buffer(crypto.createHash('sha256').update(data).digest('binary'), 'binary');
}

function bufToArray(buf) {
	var rs = [];
	for(var i = 0; i < buf.length; i++) {
		rs.push(buf[i]);
	}
	return rs;
}