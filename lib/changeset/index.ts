import { collectAll } from "../utils/regexp";
import { Diff } from "./diff";
import { ChangeSet } from "./changeset";

export { ChangeSet, Diff };

export function makeChangeSet(filePath: string, content: string, pattern: RegExp, expected?: string): ChangeSet {
    pattern.lastIndex = 0;
    const resultList = collectAll(pattern, content);
    const diffs = resultList.map((matches) => new Diff({ pattern, expected, index: matches.index, matches }));
    return new ChangeSet({ filePath, content, diffs });
}
