/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/power-assert/power-assert.d.ts" />

/// <reference path="./configSpec.ts" />
/// <reference path="./changesetSpec.ts" />
/// <reference path="./ruleSpec.ts" />

/// <reference path="./utils/regexpSpec.ts" />

"use strict";

import * as fs from "fs";
import * as path from "path";

import * as lib from "../lib/index";

describe("index", () => {
    describe("fromYAMLFilePath", () => {
        it("parse yaml to Config", () => {
            lib.fromYAMLFilePath("./misc/WEB+DB_PRESS.yml");
        });
    });
    describe("fromYAML", () => {
        it("parse yaml string to Config", () => {
            let yamlContent = fs.readFileSync("./misc/WEB+DB_PRESS.yml", { encoding: "utf8" });
            lib.fromYAML(yamlContent);
        });
    });
    describe("try all yml files in misc", () => {
        let targetDir = path.resolve(__dirname, "..", "misc");
        fs
            .readdirSync(targetDir)
            .filter(file => /\.yml$/.test(file))
            .forEach(file => {
                it("try " + file, () => {
                    let yamlContent = fs.readFileSync(targetDir + "/" + file, { encoding: "utf8" });
                    lib.fromYAML(yamlContent);
                });
            });
    });
});
