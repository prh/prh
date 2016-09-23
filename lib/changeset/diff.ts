import Rule from "../rule";

export default class Diff {
    pattern: RegExp;
    expected: string;
    index: number;
    matches: string[];
    rule?: Rule;

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

    isEncloser(other: Diff) {
        return this.index < other.index && other.tailIndex < this.tailIndex;
    }

    isCollide(other: Diff) {
        if (other.index < this.index && this.index < other.tailIndex) {
            return true;
        }
        if (this.index < other.index && other.index < this.tailIndex) {
            return true;
        }
        return false;
    }

    isBefore(other: Diff) {
        return this.index < other.index;
    }
}
