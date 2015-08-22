"use strict";

import * as raw from "./raw";
import Rule from "./rule";

export default class Options {
    wordBoundary: boolean;

    constructor(rule: Rule, src: raw.Options) {
        src = src || {};
        this.wordBoundary = src.wordBoundary != null ? src.wordBoundary : false;
    }
}
