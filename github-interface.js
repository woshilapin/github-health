var https = require('https');

module.exports = function GithubInterface() {
	var options = {
		host: 'api.github.com',
		method: 'GET',
		headers: {
			'Accept': 'application/vnd.github.v3+json',
			'User-Agent': 'iojs'
		}
	};
	var request = function request(path) {
		options.path = path;
		return new Promise(function(resolve, reject) {
			https.request(options, function(res) {
				console.log(`Request to '${options.path}'`);
				var body = '';
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
					body += chunk;
				});
				res.on('error', function (error) {
					console.error(error);
					reject(new Error(error));
				});
				res.on('end', function() {
					if(body == '') {
						body = '{}';
					}
					var json = JSON.parse(body);
					if(res.statusCode === 403) {
						reject(new Error(json.message));
					}
					var links = res.headers.link;
					if(res.headers.link) {
						var matchnextpath = links.match(/<([^>]*)>; rel="next"/);
						if(matchnextpath !== null) {
							var nextpath = matchnextpath[1];
							console.log(`Need more pages from '${path}'`);
							var nextpagegi = new GithubInterface();
							nextpagegi.request(nextpath)
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
		request: request
	};
};
