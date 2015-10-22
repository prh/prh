"use strict";

import Engine from "../lib/engine";

describe("Engine", () => {
    it("parse raw.Config", () => {
        let engine = new Engine({
            version: 1,
            rules: [{
                expected: "vvakame"
            }]
        });

        assert(engine.version === 1);
        assert(engine.rules.length === 1);
        assert(engine.rules[0].pattern instanceof RegExp);
    });
});
