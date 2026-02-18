import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

import * as raw from "./raw";
import { Engine } from "./engine";
import { ChangeSet, Diff } from "./changeset/";

export { Engine, ChangeSet, Diff };

export function fromYAMLFilePaths(...configPaths: string[]): Engine {
    const engine = fromYAMLFilePath(configPaths[0]);
    configPaths.splice(1).forEach((path) => {
        engine.merge(fromYAMLFilePath(path));
    });
    return engine;
}

export interface Options {
    disableImports?: boolean;
}

export function fromYAMLFilePath(configPath: string, opts: Options = {}): Engine {
    const content = fs.readFileSync(configPath, { encoding: "utf8" });
    return fromYAML(configPath, content, opts);
}

export function fromYAML(configPath: string, yamlContent: string, opts: Options = {}): Engine {
    const rawConfig = yaml.load(yamlContent) as raw.Config;
    return fromRowConfig(configPath, rawConfig, opts);
}

export function fromRowConfig(configPath: string, rawConfig: raw.Config, opts: Options = {}): Engine {
    const engine = new Engine(rawConfig);
    engine.sourcePaths.push(path.normalize(configPath));

    if (!opts.disableImports && rawConfig.imports) {
        // TODO この辺の処理をEngine側に移したい
        // なるべく破壊的変更を避ける
        // fsやyamlを使わずに同等のEngineを組み立てる余地を残す
        // async化したいけどprhの参照パッケージが壊れるのが辛い

        let importSpecs: raw.ImportSpec[];
        if (typeof rawConfig.imports === "string") {
            importSpecs = [
                {
                    path: rawConfig.imports,
                },
            ];
        } else {
            importSpecs = rawConfig.imports.map((imp) => {
                if (typeof imp === "string") {
                    return {
                        path: imp,
                    };
                }
                return imp;
            });
        }
        importSpecs.forEach((importSpec) => {
            const importedConfigPath = path.join(path.dirname(configPath), importSpec.path);
            const newEngine = fromYAMLFilePath(importedConfigPath, {
                disableImports: !!importSpec.disableImports,
            });

            const ignoreRules = (importSpec.ignoreRules || []).map((ignoreRule) => {
                return typeof ignoreRule === "string" ? { pattern: ignoreRule } : ignoreRule;
            });
            newEngine.rules = newEngine.rules.filter((rule) => {
                return ignoreRules.every((ignoreRule) => {
                    return !rule._shouldIgnore(ignoreRule);
                });
            });

            engine.merge(newEngine);
        });
    }

    return engine;
}

export function fromYAMLFilePathsAsync(...configPaths: string[]): Promise<Engine> {
    try {
        return Promise.resolve(fromYAMLFilePaths(...configPaths));
    } catch (e) {
        return Promise.reject(e);
    }
}

export function fromYAMLFilePathAsync(configPath: string, opts: Options = {}): Promise<Engine> {
    try {
        return Promise.resolve(fromYAMLFilePath(configPath, opts));
    } catch (e) {
        return Promise.reject(e);
    }
}

export function fromYAMLAsync(configPath: string, yamlContent: string, opts: Options = {}): Promise<Engine> {
    try {
        return Promise.resolve(fromYAML(configPath, yamlContent, opts));
    } catch (e) {
        return Promise.reject(e);
    }
}

export function fromRowConfigAsync(configPath: string, rawConfig: raw.Config, opts: Options = {}): Promise<Engine> {
    try {
        return Promise.resolve(fromRowConfig(configPath, rawConfig, opts));
    } catch (e) {
        return Promise.reject(e);
    }
}

export function getRuleFilePath(baseDir: string, configFileName = "prh.yml"): string | null {
    const configFilePath = path.resolve(baseDir, configFileName);
    if (fs.existsSync(configFilePath)) {
        return configFilePath;
    }

    if (baseDir.length === path.dirname(baseDir).length) {
        return null;
    }

    return getRuleFilePath(path.resolve(baseDir, "../"), configFileName);
}
