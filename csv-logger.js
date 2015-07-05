var fs = require('fs');

module.exports = function CSVlogger(path, fields) {
	var file;
	var filepath = path;
	var listoffields = fields;
	var init = function init() {
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
	var newline = function newline() {
		file.write('\n');
	};
	var pushline = function pushline(line) {
		if(line instanceof Array) {
			file.write(line.join());
		} else if(line instanceof String) {
			file.write(line);
		}
		newline();
	};
	var end = function end() {
		file.end();
	};
	return {
		init: init,
		pushline: pushline,
		end: end
	};
};
