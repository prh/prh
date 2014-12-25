"use strict";

import r = require("../lib/utils/regexp");

import ChangeSet = require("../lib/changeset");

describe("ChangeSet", ()=> {
	describe(".applyChangeSets", ()=> {
		it("can apply change sets. pattern shorten", ()=> {
			var regexp = /Webだー*/g;
			var expected = "Webさ";
			var base = "今日の晩御飯はWebだーーーーーーー！そしておかずもWebだ！";
			var changeSets = r
				.collectAll(regexp, base)
				.map(result => {
					return new ChangeSet({
						pattern: regexp,
						expected: expected,
						index: result.index,
						matches: Array.prototype.slice.call(result)
					});
				});
			var result = ChangeSet.applyChangeSets(base, changeSets);
			assert(result === "今日の晩御飯はWebさ！そしておかずもWebさ！");
		});
		it("can apply change sets. pattern longer", ()=> {
			var regexp = /Web/g;
			var expected = "ウェッブ";
			var base = "今日の晩御飯はWebだ！そしておかずもWebだ！";
			var changeSets = r
				.collectAll(regexp, base)
				.map(result => {
					return new ChangeSet({
						pattern: regexp,
						expected: expected,
						index: result.index,
						matches: Array.prototype.slice.call(result)
					});
				});
			var result = ChangeSet.applyChangeSets(base, changeSets);
			assert(result === "今日の晩御飯はウェッブだ！そしておかずもウェッブだ！");
		});
		it("can apply change sets with grouping", ()=> {
			var regexp = /(博多)の(潮)/g;
			var expected = "伯方($1ではない)の塩($2ではない)";
			var base = "白いご飯と博多の潮！";
			var changeSets = r
				.collectAll(regexp, base)
				.map(result => {
					return new ChangeSet({
						pattern: regexp,
						expected: expected,
						index: result.index,
						matches: Array.prototype.slice.call(result)
					});
				});
			var result = ChangeSet.applyChangeSets(base, changeSets);
			assert(result === "白いご飯と伯方(博多ではない)の塩(潮ではない)！");
		});
		it("can apply change sets with grouping", ()=> {
			var regexpA = /Web/ig;
			var regexpB = /火/ig;
			var base = "ある火のWEBと、とある火のwebの話";
			var changeSetsA = r
				.collectAll(regexpA, base)
				.map(result => {
					return new ChangeSet({
						pattern: regexpA,
						expected: "Web",
						index: result.index,
						matches: Array.prototype.slice.call(result)
					});
				});
			var changeSetsB = r
				.collectAll(regexpB, base)
				.map(result => {
					return new ChangeSet({
						pattern: regexpB,
						expected: "日",
						index: result.index,
						matches: Array.prototype.slice.call(result)
					});
				});
			var changeSets = changeSetsA.concat(changeSetsB);
			var result = ChangeSet.applyChangeSets(base, changeSets);
			assert(result === "ある日のWebと、とある日のWebの話");
		});
	});
});
