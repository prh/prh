import * as assert from "assert";

import * as fs from "fs";
import * as path from "path";

import { fromYAMLFilePaths, fromYAMLFilePath, fromYAML, getRuleFilePath } from "../lib/";

import "./engineSpec";
import "./ruleSpec";
import "./paragraphSpec";
import "./changeset/changesetSpec";
import "./changeset/diffSpec";
import "./utils/regexpSpec";
import "./utils/contentSpec";

describe("index", () => {
    describe("fromYAMLFilePaths", () => {
        it("parse yaml files to Config", () => {
            const engine = fromYAMLFilePaths("./prh-rules/media/WEB+DB_PRESS.yml", "./prh-rules/files/markdown.yml");

            assert(engine.sourcePaths.length === 2);
            assert(engine.sourcePaths[0] === "prh-rules/media/WEB+DB_PRESS.yml");
            assert(engine.sourcePaths[1] === "prh-rules/files/markdown.yml");
        });
    });
    describe("fromYAMLFilePath", () => {
        it("parse yaml file to Config", () => {
            fromYAMLFilePath("./prh-rules/media/WEB+DB_PRESS.yml");
        });
    });
    describe("fromYAML", () => {
        it("parse yaml string to Config", () => {
            const configPath = "./prh-rules/media/WEB+DB_PRESS.yml";
            const yamlContent = fs.readFileSync(configPath, { encoding: "utf8" });
            fromYAML(configPath, yamlContent);
        });
    });
    describe("getRuleFilePath", () => {
        it("can find prh.yml", () => {
            assert(getRuleFilePath("./misc") === path.join(process.cwd(), "misc/prh.yml"));
        });
    });
    describe("try all yml files in misc", () => {
        const targetDir = path.resolve(__dirname, "..", "misc");
        fs
            .readdirSync(targetDir)
            .filter(file => /\.yml$/.test(file))
            .forEach(file => {
                it(`try ${file}`, () => {
                    const configPath = `${targetDir}/${file}`;
                    const yamlContent = fs.readFileSync(configPath, { encoding: "utf8" });
                    fromYAML(configPath, yamlContent);
                });
            });
    });
    it("can import other yaml file", () => {
        const miscPrhEngine = fromYAMLFilePath("./misc/imports-a.yml");
        const miscSampleEngine = fromYAMLFilePath("./misc/imports-b.yml");

        const engine = fromYAMLFilePath("./misc/imports.yml");

        assert(engine.rules.length === miscPrhEngine.rules.length + miscSampleEngine.rules.length);

        assert(engine.sourcePaths.length === 5);
        assert(engine.sourcePaths[0] === "misc/imports.yml");
        assert(engine.sourcePaths[1] === "misc/imports-a.yml");
        assert(engine.sourcePaths[2] === "misc/imports-b.yml");
        assert(engine.sourcePaths[3] === "misc/imports-c.yml");
        assert(engine.sourcePaths[4] === "misc/imports-d.yml");
    });
    it("passed disableImports option", () => {
        const engine = fromYAMLFilePath("./misc/imports.yml", { disableImports: true });

        assert(engine.rules.length === 0);
    });
});
