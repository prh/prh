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
        it("can process regexpMustEmpty", () => {
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
