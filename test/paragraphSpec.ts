import * as assert from "assert";

import { Paragraph } from "../lib/paragraph";
import { Rule } from "../lib/rule";

describe("Paragraph", () => {
    describe(".makeDiffs", () => {
        it("can make diffs with ignore patterns", () => {
            {
                const base = "// prh:disable:web\nwebmasterやjquery";
                const p = new Paragraph(10, base);
                const diffs = p.makeDiffs([
                    new Rule({
                        expected: "Web",
                    }),
                    new Rule({
                        expected: "jQuery",
                    }),
                ]);

                assert(diffs.length === 1);
                assert(diffs[0].expected === "jQuery");
                assert(diffs[0].index === 10 + "// prh:disable:web\nwebmasterや".length);
            }
            {
                const base = "// prh:disable\nwebmasterやjquery";
                const p = new Paragraph(10, base);
                const diffs = p.makeDiffs([
                    new Rule({
                        expected: "Web",
                    }),
                    new Rule({
                        expected: "jQuery",
                    }),
                ]);

                assert(diffs.length === 0);
            }
            {
                const base = "// prh:disable:abc\n";
                const p = new Paragraph(10, base);
                const diffs = p.makeDiffs([
                    new Rule({
                        expected: "b",
                    }),
                ]);

                assert(diffs.length === 0);
            }
            {
                const base = "// prh:disable:A\nABC\n// prh:disable:C";
                const p = new Paragraph(10, base);
                const diffs = p.makeDiffs([
                    new Rule({
                        expected: "a",
                    }),
                    new Rule({
                        expected: "b",
                    }),
                    new Rule({
                        expected: "c",
                    }),
                ]);

                assert(diffs.length === 1);
                assert(diffs[0].expected === "b");
            }
        });
    });
});
