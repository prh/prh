import { describe, it, expect } from "vitest";

import { Rule } from "../lib/rule";

describe("Rule", () => {
    it("parse raw.Rule", () => {
        const rule = new Rule({
            expected: "vvakame",
        });

        expect(rule.pattern).toBeInstanceOf(RegExp);
    });
    it("parse pattern same as patterns", () => {
        const ruleA = new Rule({
            expected: "vvakame",
            pattern: "/vvakame/i",
        });
        const ruleB = new Rule({
            expected: "vvakame",
            pattern: ["/vvakame/i"],
        });

        expect(ruleA.pattern.flags).toBe(ruleB.pattern.flags);
    });
    describe("#_patternToRegExp", () => {
        it("filled pattern from null, expected spread to alphabet, number", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: null,
            });

            expect(rule.pattern.source).toBe("[VvＶｖ][VvＶｖ]");
            expect(rule.pattern.global).toBe(true);
        });
        it("filled pattern from null, expected spread to alphabet, number with word boundary", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: null,
                options: {
                    wordBoundary: true,
                },
            });

            expect(rule.pattern.source).toBe("\\b[VvＶｖ][VvＶｖ]\\b");
            expect(rule.pattern.global).toBe(true);
        });
        it("filled pattern from string (not regexp style)", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: "vv",
            });

            expect(rule.pattern.source).toBe("vv");
            expect(rule.pattern.global).toBe(true);
        });
        it("filled pattern from string (not regexp style)", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: "vv",
                options: {
                    wordBoundary: true,
                },
            });

            expect(rule.pattern.source).toBe("\\bvv\\b");
            expect(rule.pattern.global).toBe(true);
        });

        it("filled pattern from string[], string with word boundary", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: ["VV", "AA"],
                options: {
                    wordBoundary: true,
                },
            });

            expect(rule.pattern.source).toBe("(?:\\bVV\\b|\\bAA\\b)");
            expect(rule.pattern.flags).toBe("gmu");
            expect(rule.pattern.global).toBe(true);
        });
        it("filled pattern from string[] (regexp style), string with word boundary", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: ["/VV/i", "/AA/i"],
                options: {
                    wordBoundary: true,
                },
            });

            expect(rule.pattern.source).toBe("(?:\\bVV\\b|\\bAA\\b)");
            expect(rule.pattern.flags).toBe("gimu");
            expect(rule.pattern.global).toBe(true);
        });
        it("filled pattern from string (regexp style)", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: "/vv/m",
            });

            expect(rule.pattern.source).toBe("vv");
            expect(rule.pattern.global).toBe(true);
            expect(rule.pattern.multiline).toBe(true);
        });
        it("filled pattern from string[]", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: ["/vv/", "aa"],
            });

            expect(rule.pattern.source).toBe("(?:vv|aa)");
            expect(rule.pattern.global).toBe(true);
        });
        it("filled pattern**s** from string", () => {
            const rule = new Rule({
                expected: "vv",
                patterns: "vv",
            });

            expect(rule.pattern.source).toBe("vv");
            expect(rule.pattern.global).toBe(true);
        });
        it("filled pattern**s** from string[]", () => {
            const rule = new Rule({
                expected: "vv",
                patterns: ["/vv/", "aa"],
            });

            expect(rule.pattern.source).toBe("(?:vv|aa)");
            expect(rule.pattern.global).toBe(true);
        });
        it("reject empty pattern", () => {
            expect(() => {
                new Rule({
                    expected: "vv",
                    pattern: "",
                });
            }).toThrow();
        });
    });
    describe("#_shouldIgnore", () => {
        it("ignore expected only pattern", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: null,
            });

            expect(rule._shouldIgnore({ expected: "vv" })).toBe(true);
        });
        it("ignore expected only pattern", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: "vv",
            });

            expect(rule._shouldIgnore({ pattern: "/vv/gmu" })).toBe(true);
        });
    });
    describe("#applyRule", () => {
        it("can process regexpMustEmpty", () => {
            const rule = new Rule({
                expected: "レイヤ",
                pattern: "/(プ)?レイヤー/",
                regexpMustEmpty: "$1",
                specs: [
                    {
                        from: "レイヤー",
                        to: "レイヤ",
                    },
                    {
                        from: "プレイヤー",
                        to: "プレイヤー",
                    },
                ],
            });
            const diffs = rule.applyRule("レイヤーとプレイヤー");
            expect(diffs.length).toBe(1);
            expect(diffs[0].expected).toBe("レイヤ");
        });
        it("supports native negative lookbehind", () => {
            const rule = new Rule({
                expected: "レイヤ",
                pattern: "/(?<!プ)レイヤー/",
                specs: [
                    {
                        from: "レイヤー",
                        to: "レイヤ",
                    },
                    {
                        from: "プレイヤー",
                        to: "プレイヤー",
                    },
                ],
            });
            const diffs = rule.applyRule("レイヤーとプレイヤー");
            expect(diffs.length).toBe(1);
            expect(diffs[0].expected).toBe("レイヤ");
        });
        it("native negative lookbehind and regexpMustEmpty produce the same diffs", () => {
            const content = "広義のソフトウエア と 日経ソフトウエア と ソフトウエア";
            const specs = [
                {
                    from: "広義のソフトウエア",
                    to: "広義のソフトウェア",
                },
                {
                    from: "日経ソフトウエア",
                    to: "日経ソフトウエア",
                },
            ];
            const regexpMustEmptyRule = new Rule({
                expected: "ソフトウェア",
                pattern: "/(日経)?ソフトウエア/",
                regexpMustEmpty: "$1",
                specs,
            });
            const lookbehindRule = new Rule({
                expected: "ソフトウェア",
                pattern: "/(?<!日経)ソフトウエア/",
                specs,
            });
            const viaMustEmpty = regexpMustEmptyRule.applyRule(content);
            const viaLookbehind = lookbehindRule.applyRule(content);
            expect(viaLookbehind.map((d) => d.matches[0])).toEqual(viaMustEmpty.map((d) => d.matches[0]));
            expect(viaLookbehind.map((d) => d.index)).toEqual(viaMustEmpty.map((d) => d.index));
        });
        it("throws when regexpMustEmpty is not in $1 format", () => {
            expect(
                () =>
                    new Rule({
                        expected: "こと",
                        pattern: "/(記)?事/",
                        regexpMustEmpty: "1",
                        specs: [
                            {
                                from: "その事",
                                to: "そのこと",
                            },
                        ],
                    }),
            ).toThrow(/\$1 format/);
        });
        it("applies regexpMustEmpty to the referenced capture group", () => {
            const rule = new Rule({
                expected: "こと",
                pattern: "/(大|記)?(出来)?事/",
                regexpMustEmpty: "$2",
                specs: [
                    {
                        from: "その事",
                        to: "そのこと",
                    },
                    {
                        from: "記事",
                        to: "こと",
                    },
                    {
                        from: "大事",
                        to: "こと",
                    },
                    {
                        from: "出来事",
                        to: "出来事",
                    },
                ],
            });
            const diffs = rule.applyRule("その事 記事 大事 出来事");
            expect(diffs.map((d) => d.matches[0])).toEqual(["事", "記事", "大事"]);
        });
        it("treats a plain string pattern as a literal, not a regex", () => {
            const rule = new Rule({
                expected: "ソフトウェア",
                pattern: "(?<!日経)ソフトウエア",
            });
            // スラッシュなしの素の文字列はそのままエスケープされ、その文字列自体にのみマッチする
            const diffs = rule.applyRule("広義のソフトウエア と (?<!日経)ソフトウエア");
            expect(diffs.length).toBe(1);
            expect(diffs[0].matches[0]).toBe("(?<!日経)ソフトウエア");
        });
        it("supports native negative lookbehind in a patterns array", () => {
            const rule = new Rule({
                expected: "こと",
                patterns: ["/(?<!記|大|出来|悪)事(?!件)/", "/事(?=案件)/"],
                specs: [
                    {
                        from: "その事",
                        to: "そのこと",
                    },
                    {
                        from: "記事",
                        to: "記事",
                    },
                    {
                        from: "出来事",
                        to: "出来事",
                    },
                    {
                        from: "事件",
                        to: "事件",
                    },
                ],
            });
            const diffs = rule.applyRule("その事 記事 出来事 事件 事案件");
            expect(diffs.map((d) => d.matches[0])).toEqual(["事", "事"]);
        });
        it("returns no diffs when expected equals matched text", () => {
            const rule = new Rule({
                expected: "Web",
            });
            const diffs = rule.applyRule("ここでWebです");
            expect(diffs.length).toBe(0);
        });
    });
    describe("#check", () => {
        it("succeed spec", () => {
            new Rule({
                expected: "vvakame",
                specs: [
                    {
                        from: "ＶＶＡＫＡＭＥ",
                        to: "vvakame",
                    },
                ],
            });
        });
        it("failed spec", () => {
            expect(() => {
                new Rule({
                    expected: "vvakame",
                    specs: [
                        {
                            from: "masahiro",
                            to: "vvakame",
                        },
                    ],
                });
            }).toThrow();
        });
    });
});
