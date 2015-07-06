var fs = require('fs');
var readline = require('readline');

module.exports = function() {
	var configurationpath = 'health.json';
	var configuration = {};
	var setfromfile = function() {
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
				reject(error);
			});
			rs.on('end', function() {
				configuration = JSON.parse(data);
				resolve(true);
			});
		});
	};
	var askinput = function(message) {
		return new Promise(function(resolve) {
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
	var setproperty = function(message, fieldname) {
		return new Promise(function(resolve, reject) {
			if(configuration[fieldname] !== undefined) {
				resolve();
			} else {
				return askinput(message)
				.then(function(fieldvalue) {
					configuration[fieldname] = fieldvalue;
					resolve();
				}, function(error) {
					reject(error);
				});
			}
		});
	};
	var setcredentials = function() {
		return setproperty("Give your credentials for a Github account [username:password]? ", 'credentials');
	};
	var setaccount = function() {
		return setproperty("Which account would you like to analyze? ", 'account');
	};
	var getcredentials = function() {
		return configuration.credentials;
	};
	var getaccount = function() {
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
