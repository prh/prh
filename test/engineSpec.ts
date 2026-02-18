import { describe, it, expect } from "vitest";

import * as fs from "fs";
import * as path from "path";

import { globSync } from "glob";

import { fromYAMLFilePath } from "../lib/";

import { Engine } from "../lib/engine";

describe("Engine", () => {
    it("parse raw.Config", () => {
        const engine = new Engine({
            version: 1,
            rules: [
                {
                    expected: "vvakame",
                },
            ],
        });

        expect(engine.version).toBe(1);
        expect(engine.rules.length).toBe(1);
        expect(engine.rules[0].pattern).toBeInstanceOf(RegExp);
    });

    it("merge other Engine", () => {
        const main = new Engine({
            version: 1,
            rules: [
                {
                    expected: "Test",
                    pattern: "てすと",
                },
            ],
        });
        const sub = new Engine({
            version: 1,
            rules: [
                {
                    expected: "Web",
                    pattern: "ウェブ",
                },
                {
                    expected: "Web",
                    pattern: "ウェッブ",
                },
                {
                    // ignored
                    expected: "Test",
                    pattern: "テスト",
                },
            ],
        });
        main.merge(sub);

        expect(main.version).toBe(1);
        expect(main.rules.length).toBe(3);
        expect(main.rules[0].expected).toBe("Test");
        expect(main.rules[0].pattern.source).toBe("てすと");
        expect(main.rules[1].expected).toBe("Web");
        expect(main.rules[1].pattern.source).toBe("ウェブ");
        expect(main.rules[2].expected).toBe("Web");
        expect(main.rules[2].pattern.source).toBe("ウェッブ");
    });

    it("makeChangeSet", () => {
        {
            const engine = new Engine({
                version: 1,
                rules: [{ expected: "A" }, { expected: "B" }, { expected: "C" }],
            });

            const changeSet = engine.makeChangeSet(
                "test.re",
                `
#@# prh:disable:b
テストaとb。

テストaとbとc。
#@# prh:disable:c
        `,
            );

            expect(changeSet.diffs.length).toBe(3);
            expect(changeSet.diffs[0].index).toBe(22);
            expect(changeSet.diffs[1].index).toBe(31);
            expect(changeSet.diffs[2].index).toBe(33);
        }
        {
            const engine = new Engine({
                version: 1,
                rules: [{ expected: "Web" }, { expected: "jQuery" }],
            });

            const changeSet = engine.makeChangeSet(
                "test.md",
                `
<!-- prh:disable:web -->
# webmaster
webmasterだよー

<!-- prh:disable:jquery -->
[リンクだよー](https://jquery.com/)
        `,
            );

            expect(changeSet.diffs.length).toBe(0);
        }
        {
            const engine = new Engine({
                version: 1,
                rules: [{ expected: "Web", pattern: "/\\bWeb\\b/i" }],
            });

            const changeSet = engine.makeChangeSet("test.md", "webとWebとWEB");

            console.log(JSON.stringify(changeSet.diffs, null, 2));

            expect(changeSet.diffs.length).toBe(2);
            expect(changeSet.diffs[0].matches[0]).toBe("web");
            expect(changeSet.diffs[1].matches[0]).toBe("WEB");
        }
    });

    describe("replaceByRule", () => {
        const fixtureDir = "test/fixture/";
        const expectedDir = "test/expected/";

        globSync(`${fixtureDir}/*`).forEach((dir) => {
            it(dir, () => {
                const prhYaml = path.join(dir, "prh.yml");
                const engine = fromYAMLFilePath(prhYaml);

                globSync(`${dir}/*`)
                    .filter((file) => file !== prhYaml)
                    .forEach((file) => {
                        const result = engine.replaceByRule(file);

                        const target = file.replace(fixtureDir, expectedDir);
                        if (fs.existsSync(target)) {
                            const expected = fs.readFileSync(target, { encoding: "utf8" });
                            expect(result).toBe(expected);
                        } else {
                            fs.mkdirSync(path.dirname(target), { recursive: true });
                            fs.writeFileSync(target, result);
                        }
                    });
            });
        });
    });
});
