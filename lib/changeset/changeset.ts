"use strict";

import Diff from "./diff";

export default class ChangeSet {
    constructor(public diffs: Diff[] = []) {
    }

    concat(other: ChangeSet): ChangeSet {
        this.diffs = this.diffs.concat(other.diffs);
        return this;
    }
}
