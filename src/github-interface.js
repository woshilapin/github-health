var https = require('https');

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
		var send = function() {
			return new Promise(function(resolve, reject) {
				https.request(options, function(res) {
					console.log(`Request to '${options.path}'`);
					var body = '';
					res.setEncoding('utf8');
					res.on('data', function(chunk) {
						body += chunk;
					});
					res.on('error', function(error) {
						console.error(error);
						console.log('Retry in 5 minute.');
						return sleep(300000, function() {
							var retrygi = new GithubRequest(options.path);
							return retrygi.send();
						});
						reject(new Error(error));
					});
					res.on('end', function() {
						var remaining = parseInt(res.headers['x-ratelimit-remaining']);
						if(remaining % 10 === 0) {
							console.log(`[remains ${remaining}]`);
						}
						if(body === '') {
							body = '{}';
						}
						var json = JSON.parse(body);
						if(res.statusCode === 403) {
							if(remaining === 0) {
								console.log('Retry in 5 minute.');
								return sleep(300000, function() {
									var retrygi = new GithubRequest(options.path);
									return retrygi.send();
								});
							} else {
								reject(new Error(json.message));
							}
						}
						var links = res.headers.link;
						if(res.headers.link) {
							var matchnextpath = links.match(/<([^>]*)>; rel="next"/);
							if(matchnextpath !== null) {
								var nextpath = matchnextpath[1];
								console.log(`Need more pages from '${path}'`);
								var nextpagegi = new GithubRequest(nextpath);
								nextpagegi.send()
								.then(function(nextpage) {
									var newjson = json.concat(nextpage);
									resolve(newjson);
								});
							} else {
								resolve(json);
							}
						} else {
							resolve(json);
						}
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
