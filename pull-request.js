var fs = require('fs');
var https = require('https');
var readline = require('readline');

var GithubInterface = function GithubInterface() {
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

var fields = [
'owner',
'repo',
'id',
'author',
'state',
'created_at',
'closed_at',
'merged_at',
'comments',
'commits',
'merged'
];

var Configuration = function Configuration() {
	var configurationpath = 'health.json';
	var configuration = {};
	var setfromfile = function setfromfile() {
		return new Promise(function(resolve, reject) {
			var options = {
				flags: 'r',
				encoding: 'utf8',
				autoClose: true
			};
			var rs = fs.createReadStream(configurationpath, options);
			var data = '';
			rs.on('data', function(chunk) {
				data += chunk;
			});
			rs.on('error', function(error) {
				resolve(false);
			});
			rs.on('end', function() {
				configuration = JSON.parse(data);
				resolve(true);
			});
		});
	};
	var askinput = function askinput(message) {
		return new Promise(function(resolve, reject) {
			var rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});
			rl.question(message, function(answer) {
				resolve(answer);
				rl.close();
			});
		});
	};
	var set = function set(message, fieldname) {
		return new Promise(function(resolve, reject) {
			if(configuration[fieldname] !== undefined) {
				resolve();
			} else {
				return askinput(message)
				.then(function(fieldvalue) {
					configuration[fieldname] = fieldvalue;
					resolve();
				});
			}
		});
	};
	var setcredentials = function setcredentials() {
		return set("Give your credentials for a Github account [username:password]? ", 'credentials');
	};
	var setaccount = function setaccount() {
		return set("Which account would you like to analyze? ", 'account');
	};
	var getcredentials = function getcredentials() {
		return configuration.credentials;
	};
	var getaccount = function getaccount() {
		return configuration.account;
	};
	return {
		setfromfile: setfromfile,
		setcredentials: setcredentials,
		setaccount: setaccount,
		getcredentials: getcredentials,
		getaccount: getaccount
	};
};

var configuration = new Configuration();

var reporterror = function reporterror(error) {
	console.error(error);
}

configuration.setfromfile()
.then(function() {
	return configuration.setcredentials();
})
.then(function() {
	return configuration.setaccount();
})
.then(function() {
	var path = '/users/' + configuration.getaccount() + '/repos';
	var reposgi = new GithubInterface();
	return reposgi.request(path);
})
.then(function(repos) {
	var requests = [];
	for(var repo of repos) {
		if(repo.name !== 'xwiki-commons') {
			continue;
		}
		if(!repo.fork) {
			var path = '/repos/' + repo.owner.login + '/' + repo.name + '/pulls?state=all';
			var pullsgi = new GithubInterface();
			requests.push(pullsgi.request(path));
		}
	}
	return Promise.all(requests);
}, reporterror)
.then(function(pullsperrepo) {
	for(var pulls of pullsperrepo) {
		for(var pull of pulls) {
			var line = {};
			line['owner'] = pull.base.user.login;
			line['repo'] = pull.base.repo.name;
			line['id'] = pull.number;
			line['author'] = pull.user.login;
			line['state'] = pull.state;
			line['created_at'] = pull.created_at;
			line['closed_at'] = pull.closed_at;
			line['merged_at'] = pull.merged_at;
			line['updated_at'] = pull.updated_at;
			if(pull.merged_at == null) {
				line['merged'] = false;
			} else {
				line['merged'] = true;
			}
			var commentsgi = new GithubInterface();
			var commitsgi = new GithubInterface();
			Promise.all([
					line,
					commentsgi.request(pull.review_comments_url),
					commitsgi.request(pull.commits_url)
			])
				.then(function(prdetails) {
					var line = prdetails[0];
					var prcomments = prdetails[1];
					var prcommits = prdetails[2];
					line['comments'] = prcomments.length;
					line['commits'] = prcommits.length;
					var result = [];
					for(var key of fields) {
						result.push(line[key]);
					}
					console.log(result.join());
				}, reporterror);
		};
	}
}, reporterror);
