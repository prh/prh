import m = require("../lib/model");
import r = require("../lib/regexp");

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
	describe("ChangeSet", ()=> {
		describe(".applyChangeSets", ()=> {
			it("can apply change sets. pattern shorten", ()=> {
				var regexp = /Webだー*/g;
				var expected = "Webさ";
				var base = "今日の晩御飯はWebだーーーーーーー！そしておかずもWebだ！";
				var changeSets = r
					.collectAll(regexp, base)
					.map(result => {
						return new m.ChangeSet({
							pattern: regexp,
							expected: expected,
							index: result.index,
							matches: Array.prototype.slice.call(result)
						});
					});
				var result = m.ChangeSet.applyChangeSets(base, changeSets);
				assert(result === "今日の晩御飯はWebさ！そしておかずもWebさ！");
			});
			it("can apply change sets. pattern longer", ()=> {
				var regexp = /Web/g;
				var expected = "ウェッブ";
				var base = "今日の晩御飯はWebだ！そしておかずもWebだ！";
				var changeSets = r
					.collectAll(regexp, base)
					.map(result => {
						return new m.ChangeSet({
							pattern: regexp,
							expected: expected,
							index: result.index,
							matches: Array.prototype.slice.call(result)
						});
					});
				var result = m.ChangeSet.applyChangeSets(base, changeSets);
				assert(result === "今日の晩御飯はウェッブだ！そしておかずもウェッブだ！");
			});
			it("can apply change sets with grouping", ()=> {
				var regexp = /(博多)の(潮)/g;
				var expected = "伯方($1ではない)の塩($2ではない)";
				var base = "白いご飯と博多の潮！";
				var changeSets = r
					.collectAll(regexp, base)
					.map(result => {
						return new m.ChangeSet({
							pattern: regexp,
							expected: expected,
							index: result.index,
							matches: Array.prototype.slice.call(result)
						});
					});
				var result = m.ChangeSet.applyChangeSets(base, changeSets);
				assert(result === "白いご飯と伯方(博多ではない)の塩(潮ではない)！");
			});
			it("can apply change sets with grouping", ()=> {
				var regexpA = /Web/ig;
				var regexpB = /火/ig;
				var base = "ある火のWEBと、とある火のwebの話";
				var changeSetsA = r
					.collectAll(regexpA, base)
					.map(result => {
						return new m.ChangeSet({
							pattern: regexpA,
							expected: "Web",
							index: result.index,
							matches: Array.prototype.slice.call(result)
						});
					});
				var changeSetsB = r
					.collectAll(regexpB, base)
					.map(result => {
						return new m.ChangeSet({
							pattern: regexpB,
							expected: "日",
							index: result.index,
							matches: Array.prototype.slice.call(result)
						});
					});
				var changeSets = changeSetsA.concat(changeSetsB);
				var result = m.ChangeSet.applyChangeSets(base, changeSets);
				assert(result === "ある日のWebと、とある日のWebの話");
			});
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
						wordBoundary: true
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
						wordBoundary: true
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
		describe("#makeChangeSet", ()=> {
			it("succeed spec", ()=> {
				var rule = new m.Rule({
					expected: "JS"
				});
				var base = "今日はjs明日はts明後日はなんのaltjsですかねぇ？";
				var changeSets = rule.makeChangeSet(base);

				var result = m.ChangeSet.applyChangeSets(base, changeSets);
				assert(result === "今日はJS明日はts明後日はなんのaltJSですかねぇ？");
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
