"use strict";

import Config = require("../lib/config");

describe("Config", () => {
    it("parse raw.Config", () => {
        var config = new Config({
            version: 1,
            rules: [{
                expected: "vvakame"
            }]
        });

        assert(config.version === 1);
        assert(config.rules.length === 1);
        assert(config.rules[0].pattern instanceof RegExp);
    });
});
