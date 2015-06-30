var https = require('https');
var readline = require('readline');

var defaultoptions = {
	host: 'api.github.com',
	method: 'GET',
	auth: "octocat:githubpass",
	headers: {
		'Accept': 'application/vnd.github.v3+json',
		'User-Agent': 'iojs'
	}
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

console.log(fields.join());

var askinput = function(message) {
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

var askjson = function(path) {
	return new Promise(function(resolve, reject) {
		var options = defaultoptions;
		options.path = path;
		https.request(options, function(res) {
			console.log(`Request to '${path}'`);
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
				var links = res.headers.link;
				if(res.headers.link) {
					var matchnextpath = links.match(/<([^>]*)>; rel="next"/);
					if(matchnextpath !== null) {
						var nextpath = matchnextpath[1];
						console.log(`Need more pages from '${path}'`);
						askjson(nextpath)
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

askinput("Give your credentials for username:password for Github? ")
.then(function(credential) {
	defaultoptions.auth = credential;
	return askinput("Which account would you like to analyze? ");
})
.then(function(account) {
	var path = '/users/' + account + '/repos';
	return askjson(path);
})
.then(function(repos) {
	var requests = [];
	for(var repo of repos) {
		// TO REMOVE
		if(repo.name !== 'xwiki-rendering') {
			continue;
		}
		if(!repo.fork) {
			var path = '/repos/' + repo.owner.login + '/' + repo.name + '/pulls?state=all';
			requests.push(askjson(path));
		}
	}
	return Promise.all(requests);
})
.then(function(pullsperrepo) {
	var requests = [];
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
			Promise.all([
					line,
					askjson(pull.review_comments_url),
					askjson(pull.commits_url)
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
				});
		};
	}
});
