var GithubInterface = require('./github-interface.js');
var Configuration = require('./configuration.js');
var CSVlogger = require('./csv-logger.js');

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


var configuration = new Configuration();
var csv = new CSVlogger('data/pulls.csv', fields);
csv.init();
var gi;

var reportError = function(error) {
	console.log(error);
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
			var path = '/repos/' + repo.owner.login + '/' + repo.name + '/pulls?state=all';
			var pullsgi = gi.createRequest(path);
			pullsgi.send()
				.then(parsePullRequests, reportError);
		}
	}
};
var parsePullRequests = function(response) {
	if(response.headers.next) {
		console.log(response.headers.next);
		var nextpath = response.headers.next;
		var nextpagegi = gi.createRequest(nextpath);
		nextpagegi.send()
			.then(parsePullRequests, reportError);
	}
	for(var pull of response.body) {
		var line = {};
		line.owner = pull.base.user.login;
		line.repo = pull.base.repo.name;
		line.id = pull.number;
		line.author = pull.user.login;
		line.state = pull.state;
		line.created_at = pull.created_at;
		line.closed_at = pull.closed_at;
		line.merged_at = pull.merged_at;
		line.updated_at = pull.updated_at;
		if(pull.merged_at === null) {
			line.merged = false;
		} else {
			line.merged = true;
		}
		var commentsgi = gi.createRequest(pull.review_comments_url);
		var commitsgi = gi.createRequest(pull.commits_url);
		Promise.all([
				line,
				commentsgi.send(),
				commitsgi.send()
		])
			.then(function(prdetails) {
				var line = prdetails[0];
				var prcomments = prdetails[1].body;
				var prcommits = prdetails[2].body;
				line.comments = prcomments.length;
				line.commits = prcommits.length;
				var result = [];
				for(var key of fields) {
					result.push(line[key]);
				}
				csv.pushline(result);
			}, reportError);
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
.then(parseRepos, reportError);
