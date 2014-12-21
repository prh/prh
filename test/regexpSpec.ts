import r = require("../lib/regexp");

describe("regexp", ()=> {
	describe("jpHira", ()=> {
		it("can detect hiragana", ()=> {
			assert(r.jpHira.test("a") === false);
			assert(r.jpHira.test("あ") === true);
			assert(r.jpHira.test("ア") === false);
			assert(r.jpHira.test("神") === false);
		});
	});

	describe("jpKana", ()=> {
		it("can detect katakana", ()=> {
			assert(r.jpKana.test("a") === false);
			assert(r.jpKana.test("あ") === false);
			assert(r.jpKana.test("ア") === true);
			assert(r.jpKana.test("神") === false);
		});
	});

	describe("jpKanji", ()=> {
		it("can detect kanji", ()=> {
			assert(r.jpKanji.test("a") === false);
			assert(r.jpKanji.test("あ") === false);
			assert(r.jpKanji.test("ア") === false);
			assert(r.jpKanji.test("神") === true);
		});
	});

	describe("jpChar", ()=> {
		it("can detect japanese character", ()=> {
			assert(r.jpChar.test("a") === false);
			assert(r.jpChar.test("あ") === true);
			assert(r.jpChar.test("ア") === true);
			assert(r.jpChar.test("神") === true);
		});
	});

	describe("concat", ()=> {
		it("concat string:string", ()=> {
			var regexp = r.concat("Hello", "TypeScript");
			assert(regexp.source === "HelloTypeScript");

			assert(regexp.test("HelloTypeScript"));
		});
		it("concat string:regexp", ()=> {
			var regexp = r.concat("Hello", /TypeScript/);
			assert(regexp.source === "HelloTypeScript");

			assert(regexp.test("HelloTypeScript"));
		});
		it("concat regexp:string", ()=> {
			var regexp = r.concat(/Hello/, "TypeScript");
			assert(regexp.source === "HelloTypeScript");

			assert(regexp.test("HelloTypeScript"));
		});
		it("concat regexp:regexp", ()=> {
			var regexp = r.concat(/Hello/, /TypeScript/);
			assert(regexp.source === "HelloTypeScript");

			assert(regexp.test("HelloTypeScript"));
		});
	});

	describe("combine", ()=> {
		it("combine string:string", ()=> {
			var regexp = r.combine("Hello", "TypeScript");
			assert(regexp.source === "(?:Hello|TypeScript)");

			assert(regexp.test("Hello"));
			assert(regexp.test("TypeScript"));
		});
		it("combine string:regexp", ()=> {
			var regexp = r.combine("Hello", /TypeScript/);
			assert(regexp.source === "(?:Hello|TypeScript)");

			assert(regexp.test("Hello"));
			assert(regexp.test("TypeScript"));
		});
		it("combine regexp:string", ()=> {
			var regexp = r.combine(/Hello/, "TypeScript");
			assert(regexp.source === "(?:Hello|TypeScript)");

			assert(regexp.test("Hello"));
			assert(regexp.test("TypeScript"));
		});
		it("combine regexp:regexp", ()=> {
			var regexp = r.combine(/Hello/, /TypeScript/);
			assert(regexp.source === "(?:Hello|TypeScript)");

			assert(regexp.test("Hello"));
			assert(regexp.test("TypeScript"));
		});
	});

	describe("addBoundary", ()=> {
		it("addBoundary to string", ()=> {
			var regexp = r.addBoundary("Hello");
			assert(regexp.source === "\\bHello\\b");

			assert(regexp.test("Hello"));
		});
		it("addBoundary to regexp", ()=> {
			var regexp = r.addBoundary(/Hello/);
			assert(regexp.source === "\\bHello\\b");

			assert(regexp.test("Hello"));
		});
		it("detect word boundary by alphabet", ()=> {
			var regexp = r.addBoundary(/js/);

			assert(regexp.test("js") === true);
			assert(regexp.test("A js B") === true);
			assert(regexp.test("A altjs B") === false);
			assert(regexp.test("A jsdoit B") === false);
		});
	});

	describe("parseRegExpString", ()=> {
		it("parse regexp style string", ()=> {
			var regexp = r.parseRegExpString("/[3-9]th/ig");

			assert(regexp.source === "[3-9]th");
			assert(regexp.ignoreCase === true);
			assert(regexp.global === true);
			assert(regexp.multiline === false);
		});
		it("can't parse non-regexp style string", ()=> {
			var regexp = r.parseRegExpString("Hi!");

			assert(regexp === null);
		});
	});

	describe("spreadAlphaNum", ()=> {
		it("spread alphabet & number to widely", ()=> {
			var regexp = r.spreadAlphaNum("abcdefghijklmnopqrstuvwxyz0123456789");

			assert(regexp.source === "[AaＡａ][BbＢｂ][CcＣｃ][DdＤｄ][EeＥｅ][FfＦｆ][GgＧｇ][HhＨｈ][IiＩｉ][JjＪｊ][KkＫｋ][LlＬｌ][MmＭｍ][NnＮｎ][OoＯｏ][PpＰｐ][QqＱｑ][RrＲｒ][SsＳｓ][TtＴｔ][UuＵｕ][VvＶｖ][WwＷｗ][XxＸｘ][YyＹｙ][ZzＺｚ][0０][1１][2２][3３][4４][5５][6６][7７][8８][9９]");
		});
		it("match widely expression", ()=> {
			var regexp = r.spreadAlphaNum("web");

			assert(regexp.test("Web") === true);
			assert(regexp.test("web") === true);
			assert(regexp.test("WEB") === true);
			assert(regexp.test("Ｗｅｂ") === true);
			assert(regexp.test("ｗｅｂ") === true);
			assert(regexp.test("ＷＥＢ") === true);

			assert(regexp.test("foo") === false);
		});
	});

	describe("addDefaultFlags", ()=> {
		it("add g flags", ()=> {
			var regexp = r.addDefaultFlags(/hello/);

			assert(regexp.source === "hello");
			assert(regexp.global === true);
			assert(regexp.ignoreCase === false);
			assert(regexp.multiline === false);
		});
		it("add g flags and keep m flag", ()=> {
			var regexp = r.addDefaultFlags(/hello/m);

			assert(regexp.source === "hello");
			assert(regexp.global === true);
			assert(regexp.ignoreCase === false);
			assert(regexp.multiline === true);
		});
		it("add g flags and keep i flag", ()=> {
			var regexp = r.addDefaultFlags(/hello/i);

			assert(regexp.source === "hello");
			assert(regexp.global === true);
			assert(regexp.ignoreCase === true);
			assert(regexp.multiline === false);
		});
	});
});
