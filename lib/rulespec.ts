"use strict";

import raw = require("./raw")

class RuleSpec {
	from:string;
	to:string;

	constructor(src:raw.RuleSpec) {
		if (!src) {
			throw new Error("src is requried");
		}
		if (!src.from) {
			throw new Error("from is requried");
		}
		if (!src.to) {
			throw new Error("to is requried");
		}
		this.from = src.from;
		this.to = src.to;
	}
}

export = RuleSpec;
