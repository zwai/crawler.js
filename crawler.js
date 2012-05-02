/*
 *	crawler.js: A simple HTTP crawler
 *
 *  Copyright(c) 2012 Wayne Chen <zwai.chen@gmail.com>
 *
 *  GPLv3 License
 */

var util = require('util');
var events = require('events');
var urlparse = require('url');
var http = require('http');
var buffertools = require('buffertools');

exports.create = function (urls, options) {
	return new Crawler(urls, options);
}

var default_headers = {
	'user-agent': 'Mozilla/5.0 (Windows NT 5.1; rv:10.0.2) Gecko/20100101 Firefox/10.0.2',
	'accept-language': 'zh-tw,en-us;q=0.7,en;q=0.3',
};


var Crawler = function (urls, options) {
	events.EventEmitter.call(this);

	this.options = options || {};
	this.options.headers = this.options.headers || default_headers;

	switch (typeof(urls)) {
		case 'string':
			this.urls = [urls];
			break;
		case 'undefined':
			this.urls = [];
			break;
		case 'object':
			if (util.isArray(urls)) {
				this.urls = urls;
				break;
			} 
		default:
			throw new Error('First argument type error!');
	}

	this._running = false;
};

util.inherits(Crawler, events.EventEmitter);

Crawler.prototype.start = function () {
	if (!this._running) {
		this._running = true;
		this._next();
	}
};

Crawler.prototype.stop = function () {
	if (this._running) {
		this._running = false;
		this.emit('stop', null, this);
	}
};

Crawler.prototype.addUrls = function (urls) {
	if (typeof urls == 'string' || Array.isArray(urls)) {
		this.urls = this.urls.concat(urls);
	}
	else {
		throw new Error('First argument type error!');
	}
}

Crawler.prototype._next = function () {
	if (this._running) {
		if (this.urls.length > 0) {
			var url = this.urls.shift();
			this._download(url);
		} 
		else {
			this.stop();
		}
	}
};

Crawler.prototype._download = function (url) {

	var parsed = urlparse.parse(url);
	var options = this.options;

	options.host = parsed.host;
	options.port = parsed.port || 80;
	options.path = parsed.path;
	options.method = options.method || 'GET';

	var self = this;

	var buffer = new Buffer(0);
	var request = http.request(options, function (response) {
		response.on('data', function (chunk) {
			buffer = buffer.concat(chunk);
		});

		response.on('end', function () {
			self.current = options;
			self.response = response;
			self.bodyBuffer = buffer;
			self.emit('received', null, self);
			self._next();
		});
	});

	request.on('error', function (e) {
		console.log(e.message());
	});

	request.end();

	return ;
}

