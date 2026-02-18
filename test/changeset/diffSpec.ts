import { describe, it, expect } from "vitest";

import { Diff } from "../../lib/changeset/diff";

describe("Diff", () => {
    describe(".newText", () => {
        it("hold new text", () => {
            const pattern = /(?:以下|下記)(の|に)/;
            const expected = "次$1";
            const base = "つきまして以下の記述では";

            const matches = pattern.exec(base)!;
            const diff = new Diff({ pattern, expected, index: matches.index, matches });
            expect(diff.newText).toBe("次の");
        });
    });
});
