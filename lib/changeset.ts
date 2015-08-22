"use strict";

import * as r from "./utils/regexp";
import Rule from "./rule";

export default class ChangeSet {
    pattern: RegExp;
    expected: string;
    index: number;
    matches: string[];
    rule: Rule;

    static makeChangeSet(str: string, pattern: RegExp, expected: string, rule?: Rule): ChangeSet[] {
        pattern.lastIndex = 0;
        var resultList = r.collectAll(pattern, str);
        return resultList.map(result => {
            return new ChangeSet(pattern, expected, result.index, <string[]>Array.prototype.slice.call(result), rule);
        });
    }

    static applyChangeSets(str: string, list: ChangeSet[]): string {
        list = list.sort((a, b) => a.index - b.index);

        var delta = 0;
        list.forEach(data => {
            var result = data.expected.replace(/\$([0-9]{1,2})/g, (match: string, g1: string) => {
                var index = parseInt(g1);
                if (index === 0 || (data.matches.length - 1) < index) {
                    return match;
                }
                return data.matches[index] || "";
            });
            str = str.slice(0, data.index + delta) + result + str.slice(data.index + delta + data.matches[0].length);
            delta += result.length - data.matches[0].length;
        });

        return str;
    }

    static subtract(minuend: ChangeSet[], subtrahend: ChangeSet[]): ChangeSet[] {
        minuend.sort((a, b) => a.index - b.index);
        subtrahend.sort((a, b) => a.index - b.index);

        var m = 0;
        var s = 0;

        while (true) {
            if (minuend[m] == null || subtrahend[s] == null) {
                break;
            }
            if (!minuend[m].isEncloser(subtrahend[s]) && minuend[m].isCollide(subtrahend[s])) {
                minuend.splice(m, 1);
                continue;
            }
            if (minuend[m].isBefore(subtrahend[s])) {
                m++;
            } else {
                s++;
            }
        }

        return minuend;
    }

    static intersect(base: ChangeSet[], audit: ChangeSet[]): ChangeSet[] {
        base.sort((a, b) => a.index - b.index);
        audit.sort((a, b) => a.index - b.index);

        var result: ChangeSet[] = [];
        var a = 0;
        var b = 0;

        while (true) {
            if (base[a] == null || audit[b] == null) {
                break;
            }
            if (base[a].isCollide(audit[b]) && result.indexOf(base[a]) === -1) {
                result.push(base[a]);
            }
            if (base[a].isBefore(audit[b])) {
                a++;
            } else {
                b++;
            }
        }

        return result;
    }

    constructor(pattern: RegExp, expected: string, index: number, matches: string[], rule?: Rule) {
        this.pattern = pattern;
        this.expected = expected;
        this.index = index;
        this.matches = matches;
        this.rule = rule;
    }

    get tailIndex() {
        return this.index + this.matches[0].length;
    }

    isEncloser(other: ChangeSet) {
        return this.index < other.index && other.tailIndex < this.tailIndex;
    }

    isCollide(other: ChangeSet) {
        if (other.index < this.index && this.index < other.tailIndex) {
            return true;
        }
        if (this.index < other.index && other.index < this.tailIndex) {
            return true;
        }
        return false;
    }

    isBefore(other: ChangeSet) {
        return this.index < other.index;
    }
}
