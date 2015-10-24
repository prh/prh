"use strict";

import * as r from "./utils/regexp";

import Options from "./options";
import RuleSpec from "./ruleSpec";

import * as raw from "./raw";

export default class Rule {
    expected: string;
    pattern: RegExp;
    options: Options;
    specs: RuleSpec[];
    raw: any /* raw.Rule */;

    constructor(src: string | raw.Rule) {
        if (!src) {
            throw new Error("src is requried");
        }
        let rawRule: raw.Rule;
        if (typeof src === "string") {
            rawRule = {
                expected: src
            };
        } else {
            rawRule = src;
        }
        this.options = new Options(this, rawRule.options);

        this.expected = rawRule.expected;
        if (this.expected == null) {
            throw new Error("expected is required");
        }

        this.pattern = this._patternToRegExp(rawRule.pattern || rawRule.patterns);
        if (this.pattern == null) {
            throw new Error("pattern is required");
        }

        // for JSON order
        let options = this.options;
        delete this.options;
        this.options = options;

        this.specs = (rawRule.specs || []).map(spec => new RuleSpec(spec));

        this.raw = rawRule;

        this.check();
    }

    /* @internal */
    _patternToRegExp(pattern: string | string[]): RegExp {
        let result: RegExp;
        if (pattern == null) {
            result = r.spreadAlphaNum(this.expected);
            if (this.options.wordBoundary) {
                result = r.addBoundary(result);
            }
            return r.addDefaultFlags(result);
        }
        if (typeof pattern === "string") {
            result = r.parseRegExpString(pattern);
            if (result) {
                return r.addDefaultFlags(result);
            }
            if (this.options.wordBoundary) {
                result = r.addBoundary(pattern);
            } else {
                result = new RegExp(r.escapeSpecialChars(pattern));
            }
            return r.addDefaultFlags(result);
        } else if (pattern instanceof Array) {
            result = r.combine.apply(null, pattern.map(p => this._patternToRegExp(p)));
            return r.addDefaultFlags(result);
        }
        return result;
    }

    reset() {
        this.pattern.lastIndex = 0;
    }

    check() {
        this.specs.forEach(spec => {
            let result = spec.from.replace(this.pattern, this.expected);
            if (spec.to !== result) {
                throw new Error(this.expected + " spec failed. \"" + spec.from + "\", expected \"" + spec.to + "\", but got \"" + result + "\", " + this.pattern);
            }
        });
    }

    toJSON() {
        let alt: any = {};
        for (let key in this) {
            if (key.indexOf("_") === 0) {
                continue;
            }
            let value = (<any>this)[key];
            if (value instanceof RegExp) {
                alt[key] = value.toString();
                continue;
            }
            alt[key] = value;
        }
        return alt;
    }
}
