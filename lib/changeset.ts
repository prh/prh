"use strict";

import r = require("./utils/regexp");

class ChangeSet {
	pattern:RegExp;
	expected:string;
	index:number;
	matches:string[];

	static makeChangeSet(str:string, pattern:RegExp, expected:string):ChangeSet[] {
		pattern.lastIndex = 0;
		var resultList = r.collectAll(pattern, str);
		return resultList.map(result => {
			return new ChangeSet({
				pattern: pattern,
				expected: expected,
				index: result.index,
				matches: Array.prototype.slice.call(result)
			});
		});
	}

	static applyChangeSets(str:string, list:ChangeSet[]):string {
		list = list.sort((a, b) => a.index - b.index);

		var delta = 0;
		list.forEach(data => {
			var result = data.expected.replace(/\$([0-9]{1,2})/g, (match:string, g1:string)=> {
				var index = parseInt(g1);
				if (index === 0 || (data.matches.length - 1) < index) {
					return match;
				}
				return data.matches[index] || "";
			});
			str = str.slice(0, data.index + delta) + result + str.slice(data.index + delta + data.matches[0].length);
			delta += result.length - data.matches[0].length;
		});

		return str;
	}

	constructor(data:ChangeSet) {
		this.pattern = data.pattern;
		this.expected = data.expected;
		this.index = data.index;
		this.matches = data.matches;
	}
}

export = ChangeSet;
