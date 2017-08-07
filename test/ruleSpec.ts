import * as assert from "power-assert";

import { Rule } from "../lib/rule";

describe("Rule", () => {
    it("parse raw.Rule", () => {
        const rule = new Rule({
            expected: "vvakame",
        });

        assert(rule.pattern instanceof RegExp);
    });
    describe("#_patternToRegExp", () => {
        it("filled pattern from null, expected spread to alphabet, number", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: null,
            });

            assert(rule.pattern.source === "[VvＶｖ][VvＶｖ]");
            assert(rule.pattern.global === true);
        });
        it("filled pattern from null, expected spread to alphabet, number with word boundary", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: null,
                options: {
                    wordBoundary: true,
                },
            });

            assert(rule.pattern.source === "\\b[VvＶｖ][VvＶｖ]\\b");
            assert(rule.pattern.global === true);
        });
        it("filled pattern from string (not regexp style)", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: "vv",
            });

            assert(rule.pattern.source === "vv");
            assert(rule.pattern.global === true);
        });
        it("filled pattern from string (not regexp style)", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: "vv",
                options: {
                    wordBoundary: true,
                },
            });

            assert(rule.pattern.source === "\\bvv\\b");
            assert(rule.pattern.global === true);
        });
        it("filled pattern from string (regexp style)", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: "/vv/m",
            });

            assert(rule.pattern.source === "vv");
            assert(rule.pattern.global === true);
            assert(rule.pattern.multiline === true);
        });
        it("filled pattern from string[]", () => {
            const rule = new Rule({
                expected: "vv",
                pattern: [
                    "/vv/",
                    "aa",
                ],
            });

            assert(rule.pattern.source === "(?:vv|aa)");
            assert(rule.pattern.global === true);
        });
        it("filled pattern**s** from string", () => {
            const rule = new Rule({
                expected: "vv",
                patterns: "vv",
            });

            assert(rule.pattern.source === "vv");
            assert(rule.pattern.global === true);
        });
        it("filled pattern**s** from string[]", () => {
            const rule = new Rule({
                expected: "vv",
                patterns: [
                    "/vv/",
                    "aa",
                ],
            });

            assert(rule.pattern.source === "(?:vv|aa)");
            assert(rule.pattern.global === true);
        });
        it("reject empty pattern", () => {
            try {
                new Rule({
                    expected: "vv",
                    pattern: "",
                });
            } catch (e) {
                return;
            }
            assert.fail("spec succeed unexpectedly");
        });
    });
    describe("#applyRule", () => {
        it("can process regexpMustEmpty", () => {
            new Rule({
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
        });
    });
    describe("#check", () => {
        it("succeed spec", () => {
            new Rule({
                expected: "vvakame",
                specs: [{
                    from: "ＶＶＡＫＡＭＥ",
                    to: "vvakame",
                }],
            });
        });
        it("failed spec", () => {
            try {
                new Rule({
                    expected: "vvakame",
                    specs: [{
                        from: "masahiro",
                        to: "vvakame",
                    }],
                });
            } catch (e) {
                return;
            }
            assert.fail("spec succeed unexpectedly");
        });
    });
});
