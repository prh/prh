import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

import * as raw from "./raw";
import { Engine } from "./engine";
import { ChangeSet, Diff } from "./changeset/";

export { Engine, ChangeSet, Diff };

export function fromYAMLFilePath(configPath: string): Engine {
    const content = fs.readFileSync(configPath, { encoding: "utf8" });
    return fromYAML(configPath, content);
}

export function fromYAML(configPath: string, yamlContent: string): Engine {
    const rawConfig = yaml.load(yamlContent);
    return fromRowConfig(configPath, rawConfig);
}

export function fromRowConfig(configPath: string, rawConfig: raw.Config): Engine {
    const engine = new Engine(rawConfig);

    if (rawConfig.imports) {
        const tmp = rawConfig.imports;
        const imports = typeof tmp === "string" ? [tmp] : tmp;
        imports.forEach(im => {
            const importedConfigPath = path.resolve(path.dirname(configPath), im);
            const newEngine = fromYAMLFilePath(importedConfigPath);
            engine.merge(newEngine);
        });
    }

    return engine;
}
