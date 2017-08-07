import * as assert from "power-assert";

import {
    jpHira, jpKana, jpKanji, jpChar,
    concat, combine, equals,
    addBoundary, parseRegExpString, spreadAlphaNum, addDefaultFlags, escapeSpecialChars, collectAll, supportRegExpUnicodeFlag,
} from "../../lib/utils/regexp";

describe("regexp", () => {
    describe("jpHira", () => {
        it("can detect hiragana", () => {
            assert(jpHira.test("a") === false);
            assert(jpHira.test("あ") === true);
            assert(jpHira.test("ア") === false);
            assert(jpHira.test("神") === false);
        });
    });

    describe("jpKana", () => {
        it("can detect katakana", () => {
            assert(jpKana.test("a") === false);
            assert(jpKana.test("あ") === false);
            assert(jpKana.test("ア") === true);
            assert(jpKana.test("神") === false);
        });
    });

    describe("jpKanji", () => {
        it("can detect kanji", () => {
            assert(jpKanji.test("a") === false);
            assert(jpKanji.test("あ") === false);
            assert(jpKanji.test("ア") === false);
            assert(jpKanji.test("神") === true);
        });
    });

    describe("jpChar", () => {
        it("can detect japanese character", () => {
            assert(jpChar.test("a") === false);
            assert(jpChar.test("あ") === true);
            assert(jpChar.test("ア") === true);
            assert(jpChar.test("神") === true);
        });
    });

    describe("concat", () => {
        it("concat string:string", () => {
            const regexp = concat("Hello", "TypeScript");
            assert(regexp.source === "HelloTypeScript");

            assert(regexp.test("HelloTypeScript"));
        });
        it("concat string:regexp", () => {
            const regexp = concat("Hello", /TypeScript/);
            assert(regexp.source === "HelloTypeScript");

            assert(regexp.test("HelloTypeScript"));
        });
        it("concat regexp:string", () => {
            const regexp = concat(/Hello/, "TypeScript");
            assert(regexp.source === "HelloTypeScript");

            assert(regexp.test("HelloTypeScript"));
        });
        it("concat regexp:regexp", () => {
            const regexp = concat(/Hello/, /TypeScript/);
            assert(regexp.source === "HelloTypeScript");

            assert(regexp.test("HelloTypeScript"));
        });
    });

    describe("combine", () => {
        it("combine string:string", () => {
            const regexp = combine("Hello", "TypeScript");
            assert(regexp.source === "(?:Hello|TypeScript)");

            assert(regexp.test("Hello"));
            assert(regexp.test("TypeScript"));
        });
        it("combine string:regexp", () => {
            const regexp = combine("Hello", /TypeScript/);
            assert(regexp.source === "(?:Hello|TypeScript)");

            assert(regexp.test("Hello"));
            assert(regexp.test("TypeScript"));
        });
        it("combine regexp:string", () => {
            const regexp = combine(/Hello/, "TypeScript");
            assert(regexp.source === "(?:Hello|TypeScript)");

            assert(regexp.test("Hello"));
            assert(regexp.test("TypeScript"));
        });
        it("combine regexp:regexp", () => {
            const regexp = combine(/Hello/, /TypeScript/);
            assert(regexp.source === "(?:Hello|TypeScript)");

            assert(regexp.test("Hello"));
            assert(regexp.test("TypeScript"));
        });
    });

    describe("addBoundary", () => {
        it("addBoundary to string", () => {
            const regexp = addBoundary("Hello");
            assert(regexp.source === "\\bHello\\b");

            assert(regexp.test("Hello"));
        });
        it("addBoundary to regexp", () => {
            const regexp = addBoundary(/Hello/);
            assert(regexp.source === "\\bHello\\b");

            assert(regexp.test("Hello"));
        });
        it("detect word boundary by alphabet", () => {
            const regexp = addBoundary(/js/);

            assert(regexp.test("js") === true);
            assert(regexp.test("A js B") === true);
            assert(regexp.test("A altjs B") === false);
            assert(regexp.test("A jsdoit B") === false);
        });
    });

    describe("parseRegExpString", () => {
        it("parse regexp style string", () => {
            const regexp = parseRegExpString("/[3-9]th/ig");
            assert(!!regexp);

            assert(regexp!.source === "[3-9]th");
            assert(regexp!.ignoreCase === true);
            assert(regexp!.global === true);
            assert(regexp!.multiline === false);
        });
        it("can't parse non-regexp style string", () => {
            const regexp = parseRegExpString("Hi!");

            assert(regexp === null);
        });
    });

    describe("spreadAlphaNum", () => {
        it("spread alphabet & number to widely", () => {
            const regexp = spreadAlphaNum("abcdefghijklmnopqrstuvwxyz0123456789");

            assert(regexp.source === "[AaＡａ][BbＢｂ][CcＣｃ][DdＤｄ][EeＥｅ][FfＦｆ][GgＧｇ][HhＨｈ][IiＩｉ][JjＪｊ][KkＫｋ][LlＬｌ][MmＭｍ][NnＮｎ][OoＯｏ][PpＰｐ][QqＱｑ][RrＲｒ][SsＳｓ][TtＴｔ][UuＵｕ][VvＶｖ][WwＷｗ][XxＸｘ][YyＹｙ][ZzＺｚ][0０][1１][2２][3３][4４][5５][6６][7７][8８][9９]");
        });
        it("match widely expression", () => {
            const regexp = spreadAlphaNum("web");

            assert(regexp.test("Web") === true);
            assert(regexp.test("web") === true);
            assert(regexp.test("WEB") === true);
            assert(regexp.test("Ｗｅｂ") === true);
            assert(regexp.test("ｗｅｂ") === true);
            assert(regexp.test("ＷＥＢ") === true);

            assert(regexp.test("foo") === false);
        });
    });

    describe("addDefaultFlags", () => {
        it("add g, u & m flags", () => {
            const regexp = addDefaultFlags(/hello/);

            assert(regexp.source === "hello");
            assert(regexp.global === true);
            assert(regexp.ignoreCase === false);
            assert(regexp.multiline === true);
            if (supportRegExpUnicodeFlag) {
                assert(regexp.unicode === true);
            } else {
                assert(regexp.unicode == null);
            }
        });
        it("add g flags and keep i flag", () => {
            const regexp = addDefaultFlags(/hello/i);

            assert(regexp.source === "hello");
            assert(regexp.global === true);
            assert(regexp.ignoreCase === true);
            assert(regexp.multiline === true);
            if (supportRegExpUnicodeFlag) {
                assert(regexp.unicode === true);
            } else {
                assert(regexp.unicode == null);
            }
        });
    });

    describe("escapeSpecialChars", () => {
        it("replace special characters 1", () => {
            const result = escapeSpecialChars("/(?!S)ML/");

            assert(result === "\\/\\(\\?!S\\)ML\\/");
        });
        it("replace special characters 2", () => {
            const result = escapeSpecialChars("¥*+.?{}()[]^$-|/");

            assert(result === "\\¥\\*\\+\\.\\?\\{\\}\\(\\)\\[\\]\\^\\$\\-\\|\\/");
        });
    });

    describe("collectAll", () => {
        it("collect all matching place", () => {
            const str = "今日まで広くC言語は使われてきました。\nしかし、ここに至りC++やC#などが登場し隆盛を極め…";
            const result = collectAll(/(C(\+\+|\#)?)/g, str);

            assert(result.length === 3);

            assert(result[0].length === 3);
            assert(result[0][0] === "C");
            assert(result[0][1] === "C");
            assert(result[0][2] === void 0);
            assert(result[0].index === 6);

            assert(result[1].length === 3);
            assert(result[1][0] === "C++");
            assert(result[1][1] === "C++");
            assert(result[1][2] === "++");
            assert(result[1].index === 29);

            assert(result[2].length === 3);
            assert(result[2][0] === "C#");
            assert(result[2][1] === "C#");
            assert(result[2][2] === "#");
            assert(result[2].index === 33);
        });
    });

    describe("equals", () => {
        it("can test equality", () => {
            assert(equals(/a/, /a/));
            assert(equals(/a/i, /a/i));
            assert(equals(/a/g, /a/g));
            assert(equals(/a/m, /a/m));

            assert(!equals(/a/, /b/));
            assert(!equals(/a/i, /a/));
            assert(!equals(/a/g, /a/));
            assert(!equals(/a/m, /a/));
        });
    });
});
