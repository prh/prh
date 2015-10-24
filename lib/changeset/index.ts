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
