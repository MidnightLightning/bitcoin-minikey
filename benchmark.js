// Testing Node.js's speed for various functions:
// Built-in functions for assisting:
//     http://nodejs.org/api/process.html#process_process_hrtime
//     http://nodejs.org/api/console.html#console_console_time_label

var bignum = require('bignum');

var rounds = 20000;


console.log('Base58 encoding');
var chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var data = new Buffer('15e1a259dbef84baa4c9', 'hex'); // '2EJVBL6PvHq9v8' encoded
console.log('data:', data);
var base = chars.length;


function base58encode_array(data) {
	var num = bignum.fromBuffer(data);
	var encoded = [];

	while(num.gt(0)) {
		encoded.push(chars.charAt(num.mod(base)));
		num = num.div(base);
	}
	return encoded.reverse().join('');
}
console.log('encoded (array)', base58encode_array(data));
console.time('base58-array');
for (var i = 0; i < rounds; i++) {
	base58encode_array(data);
}
console.timeEnd('base58-array');


function base58encode_rarray(data) {
	var num = bignum.fromBuffer(data);
	var encoded = [];

	while(num.gt(0)) {
		encoded.unshift(chars.charAt(num.mod(base)));
		num = num.div(base);
	}
	return encoded.join('');
}
console.log('encoded (reversed-array)', base58encode_rarray(data));
console.time('base58-reversed-array');
for (var i = 0; i < rounds; i++) {
	base58encode_rarray(data);
}
console.timeEnd('base58-reversed-array');


function base58encode_string(data) {
	var num = bignum.fromBuffer(data);
	var encoded = '';

	while(num.gt(0)) {
		encoded = chars.charAt(num.mod(base))+encoded;
		num = num.div(base);
	}
	return encoded
}
console.log('encoded (string)', base58encode_string(data));
console.time('base58-string');
for (var i = 0; i < rounds; i++) {
	base58encode_string(data);
}
console.timeEnd('base58-string');
