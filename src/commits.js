var GithubInterface = require('./github-interface.js');
var Configuration = require('./configuration.js');
var CSVlogger = require('./csv-logger.js');

var fields = [
'owner',
'repo',
'id',
'author',
'date',
'comment_count'
];


var configuration = new Configuration();
var csv = new CSVlogger('commits.csv', fields);
csv.init();
var gi;

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
.then(function(repos) {
	var requests = [];
	for(var repo of repos) {
		if(!repo.fork) {
			var path = '/repos/' + repo.owner.login + '/' + repo.name + '/commits';
			var commitsgi = gi.createRequest(path);
			requests.push(commitsgi.send());
		}
	}
	return Promise.all(requests);
}, function(error) {
	console.error(error);
})
.then(function(commitsperrepo) {
	for(var commits of commitsperrepo) {
		console.log(commits.length);
		for(var commit of commits) {
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
	}
}, function(error) {
	console.error(error);
});
