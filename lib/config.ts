"use strict";

import raw = require("./raw");
import Rule = require("./rule");

class Config {
	version:number;
	rules:Rule[];

	constructor(src:raw.Config) {
		if (!src) {
			throw new Error("src is requried");
		}
		this.version = +src.version || 1;
		this.rules = (src.rules || []).map(rule => new Rule(rule));
	}

	replaceByRule(content:string) {
		this.rules.forEach(rule => {
			content = content.replace(rule.pattern, rule.expected);
		});
		return content;
	}
}

export = Config;
