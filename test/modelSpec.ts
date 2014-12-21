import m = require("../lib/model");

describe("model", ()=> {
	describe("Config", ()=> {
		it("parse raw.Config", ()=> {
			var config = new m.Config({
				version: 1,
				rules: [{
					expected: "vvakame"
				}]
			});

			assert(config.version === 1);
			assert(config.rules.length === 1);
			assert(config.rules[0].pattern instanceof RegExp);
		});
	});
	describe("Rule", ()=> {
		it("parse raw.Rule", ()=> {
			var rule = new m.Rule({
				expected: "vvakame"
			});

			assert(rule.pattern instanceof RegExp);
		});
		describe("#_patternToRegExp", ()=> {
			it("filled pattern from null, expected spread to alphabet, number", ()=> {
				var rule = new m.Rule({
					expected: "vv",
					pattern: null
				});

				assert(rule.pattern.source === "[VvＶｖ][VvＶｖ]");
				assert(rule.pattern.global === true);
			});
			it("filled pattern from null, expected spread to alphabet, number with word boundary", ()=> {
				var rule = new m.Rule({
					expected: "vv",
					pattern: null,
					options: {
						europian: true
					}
				});

				assert(rule.pattern.source === "\\b[VvＶｖ][VvＶｖ]\\b");
				assert(rule.pattern.global === true);
			});
			it("filled pattern from string (not regexp style)", ()=> {
				var rule = new m.Rule({
					expected: "vv",
					pattern: "vv"
				});

				assert(rule.pattern.source === "vv");
				assert(rule.pattern.global === true);
			});
			it("filled pattern from string (not regexp style)", ()=> {
				var rule = new m.Rule({
					expected: "vv",
					pattern: "vv",
					options: {
						europian: true
					}
				});

				assert(rule.pattern.source === "\\bvv\\b");
				assert(rule.pattern.global === true);
			});
			it("filled pattern from string (regexp style)", ()=> {
				var rule = new m.Rule({
					expected: "vv",
					pattern: "/vv/m"
				});

				assert(rule.pattern.source === "vv");
				assert(rule.pattern.global === true);
				assert(rule.pattern.multiline === true);
			});
			it("filled pattern from string[]", ()=> {
				var rule = new m.Rule({
					expected: "vv",
					pattern: [
						"/vv/",
						"aa"
					]
				});

				assert(rule.pattern.source === "(?:vv|aa)");
				assert(rule.pattern.global === true);
			});
		});
		describe("#check", ()=> {
			it("succeed spec", ()=> {
				new m.Rule({
					expected: "vvakame",
					specs: [{
						from: "ＶＶＡＫＡＭＥ",
						to: "vvakame"
					}]
				});
			});
			it("failed spec", ()=> {
				try {
					new m.Rule({
						expected: "vvakame",
						specs: [{
							from: "masahiro",
							to: "vvakame"
						}]
					});
				} catch (e) {
					return;
				}
				assert.fail("spec succeed unexpectedly");
			});
		});
	});
});
