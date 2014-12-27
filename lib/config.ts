"use strict";

import r = require("./utils/regexp");

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
		if (!other) {
			throw new Error("other is required");
		}
		if (this.version !== other.version) {
			throw new Error("version mismatch!");
		}
		other.targets.forEach(otherTarget => {
			var exists = this.targets.filter(target => r.equals(target.file, otherTarget.file)).length !== 0;
			if (!exists) {
				this.targets.push(otherTarget);
			}
		});
		other.rules.forEach(otherRule => {
			var exists = this.rules.filter(rule => rule.expected === otherRule.expected).length !== 0;
			if (!exists) {
				this.rules.push(otherRule);
			}
		});
	}

	replaceByRule(content:string) {
		this.rules.forEach(rule => {
			content = content.replace(rule.pattern, rule.expected);
		});
		return content;
	}
}

export = Config;
