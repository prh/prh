"use strict";

import Rule = require("./rule");

import raw = require("./raw");

class Options {
    wordBoundary: boolean;

    constructor(rule: Rule, src: raw.Options) {
        src = src || {};
        this.wordBoundary = src.wordBoundary != null ? src.wordBoundary : false;
    }
}

export = Options;
