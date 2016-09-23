import * as assert from "power-assert";

import * as fs from "fs";
import * as path from "path";

import * as lib from "../lib/";

export * from "./engineSpec";
export * from "./changesetSpec";
export * from "./ruleSpec";
export * from "./utils/regexpSpec";

describe("index", () => {
    describe("fromYAMLFilePath", () => {
        it("parse yaml to Config", () => {
            lib.fromYAMLFilePath("./misc/WEB+DB_PRESS.yml");
        });
    });
    describe("fromYAML", () => {
        it("parse yaml string to Config", () => {
            let configPath = "./misc/WEB+DB_PRESS.yml";
            let yamlContent = fs.readFileSync(configPath, { encoding: "utf8" });
            lib.fromYAML(configPath, yamlContent);
        });
    });
    describe("try all yml files in misc", () => {
        let targetDir = path.resolve(__dirname, "..", "misc");
        fs
            .readdirSync(targetDir)
            .filter(file => /\.yml$/.test(file))
            .forEach(file => {
                it("try " + file, () => {
                    let configPath = targetDir + "/" + file;
                    let yamlContent = fs.readFileSync(configPath, { encoding: "utf8" });
                    lib.fromYAML(configPath, yamlContent);
                });
            });
    });
    it("can import other yaml file", () => {
        let miscPrhEngine = lib.fromYAMLFilePath("./misc/imports-a.yml");
        let miscSampleEngine = lib.fromYAMLFilePath("./misc/imports-b.yml");

        let engine = lib.fromYAMLFilePath("./misc/imports.yml");

        assert(engine.rules.length === miscPrhEngine.rules.length + miscSampleEngine.rules.length);
    });
});
