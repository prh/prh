import { Rule } from "../rule";

export interface DiffParams {
    pattern: RegExp;
    expected?: string; // replaceが必要ないパターンの時渡されない場合がある
    index: number;
    matches: string[];
    rule?: Rule;
}

export class Diff {
    pattern: RegExp;
    expected?: string;
    index: number;
    matches: string[];
    rule?: Rule;

    constructor(params: DiffParams) {
        this.pattern = params.pattern;
        this.expected = params.expected;
        this.index = params.index;
        this.matches = params.matches;
        this.rule = params.rule;
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
