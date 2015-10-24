"use strict";

import Diff from "./diff";

export default class ChangeSet {
    constructor(public diffs: Diff[] = []) {
        this._prepare();
    }

    /* @internal */
    _prepare() {
        this.diffs = this.diffs.sort((a, b) => a.index - b.index);
    }

    concat(other: ChangeSet): ChangeSet {
        this._prepare();
        other._prepare();

        this.diffs = this.diffs.concat(other.diffs);
        return this;
    }

    applyChangeSets(str: string): string {
        this._prepare();

        let delta = 0;
        this.diffs.forEach(data => {
            let result = data.expected.replace(/\$([0-9]{1,2})/g, (match: string, g1: string) => {
                let index = parseInt(g1);
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

    subtract(subtrahend: ChangeSet): ChangeSet {
        this._prepare();
        subtrahend._prepare();

        let result: ChangeSet = new ChangeSet(this.diffs.map(v => v));
        let m = 0;
        let s = 0;

        while (true) {
            let minuendDiff = result.diffs[m];
            let subtrahendDiff = subtrahend.diffs[s];

            if (!minuendDiff || !subtrahendDiff) {
                break;
            }
            if (!minuendDiff.isEncloser(subtrahendDiff) && minuendDiff.isCollide(subtrahendDiff)) {
                result.diffs.splice(m, 1);
                continue;
            }
            if (minuendDiff.isBefore(subtrahendDiff)) {
                m++;
            } else {
                s++;
            }
        }

        return result;
    }

    intersect(audit: ChangeSet): ChangeSet {
        this._prepare();
        audit._prepare();

        let result: ChangeSet = new ChangeSet();
        let a = 0;
        let b = 0;

        while (true) {
            let baseDiff = this.diffs[a];
            let auditDiff = audit.diffs[b];
            if (!baseDiff || !auditDiff) {
                break;
            }
            if (baseDiff.isCollide(auditDiff) && result.diffs.indexOf(baseDiff) === -1) {
                result.diffs.push(baseDiff);
            }
            if (baseDiff.isBefore(auditDiff)) {
                a++;
            } else {
                b++;
            }
        }

        return result;
    }
}
