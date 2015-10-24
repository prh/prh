"use strict";

import * as r from "../utils/regexp";
import Rule from "../rule";
import Diff from "./diff";
import ChangeSet from "./changeset";

export {ChangeSet};

export function makeChangeSet(str: string, pattern: RegExp, expected: string, rule?: Rule): ChangeSet {
    "use strict";

    pattern.lastIndex = 0;
    let resultList = r.collectAll(pattern, str);
    let diffs = resultList.map(result => {
        return new Diff(pattern, expected, result.index, <string[]>Array.prototype.slice.call(result), rule);
    });
    return new ChangeSet(diffs);
}

export function applyChangeSets(str: string, changeSet: ChangeSet): string {
    "use strict";

    let list = changeSet.diffs;
    list = list.sort((a, b) => a.index - b.index);

    let delta = 0;
    list.forEach(data => {
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

export function subtract(minuend: ChangeSet, subtrahend: ChangeSet): ChangeSet {
    "use strict";

    minuend.diffs.sort((a, b) => a.index - b.index);
    subtrahend.diffs.sort((a, b) => a.index - b.index);

    let m = 0;
    let s = 0;

    while (true) {
        if (minuend.diffs[m] == null || subtrahend.diffs[s] == null) {
            break;
        }
        if (!minuend.diffs[m].isEncloser(subtrahend.diffs[s]) && minuend.diffs[m].isCollide(subtrahend.diffs[s])) {
            minuend.diffs.splice(m, 1);
            continue;
        }
        if (minuend.diffs[m].isBefore(subtrahend.diffs[s])) {
            m++;
        } else {
            s++;
        }
    }

    return minuend;
}

export function intersect(base: ChangeSet, audit: ChangeSet): ChangeSet {
    "use strict";

    base.diffs.sort((a, b) => a.index - b.index);
    audit.diffs.sort((a, b) => a.index - b.index);

    let result: ChangeSet = new ChangeSet();
    let a = 0;
    let b = 0;

    while (true) {
        if (base.diffs[a] == null || audit.diffs[b] == null) {
            break;
        }
        if (base.diffs[a].isCollide(audit.diffs[b]) && result.diffs.indexOf(base.diffs[a]) === -1) {
            result.diffs.push(base.diffs[a]);
        }
        if (base.diffs[a].isBefore(audit.diffs[b])) {
            a++;
        } else {
            b++;
        }
    }

    return result;
}
