"use strict";

import * as r from "../utils/regexp";
import Diff from "./diff";
import ChangeSet from "./changeset";

export {ChangeSet};

export function makeChangeSet(content: string, pattern: RegExp, expected: string): ChangeSet {
    "use strict";

    pattern.lastIndex = 0;
    let resultList = r.collectAll(pattern, content);
    let diffs = resultList.map(result => {
        return new Diff(pattern, expected, result.index, <string[]>Array.prototype.slice.call(result));
    });
    return new ChangeSet(diffs);
}
