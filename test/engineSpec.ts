import * as assert from "power-assert";

import * as fs from "fs";
import * as path from "path";

import * as glob from "glob";
import * as mkdirp from "mkdirp";

import { fromYAMLFilePath } from "../lib/";

import { Engine } from "../lib/engine";

describe("Engine", () => {
    it("parse raw.Config", () => {
        const engine = new Engine({
            version: 1,
            rules: [{
                expected: "vvakame",
            }],
        });

        assert(engine.version === 1);
        assert(engine.rules.length === 1);
        assert(engine.rules[0].pattern instanceof RegExp);
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
                }, {
                    expected: "Web",
                    pattern: "ウェッブ",
                }, {
                    // ignored
                    expected: "Test",
                    pattern: "テスト",
                },
            ],
        });
        main.merge(sub);

        assert(main.version === 1);
        assert(main.rules.length === 3);
        assert(main.rules[0].expected === "Test");
        assert(main.rules[0].pattern.source === "てすと");
        assert(main.rules[1].expected === "Web");
        assert(main.rules[1].pattern.source === "ウェブ");
        assert(main.rules[2].expected === "Web");
        assert(main.rules[2].pattern.source === "ウェッブ");
    });

    it("makeChangeSet", () => {
        {
            const engine = new Engine({
                version: 1,
                rules: [
                    { expected: "A" },
                    { expected: "B" },
                    { expected: "C" },
                ],
            });

            const changeSet = engine.makeChangeSet("test.re", `
#@# prh:disable:b
テストaとb。

テストaとbとc。
#@# prh:disable:c
        `);

            assert(changeSet.diffs.length === 3);
            assert(changeSet.diffs[0].index === 22);
            assert(changeSet.diffs[1].index === 31);
            assert(changeSet.diffs[2].index === 33);
        }
        {
            const engine = new Engine({
                version: 1,
                rules: [
                    { expected: "Web" },
                    { expected: "jQuery" },
                ],
            });

            const changeSet = engine.makeChangeSet("test.md", `
<!-- prh:disable:web -->
# webmaster
webmasterだよー

<!-- prh:disable:jquery -->
[リンクだよー](https://jquery.com/)
        `);

            assert(changeSet.diffs.length === 0);
        }
    });

    describe("replaceByRule", () => {
        const fixtureDir = "test/fixture/";
        const expectedDir = "test/expected/";

        glob.sync(`${fixtureDir}/*`).forEach(dir => {
            it(dir, () => {
                const prhYaml = path.join(dir, "prh.yml");
                const engine = fromYAMLFilePath(prhYaml);

                glob.sync(`${dir}/*`)
                    .filter(file => file !== prhYaml)
                    .forEach(file => {
                        const result = engine.replaceByRule(file);

                        const target = file.replace(fixtureDir, expectedDir);
                        if (fs.existsSync(target)) {
                            const expected = fs.readFileSync(target, { encoding: "utf8" });
                            assert(result === expected);

                        } else {
                            mkdirp.sync(path.dirname(target));
                            fs.writeFileSync(target, result);
                        }
                    });
            });
        });
    });
});
