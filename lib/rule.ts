import { spreadAlphaNum, addBoundary, addDefaultFlags, parseRegExpString, escapeSpecialChars, combine, collectAll } from "./utils/regexp";

import { Options } from "./options";
import { RuleSpec } from "./ruleSpec";

import { Diff } from "./changeset/diff";

import * as raw from "./raw";
import { ChangeSet } from "./changeset";

export class Rule {
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
        function checkEmptyPattern(patterns: string | string[] | null | undefined) {
            if (patterns === "") {
                throw new Error("pattern can't be empty");
            }
            Array.isArray(patterns) && patterns.forEach(pattern => {
                if (pattern === "") {
                    throw new Error("patterns can't be empty");
                }
            });
        }
        checkEmptyPattern(rawRule.pattern);
        checkEmptyPattern(rawRule.patterns);

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
        const options = this.options;
        delete this.options;
        this.options = options;

        this.specs = (rawRule.specs || []).map(spec => new RuleSpec(spec));

        this.raw = rawRule;

        this.check();
    }

    /* @internal */
    _patternToRegExp(pattern?: string | string[] | null): RegExp {
        if (pattern === "") {
            throw new Error("pattern can't be empty");
        } else if (pattern == null) {
            let result = spreadAlphaNum(this.expected);
            if (this.options.wordBoundary) {
                result = addBoundary(result);
            }
            return addDefaultFlags(result);
        } else if (typeof pattern === "string") {
            let result = parseRegExpString(pattern);
            if (!result) {
                result = new RegExp(escapeSpecialChars(pattern));
            }
            if (this.options.wordBoundary) {
                result = addBoundary(result);
            }
            return addDefaultFlags(result);
        } else if (pattern instanceof Array) {
            const result = combine(pattern.map(p => this._patternToRegExp(p)));
            return addDefaultFlags(result!);
        } else {
            throw new Error(`unexpected pattern: ${pattern}`);
        }
    }

    /* @internal */
    _shouldIgnore(ignoreRule: raw.IgnoreRule) {
        // NOTE 考え方：--rules-yaml で表示されるpattern or expectedで指定する
        // patternは配列で指定できて、そのうちの1つのパターンが指定された時に
        // そのルール全体が無視されるのか該当の1パターンだけ無視されるのか予想できないため

        if (ignoreRule.pattern != null && this.pattern.toString() === ignoreRule.pattern) {
            return true;
        }
        if (ignoreRule.expected != null && ignoreRule.expected === this.expected) {
            return true;
        }

        return false;
    }

    reset() {
        this.pattern.lastIndex = 0;
    }

    check() {
        this.specs.forEach(spec => {
            const diffs = this.applyRule(spec.from);
            const changeSet = new ChangeSet({ content: spec.from, diffs });
            const result = changeSet.applyChangeSets(spec.from);
            if (spec.to !== result) {
                throw new Error(`${this.expected} spec failed. "${spec.from}", expected "${spec.to}", but got "${result}", ${this.pattern}`);
            }
        });
    }

    applyRule(content: string): Diff[] {
        this.reset();
        const resultList = collectAll(this.pattern, content);
        return resultList
            .map(matches => {
                // JavaScriptでの正規表現では /(?<!記|大)事/ のような書き方ができない
                // /(記|大)事/ で regexpMustEmpty $1 の場合、第一グループが空じゃないとマッチしない、というルールにして回避
                if (this.regexpMustEmpty) {
                    const match = /^\$([0-9]+)$/.exec(this.regexpMustEmpty);
                    if (match == null) {
                        throw new Error(`${this.expected} target failed. please use $1 format.`);
                    }
                    const index = parseInt(match[1], 10);
                    if (matches[index]) {
                        return null;
                    }
                }
                // 検出したものと期待するものが一致している場合無視させる
                if (this.expected === matches[0]) {
                    return null;
                }
                return new Diff({
                    pattern: this.pattern,
                    expected: this.expected,
                    index: matches.index,
                    matches: matches,
                    rule: this,
                });
            })
            .filter(v => !!v) as any as Diff[]; // (Diff | null)[] を Diff[] に変換したい
    }

    toJSON() {
        const alt: any = {};
        for (const key in this) {
            if (key.indexOf("_") === 0) {
                continue;
            }
            const value = (<any>this)[key];
            if (value instanceof RegExp) {
                alt[key] = value.toString();
                continue;
            }
            alt[key] = value;
        }
        return alt;
    }
}
