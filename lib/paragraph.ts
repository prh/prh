import { Rule } from "./rule";
import { Diff } from "./changeset/diff";

// 設計思想
// 文章の1ブロック毎にデータを保持する
// ファイル全体→Paragraphに分割→Paragraph毎にChangeSetを作成→ChangeSetをmerge
// Paragraphでは特定の検出を無効化したい場合がある
//   例えばてくぶ標準だと 良い→よい と変換するが漢字をわざと使いたい場合がある

export class Paragraph {
    index: number;
    content: string;
    ignoreAll: boolean;
    /* @internal */
    _pragmaRanges: { index: number; tailIndex: number }[];
    ignorePatterns: RegExp[];

    constructor(index: number, content: string) {
        this.index = index;
        this.content = content;
        this.ignoreAll = false;

        // prh:disable:良い|悪い みたいなパターンからチェックをパスさせる表現を作る
        // prh:disable だけの場合は全部パスさせる
        const re = /^(?:.*?)prh:disable(?::([^\n\s]*))?/gm;
        this._pragmaRanges = [];
        this.ignorePatterns = [];
        while (true) {
            const matches = re.exec(content);
            if (!matches) {
                break;
            }
            // : の後の有無
            if (!matches[1]) {
                this.ignoreAll = true;
                continue;
            }

            const pattern = matches[1];
            this._pragmaRanges.push({ index: matches.index, tailIndex: matches.index + matches[0].length });
            this.ignorePatterns.push(new RegExp(`(${pattern})`, "g"));
        }
    }

    makeDiffs(rules: Rule[]): Diff[] {
        let diffs = rules.map((rule) => rule.applyRule(this.content)).reduce((p, c) => p.concat(c), []);
        // pragmaに被る範囲の検出は無視する
        diffs = diffs.filter((diff) => this._pragmaRanges.every((range) => !diff.isCollide(range)));

        diffs.forEach((diff) => (diff.index += this.index));

        if (this.ignoreAll) {
            return [];
        }

        return diffs.filter((diff) => {
            return (
                this.ignorePatterns.filter((ignorePattern) => {
                    return diff.matches[0].match(ignorePattern);
                }).length === 0
            );
        });
    }
}
