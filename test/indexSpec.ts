import { describe, it, expect } from "vitest";

import * as fs from "fs";
import * as path from "path";

import { fromYAMLFilePaths, fromYAMLFilePath, fromYAMLFilePathAsync, fromYAML, getRuleFilePath } from "../lib/";

describe("index", () => {
    describe("fromYAMLFilePaths", () => {
        it("parse yaml files to Config", () => {
            const engine = fromYAMLFilePaths("./prh-rules/media/WEB+DB_PRESS.yml", "./prh-rules/files/markdown.yml");

            expect(engine.sourcePaths.length).toBe(2);
            expect(engine.sourcePaths[0]).toBe("prh-rules/media/WEB+DB_PRESS.yml");
            expect(engine.sourcePaths[1]).toBe("prh-rules/files/markdown.yml");
        });
    });
    describe("fromYAMLFilePath", () => {
        it("parse yaml file to Config", () => {
            fromYAMLFilePath("./prh-rules/media/WEB+DB_PRESS.yml");
        });
    });
    describe("fromYAMLFilePathAsync", () => {
        it("parse yaml file to Config", async () => {
            const engine = await fromYAMLFilePathAsync("./prh-rules/media/WEB+DB_PRESS.yml");
            expect(engine).toBeTruthy();
        });
        it("can convert exception to rejected Promise", () => {
            return expect(fromYAMLFilePathAsync("./notFound.yml")).rejects.toThrow();
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
            expect(getRuleFilePath("./misc")).toBe(path.join(process.cwd(), "misc/prh.yml"));
        });
    });
    describe("try all yml files in misc", () => {
        const targetDir = path.resolve(__dirname, "..", "misc");
        fs.readdirSync(targetDir)
            .filter((file) => /\.yml$/.test(file))
            .forEach((file) => {
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

        expect(engine.rules.length).toBe(miscPrhEngine.rules.length + miscSampleEngine.rules.length);

        expect(engine.sourcePaths.length).toBe(5);
        expect(engine.sourcePaths[0]).toBe("misc/imports.yml");
        expect(engine.sourcePaths[1]).toBe("misc/imports-a.yml");
        expect(engine.sourcePaths[2]).toBe("misc/imports-b.yml");
        expect(engine.sourcePaths[3]).toBe("misc/imports-c.yml");
        expect(engine.sourcePaths[4]).toBe("misc/imports-d.yml");
    });
    it("passed disableImports option", () => {
        const engine = fromYAMLFilePath("./misc/imports.yml", { disableImports: true });

        expect(engine.rules.length).toBe(0);
    });
});
