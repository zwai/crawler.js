var util = require('util');
var Iconv = require('iconv').Iconv;

var crawler = require('../crawler.js').create();

var spawn = require('child_process').spawn;

var iconv = new Iconv('BIG-5', 'UTF-8');

console.log('testing...');


crawler.addListener('received', function (e, crawler) {
	console.log(iconv.convert(crawler.bodyBuffer).toString());
});

crawler.addListener('stop', function (e, crawler) {
	console.log('finished');
	return;
});


URL_MIS = 'http://mis.twse.com.tw/data/%s.csv';
stock_symbols = ['2412', '2006', '1216'];

urls = [];

stock_symbols.forEach(function (symbol) {
		urls.push(util.format(URL_MIS, symbol));
});

crawler.addUrls(urls);
crawler.addUrls(util.format(URL_MIS, '2330'));
crawler.addUrls(util.format(URL_MIS, '2317'));

crawler.start();

