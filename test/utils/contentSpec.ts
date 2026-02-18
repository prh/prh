import { describe, it, expect } from "vitest";

import { indexToLineColumn } from "../../lib/utils/content";

describe("content", () => {
    describe("indexToLineColumn", () => {
        it("can detect hiragana", () => {
            // line も column も 0 origin
            {
                const result = indexToLineColumn(0, "0123\n56789");
                expect(result.line).toBe(0);
                expect(result.column).toBe(0);
            }
            {
                // 改行はその行の最後の文字という扱い
                const result = indexToLineColumn(4, "0123\n56789");
                expect(result.line).toBe(0);
                expect(result.column).toBe(4);
            }
            {
                const result = indexToLineColumn(5, "0123\n56789\n12345");
                expect(result.line).toBe(1);
                expect(result.column).toBe(0);
            }
            {
                const result = indexToLineColumn(10, "0123\n56789\n12345");
                expect(result.line).toBe(1);
                expect(result.column).toBe(5);
            }
            {
                const result = indexToLineColumn(11, "0123\n56789\n12345");
                expect(result.line).toBe(2);
                expect(result.column).toBe(0);
            }
            {
                const result = indexToLineColumn(15, "0123\n56789\n12345");
                expect(result.line).toBe(2);
                expect(result.column).toBe(4);
            }
            {
                expect(() => {
                    indexToLineColumn(16, "0123\n56789\n12345");
                }).toThrow();
            }
        });
    });
});
