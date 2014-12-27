"use strict";

import raw = require("./raw");
import Target = require("./target");
import Rule = require("./rule");

class Config {
	version:number;
	targets:Target[];
	rules:Rule[];

	constructor(src:raw.Config) {
		if (!src) {
			throw new Error("src is requried");
		}
		this.version = +src.version || 1;
		this.targets = (src.targets || []).map(target => new Target(target));
		this.rules = (src.rules || []).map(rule => new Rule(rule));
	}

	merge(other:Config) {
		if (this.version !== other.version) {
			throw new Error("version mismatch!");
		}

	}

	replaceByRule(content:string) {
		this.rules.forEach(rule => {
			content = content.replace(rule.pattern, rule.expected);
		});
		return content;
	}
}

export = Config;
