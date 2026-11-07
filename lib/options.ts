import * as raw from "./raw.js";
import { Rule } from "./rule.js";

export class Options {
    wordBoundary: boolean;

    constructor(_rule: Rule, src?: raw.Options) {
        src = src || {};
        this.wordBoundary = src.wordBoundary != null ? src.wordBoundary : false;
    }
}
