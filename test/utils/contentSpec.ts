import * as assert from "power-assert";

import { indexToLineColumn } from "../../lib/utils/content";

describe("content", () => {
    describe("indexToLineColumn", () => {
        it("can detect hiragana", () => {
            // line も column も 0 origin
            {
                const result = indexToLineColumn(0, "0123\n56789");
                assert(result.line === 0);
                assert(result.column === 0);
            }
            { // 改行はその行の最後の文字という扱い
                const result = indexToLineColumn(4, "0123\n56789");
                assert(result.line === 0);
                assert(result.column === 4);
            }
            {
                const result = indexToLineColumn(5, "0123\n56789\n12345");
                assert(result.line === 1);
                assert(result.column === 0);
            }
            {
                const result = indexToLineColumn(10, "0123\n56789\n12345");
                assert(result.line === 1);
                assert(result.column === 5);
            }
            {
                const result = indexToLineColumn(11, "0123\n56789\n12345");
                assert(result.line === 2);
                assert(result.column === 0);
            }
            {
                const result = indexToLineColumn(15, "0123\n56789\n12345");
                assert(result.line === 2);
                assert(result.column === 4);
            }
            {
                let raiseException = false;
                try {
                    indexToLineColumn(16, "0123\n56789\n12345");
                } catch (e) {
                    raiseException = true;
                }
                assert(raiseException);
            }
        });
    });
});
