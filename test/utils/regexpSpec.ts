import { describe, it, expect } from "vitest";

import {
    jpHira,
    jpKana,
    jpKanji,
    jpChar,
    concat,
    combine,
    equals,
    addBoundary,
    parseRegExpString,
    spreadAlphaNum,
    addDefaultFlags,
    escapeSpecialChars,
    collectAll,
    supportRegExpUnicodeFlag,
} from "../../lib/utils/regexp";

describe("regexp", () => {
    describe("jpHira", () => {
        it("can detect hiragana", () => {
            expect(jpHira.test("a")).toBe(false);
            expect(jpHira.test("あ")).toBe(true);
            expect(jpHira.test("ア")).toBe(false);
            expect(jpHira.test("神")).toBe(false);
        });
    });

    describe("jpKana", () => {
        it("can detect katakana", () => {
            expect(jpKana.test("a")).toBe(false);
            expect(jpKana.test("あ")).toBe(false);
            expect(jpKana.test("ア")).toBe(true);
            expect(jpKana.test("神")).toBe(false);
        });
    });

    describe("jpKanji", () => {
        it("can detect kanji", () => {
            expect(jpKanji.test("a")).toBe(false);
            expect(jpKanji.test("あ")).toBe(false);
            expect(jpKanji.test("ア")).toBe(false);
            expect(jpKanji.test("神")).toBe(true);
        });
    });

    describe("jpChar", () => {
        it("can detect japanese character", () => {
            expect(jpChar.test("a")).toBe(false);
            expect(jpChar.test("あ")).toBe(true);
            expect(jpChar.test("ア")).toBe(true);
            expect(jpChar.test("神")).toBe(true);
        });
    });

    describe("concat", () => {
        it("concat string:string", () => {
            const regexp = concat(["Hello", "TypeScript"]);
            expect(regexp.source).toBe("HelloTypeScript");

            expect(regexp.test("HelloTypeScript")).toBe(true);
        });
        it("concat string:regexp", () => {
            const regexp = concat(["Hello", /TypeScript/]);
            expect(regexp.source).toBe("HelloTypeScript");

            expect(regexp.test("HelloTypeScript")).toBe(true);
        });
        it("concat regexp:string", () => {
            const regexp = concat([/Hello/, "TypeScript"]);
            expect(regexp.source).toBe("HelloTypeScript");

            expect(regexp.test("HelloTypeScript")).toBe(true);
        });
        it("concat regexp:regexp", () => {
            const regexp = concat([/Hello/, /TypeScript/]);
            expect(regexp.source).toBe("HelloTypeScript");

            expect(regexp.test("HelloTypeScript")).toBe(true);
        });
        it("concat regexp flags", () => {
            const regexp = concat([/Hello/im, /TypeScript/im]);
            expect(regexp.source).toBe("HelloTypeScript");
            expect(regexp.flags).toBe("im");

            expect(regexp.test("HelloTypeScript")).toBe(true);
        });
        it("can't concat different regexp flags", () => {
            expect(() => {
                concat([/Hello/g, /TypeScript/im]);
            }).toThrow(`combining different flags g and im.
The pattern /TypeScript/im has different flag with other patterns.`);
        });
    });

    describe("combine", () => {
        it("combine string:string", () => {
            const regexp = combine(["Hello", "TypeScript"]);
            expect(regexp.source).toBe("(?:Hello|TypeScript)");

            expect(regexp.test("Hello")).toBe(true);
            expect(regexp.test("TypeScript")).toBe(true);
        });
        it("combine string:regexp", () => {
            const regexp = combine(["Hello", /TypeScript/]);
            expect(regexp.source).toBe("(?:Hello|TypeScript)");

            expect(regexp.test("Hello")).toBe(true);
            expect(regexp.test("TypeScript")).toBe(true);
        });
        it("combine regexp:string", () => {
            const regexp = combine([/Hello/, "TypeScript"]);
            expect(regexp.source).toBe("(?:Hello|TypeScript)");

            expect(regexp.test("Hello")).toBe(true);
            expect(regexp.test("TypeScript")).toBe(true);
        });
        it("combine regexp:regexp", () => {
            const regexp = combine([/Hello/, /TypeScript/]);
            expect(regexp.source).toBe("(?:Hello|TypeScript)");

            expect(regexp.test("Hello")).toBe(true);
            expect(regexp.test("TypeScript")).toBe(true);
        });
        it("combine regexp flags", () => {
            const regexp = combine([/Hello/im, /TypeScript/im]);
            expect(regexp.source).toBe("(?:Hello|TypeScript)");
            expect(regexp.flags).toBe("im");

            expect(regexp.test("hello")).toBe(true);
            expect(regexp.test("typescript")).toBe(true);
        });
        it("can't combine different regexp flags", () => {
            expect(() => {
                combine([/Hello/g, /TypeScript/im]);
            }).toThrow(`combining different flags g and im.
The pattern /TypeScript/im has different flag with other patterns.`);
        });
    });

    describe("addBoundary", () => {
        it("addBoundary to string", () => {
            const regexp = addBoundary("Hello");
            expect(regexp.source).toBe("\\bHello\\b");

            expect(regexp.test("Hello")).toBe(true);
        });
        it("addBoundary to regexp", () => {
            const regexp = addBoundary(/Hello/);
            expect(regexp.source).toBe("\\bHello\\b");

            expect(regexp.test("Hello")).toBe(true);
        });
        it("detect word boundary by alphabet", () => {
            const regexp = addBoundary(/js/);

            expect(regexp.test("js")).toBe(true);
            expect(regexp.test("A js B")).toBe(true);
            expect(regexp.test("A altjs B")).toBe(false);
            expect(regexp.test("A jsdoit B")).toBe(false);
        });
    });

    describe("parseRegExpString", () => {
        it("parse regexp style string", () => {
            const regexp = parseRegExpString("/[3-9]th/ig");
            expect(regexp).toBeTruthy();

            expect(regexp!.source).toBe("[3-9]th");
            expect(regexp!.ignoreCase).toBe(true);
            expect(regexp!.global).toBe(true);
            expect(regexp!.multiline).toBe(false);
        });
        it("can't parse non-regexp style string", () => {
            const regexp = parseRegExpString("Hi!");

            expect(regexp).toBeNull();
        });
    });

    describe("spreadAlphaNum", () => {
        it("spread alphabet & number to widely", () => {
            const regexp = spreadAlphaNum("abcdefghijklmnopqrstuvwxyz0123456789");

            expect(regexp.source).toBe(
                "[AaＡａ][BbＢｂ][CcＣｃ][DdＤｄ][EeＥｅ][FfＦｆ][GgＧｇ][HhＨｈ][IiＩｉ][JjＪｊ][KkＫｋ][LlＬｌ][MmＭｍ][NnＮｎ][OoＯｏ][PpＰｐ][QqＱｑ][RrＲｒ][SsＳｓ][TtＴｔ][UuＵｕ][VvＶｖ][WwＷｗ][XxＸｘ][YyＹｙ][ZzＺｚ][0０][1１][2２][3３][4４][5５][6６][7７][8８][9９]",
            );
        });
        it("match widely expression", () => {
            const regexp = spreadAlphaNum("web");

            expect(regexp.test("Web")).toBe(true);
            expect(regexp.test("web")).toBe(true);
            expect(regexp.test("WEB")).toBe(true);
            expect(regexp.test("Ｗｅｂ")).toBe(true);
            expect(regexp.test("ｗｅｂ")).toBe(true);
            expect(regexp.test("ＷＥＢ")).toBe(true);

            expect(regexp.test("foo")).toBe(false);
        });
    });

    describe("addDefaultFlags", () => {
        it("add g, u & m flags", () => {
            const regexp = addDefaultFlags(/hello/);

            expect(regexp.source).toBe("hello");
            expect(regexp.global).toBe(true);
            expect(regexp.ignoreCase).toBe(false);
            expect(regexp.multiline).toBe(true);
            if (supportRegExpUnicodeFlag) {
                expect(regexp.unicode).toBe(true);
            } else {
                expect(regexp.unicode).toBeUndefined();
            }
        });
        it("add g flags and keep i flag", () => {
            const regexp = addDefaultFlags(/hello/i);

            expect(regexp.source).toBe("hello");
            expect(regexp.global).toBe(true);
            expect(regexp.ignoreCase).toBe(true);
            expect(regexp.multiline).toBe(true);
            if (supportRegExpUnicodeFlag) {
                expect(regexp.unicode).toBe(true);
            } else {
                expect(regexp.unicode).toBeUndefined();
            }
        });
    });

    describe("escapeSpecialChars", () => {
        it("replace special characters 1", () => {
            const result = escapeSpecialChars("/(?!S)ML/");

            expect(result).toBe("\\/\\(\\?!S\\)ML\\/");
        });
        it("replace special characters 2", () => {
            const result = escapeSpecialChars("¥*+.?{}()[]^$-|/");

            expect(result).toBe("\\¥\\*\\+\\.\\?\\{\\}\\(\\)\\[\\]\\^\\$\\-\\|\\/");
        });
    });

    describe("collectAll", () => {
        it("collect all matching place", () => {
            const str = "今日まで広くC言語は使われてきました。\nしかし、ここに至りC++やC#などが登場し隆盛を極め…";
            const result = collectAll(/(C(\+\+|#)?)/g, str);

            expect(result.length).toBe(3);

            expect(result[0].length).toBe(3);
            expect(result[0][0]).toBe("C");
            expect(result[0][1]).toBe("C");
            expect(result[0][2]).toBeUndefined();
            expect(result[0].index).toBe(6);

            expect(result[1].length).toBe(3);
            expect(result[1][0]).toBe("C++");
            expect(result[1][1]).toBe("C++");
            expect(result[1][2]).toBe("++");
            expect(result[1].index).toBe(29);

            expect(result[2].length).toBe(3);
            expect(result[2][0]).toBe("C#");
            expect(result[2][1]).toBe("C#");
            expect(result[2][2]).toBe("#");
            expect(result[2].index).toBe(33);
        });
    });

    describe("equals", () => {
        it("can test equality", () => {
            expect(equals(/a/, /a/)).toBe(true);
            expect(equals(/a/i, /a/i)).toBe(true);
            expect(equals(/a/g, /a/g)).toBe(true);
            expect(equals(/a/m, /a/m)).toBe(true);

            expect(equals(/a/, /b/)).toBe(false);
            expect(equals(/a/i, /a/)).toBe(false);
            expect(equals(/a/g, /a/)).toBe(false);
            expect(equals(/a/m, /a/)).toBe(false);
        });
    });
});
