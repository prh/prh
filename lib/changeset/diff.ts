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

    /**
     * Diffの結果を元の文章に反映する
     * @param content 置き換えたいコンテンツ
     * @param delta diffの処理対象の地点がいくつズレているか 複数diffを順次適用する場合に必要
     */
    apply(content: string, delta = 0): { replaced: string; newDelta: number; } | null {
        if (this.expected == null) {
            return null;
        }
        const result = this.expected.replace(/\$([0-9]{1,2})/g, (match: string, g1: string) => {
            const index = parseInt(g1, 10);
            if (index === 0 || (this.matches.length - 1) < index) {
                return match;
            }
            return this.matches[index] || "";
        });
        content = content.slice(0, this.index + delta) + result + content.slice(this.index + delta + this.matches[0].length);
        delta += result.length - this.matches[0].length;

        return {
            replaced: content,
            newDelta: delta,
        };
    }

    isEncloser(other: { index: number; tailIndex: number; }) {
        return this.index < other.index && other.tailIndex < this.tailIndex;
    }

    isCollide(other: { index: number; tailIndex: number; }) {
        if (other.index < this.index && this.index < other.tailIndex) {
            return true;
        }
        if (this.index < other.index && other.index < this.tailIndex) {
            return true;
        }
        return false;
    }

    isBefore(other: { index: number; }) {
        return this.index < other.index;
    }

    toJSON() {
        const result: any = {};
        Object.keys(this).forEach(key => {
            const value = (this as any)[key];
            if (value instanceof RegExp) {
                result[key] = `/${value.source}/${value.flags}`;
            } else {
                result[key] = value;
            }
        });
        return result;
    }
}
