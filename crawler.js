/*
 *	crawler.js: A simple HTTP crawler
 *
 *  Copyright(c) 2012 Wayne Chen <zwai.chen@gmail.com>
 *
 *  GPLv3 License
 */

var request = require('/usr/lib/node_modules/http-agent/node_modules/request/');
var util = require('util');
var events = require('events');
var url = require('url');

exports.create = function (urls, options) {
	return new Crawler(urls, options);
}


var default_headers = {
	'user-agent': 'Mozilla/5.0 (Windows NT 5.1; rv:10.0.2) Gecko/20100101 Firefox/10.0.2',
	'accept-language': 'zh-tw,en-us;q=0.7,en;q=0.3',
};


var Crawler = function (urls, options) {
	events.EventEmitter.call(this);

	this._debug = true;

	this.options = options || {};
	this.options.headers = this.options.headers || default_headers;
	
	switch (typeof(urls)) {
		case 'string':
			this.urls = [urls];
			break;
		case 'array':
			this.urls = urls;
			break;
		case 'undefined':
			this.urls = [];
			break;
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

Crawler.prototype._isValidUrl = function (url) {
	
}

Crawler.prototype._download = function (url) {

	var options = {
		url: url,
		headers: this.options.headers,
	};

	if (this._debug) {
		console.log('\n=== Request Header ===');
		for (var key in this.options.headers) {
			console.log(key+ ': ' + options.headers[key]);
		}
		console.log('======================\n');
	}

	var self = this;

	request(options, function (err, response, body) {
		if (err) {
			console.error('download error');
			self._next();
			return;
		}

		self.current = options;
		self.response = response;
		self.body = body;
		self.options = self;

		self.emit('received', null, self);
		self._next();
	});

	return ;
}
/*
agent = new Crawler('http://localhost:8000');
//agent = new Crawler();
agent.addListener('received', function (e, agent) {
	console.log(agent.body);
});

agent.addListener('stop', function (e, agent) {
	console.log('stop');
	return;
});

agent.start();
*/
