var GithubInterface = require('./github-interface.js');
var Configuration = require('./configuration.js');
var CSVlogger = require('./csv-logger.js');

var fields = [
'owner',
'repo',
'id',
'author',
'created_at',
'comment_count'
];


var configuration = new Configuration();
var csv = new CSVlogger('data/commits.csv', fields);
csv.init();
var gi;

var reportError = function(error) {
	console.error(error);
};
var parseRepos = function(response) {
	if(response.headers.next) {
		console.log(response.headers.next);
		var nextpath = response.headers.next;
		var nextpagegi = gi.createRequest(nextpath);
		nextpagegi.send()
			.then(parseRepos, reportError);
	}
	for(var repo of response.body) {
		if(!repo.fork) {
			var path = '/repos/' + repo.owner.login + '/' + repo.name + '/commits';
			var commitsgi = gi.createRequest(path);
			commitsgi.send()
				.then(parseCommits, reportError);
		}
	}
};
var parseCommits = function(response) {
	if(response.headers.next) {
		console.log(response.headers.next);
		var nextpath = response.headers.next;
		var nextpagegi = gi.createRequest(nextpath);
		nextpagegi.send()
			.then(parseCommits, reportError);
	}
	for(var commit of response.body) {
		var line = {};
		var matchurl = commit.url.match(/^https:\/\/api.github.com\/repos\/(.*)\/(.*)\/commits/);
		line.owner = matchurl[1];
		line.repo = matchurl[2];
		line.id = commit.sha;
		line.author = commit.author.login;
		line.date = commit.commit.author.date;
		line.comments = commit.commit.comment_count;
		var result = [];
		for(var key of fields) {
			result.push(line[key]);
		}
		csv.pushline(result);
	}
};

configuration.setfromfile()
.then(function() {
	return configuration.setcredentials();
})
.then(function() {
	gi = new GithubInterface(configuration.getcredentials());
	return configuration.setaccount();
})
.then(function() {
	var path = '/users/' + configuration.getaccount() + '/repos';
	var reposgi = gi.createRequest(path);
	return reposgi.send();
})
.then(parseRepos, reportError
)
