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
var csv = new CSVlogger('pulls.csv', fields);
var csvinit = csv.init();

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
					csv.pushline(result);
				}, reporterror);
		};
	}
}, reporterror);
