var https = require('https');

module.exports = function(credentials) {
	var GithubRequest = function(path) {
		var options = {
			host: 'api.github.com',
			method: 'GET',
			auth: credentials,
			path: path,
			headers: {
				'Accept': 'application/vnd.github.v3+json',
				'User-Agent': 'iojs'
			}
		};
		var sleep = function(delay, promise) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					promise()
						.then(function(result) {
							resolve(result);
						}, function(error) {
							reject(error);
						});
				}, delay);
			});
		};
		var retry = function(path, delay) {
			console.log(`Retry '${path}' in ${delay} seconds.`);
			return new Promise(function(resolve) {
				sleep(delay*1000, function() {
					var retrygi = new GithubRequest(path);
					resolve(retrygi.send())
				});
			});
		};
		var extractHeaderLink = function(headers, name) {
			var regexp = new RegExp("<([^>]*)>; rel=\"" + name + "\"");
			var link = headers.link;
			if(link) {
				var match = link.match(regexp);
				if(match !== null) {
					return match[1];
				} else {
					return undefined;
				}
			} else {
				return undefined;
			}
		};
		var send = function() {
			return new Promise(function(resolve, reject) {
				https.request(options, function(res) {
					console.log(`Request to '${options.path}'`);
					var bodystream = '';
					res.setEncoding('utf8');
					res.on('data', function(chunk) {
						bodystream += chunk;
					});
					res.on('error', function(error) {
						console.error(error);
						reject(new Error(error));
					});
					res.on('end', function() {
						var remaining = parseInt(res.headers['x-ratelimit-remaining']);
						// If Github request limit has been reached
						if(res.statusCode === 403 && remaining === 0) {
							// Retry in 5 minutes
							resolve(retry(options.path, 3000));
						}
						if(bodystream === '') {
							bodystream = '{}';
						}
						var body = JSON.parse(bodystream);
						res.headers.first = extractHeaderLink(res.headers, "first");
						res.headers.prev = extractHeaderLink(res.headers, "prev");
						res.headers.next = extractHeaderLink(res.headers, "next");
						res.headers.last = extractHeaderLink(res.headers, "last");
						res.body = body;
						resolve(res);
					});
				}).end();
			});
		};
		return {
			send: send
		};
	};
	var createRequest = function(path) {
		return new GithubRequest(path);
	};
	return {
		createRequest: createRequest
	};
};
