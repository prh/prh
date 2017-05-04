import * as r from "./utils/regexp";

import Options from "./options";
import RuleSpec from "./ruleSpec";

import Diff from "./changeset/diff";
import ChangeSet from "./changeset/changeset";

import * as raw from "./raw";

export default class Rule {
    expected: string;
    pattern: RegExp;
    regexpMustEmpty: string | undefined;
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
                expected: src,
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

        this.regexpMustEmpty = rawRule.regexpMustEmpty;

        // for JSON order
        let options = this.options;
        delete this.options;
        this.options = options;

        this.specs = (rawRule.specs || []).map(spec => new RuleSpec(spec));

        this.raw = rawRule;

        this.check();
    }

    /* @internal */
    _patternToRegExp(pattern?: string | string[] | null): RegExp {
        if (pattern == null) {
            let result = r.spreadAlphaNum(this.expected);
            if (this.options.wordBoundary) {
                result = r.addBoundary(result);
            }
            return r.addDefaultFlags(result);
        } else if (typeof pattern === "string") {
            let result = r.parseRegExpString(pattern);
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
            let result = r.combine.apply(null, pattern.map(p => this._patternToRegExp(p)));
            return r.addDefaultFlags(result!);
        } else {
            throw new Error("unexpected pattern: ${pattern}");
        }
    }

    reset() {
        this.pattern.lastIndex = 0;
    }

    check() {
        this.specs.forEach(spec => {
            let result = this.applyRule(spec.from).applyChangeSets(spec.from);
            if (spec.to !== result) {
                throw new Error(`${this.expected} spec failed. "${spec.from}", expected "${spec.to}", but got "${result}", ${this.pattern}`);
            }
        });
    }

    applyRule(content: string): ChangeSet {
        this.reset();
        let resultList = r.collectAll(this.pattern, content);
        let diffs = resultList
            .map(result => {
                // JavaScriptでの正規表現では /(?<!記|大)事/ のような書き方ができない
                // /(記|大)事/ で regexpMustEmpty $1 の場合、第一グループが空じゃないとマッチしない、というルールにして回避
                if (this.regexpMustEmpty) {
                    let match = /^\$([0-9]+)$/.exec(this.regexpMustEmpty);
                    if (match == null) {
                        throw new Error(`${this.expected} target failed. please use $1 format.`);
                    }
                    let index = parseInt(match[1], 10);
                    if (result[index]) {
                        return null;
                    }
                }
                return new Diff(this.pattern, this.expected, result.index, <string[]>Array.prototype.slice.call(result), this);
            })
            .filter(v => !!v) as any as Diff[]; // (Diff | null)[] を Diff[] に変換したい
        return new ChangeSet(diffs);
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
