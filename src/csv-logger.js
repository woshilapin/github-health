var fs = require('fs');

module.exports = function(path, fields) {
	var file;
	var filepath = path;
	var listoffields = fields;
	var init = function() {
		var options = {
			flags: 'w',
			encoding: 'utf8'
		};
		file = fs.createWriteStream(filepath, options);
		if(listoffields instanceof Array) {
			file.write(listoffields.join());
		} else if(listoffields instanceof String) {
			file.write(listoffields);
		}
		newline();
	};
	var newline = function() {
		file.write('\n');
	};
	var pushline = function(line) {
		if(line instanceof Array) {
			file.write(line.join());
		} else if(line instanceof String) {
			file.write(line);
		}
		newline();
	};
	var end = function() {
		file.end();
	};
	return {
		init: init,
		pushline: pushline,
		end: end
	};
};
