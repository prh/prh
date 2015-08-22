"use strict";

import r = require("./utils/regexp");

import Options = require("./options");
import RuleSpec = require("./rulespec");

import raw = require("./raw");

class Rule {
    expected: string;
    pattern: RegExp;
    options: Options;
    specs: RuleSpec[];

    constructor(src: raw.Rule) {
        if (!src) {
            throw new Error("src is requried");
        }
        if (typeof src === "string") {
            src = {
                expected: <any>src
            };
        }
        this.options = new Options(this, src.options);

        this.expected = src.expected;
        if (this.expected == null) {
            throw new Error("expected is required");
        }

        this.pattern = this._patternToRegExp(src.pattern);
        if (this.pattern == null) {
            throw new Error("pattern is required");
        }

        // for JSON order
        var options = this.options;
        delete this.options;
        this.options = options;

        this.specs = (src.specs || []).map(spec => new RuleSpec(spec));

        this.check();
    }

    _patternToRegExp(pattern: any): RegExp {
        var result: RegExp;
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
                result = new RegExp(r.excapeSpecialChars(pattern));
            }
            return r.addDefaultFlags(result);
        }
        if (pattern instanceof Array) {
            result = r.combine.apply(null, pattern.map((p: any) => this._patternToRegExp(p)));
            return r.addDefaultFlags(result);
        }
        return result;
    }

    reset() {
        this.pattern.lastIndex = 0;
    }

    check() {
        this.specs.forEach(spec => {
            var result = spec.from.replace(this.pattern, this.expected);
            if (spec.to !== result) {
                throw new Error(this.expected + " spec failed. \"" + spec.from + "\", expected \"" + spec.to + "\", but got \"" + result + "\", " + this.pattern);
            }
        });
    }

    toJSON() {
        var alt: any = {};
        for (var key in this) {
            if (key.indexOf("_") === 0) {
                continue;
            }
            var value = (<any>this)[key];
            if (value instanceof RegExp) {
                alt[key] = value.toString();
                continue;
            }
            alt[key] = value;
        }
        return alt;
    }
}

export = Rule;
