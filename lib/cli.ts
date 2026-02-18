import * as path from "path";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as diff from "diff";

import { fromYAMLFilePaths, getRuleFilePath } from "./";
import { indexToLineColumn } from "./utils/content";

import { Command } from "commander";
const pkg = require("../package.json");

interface Options {
    rulesJson: boolean;
    rulesYaml: boolean;
    replace: boolean;
    verify: boolean;
    stdout: boolean;
    diff: boolean;
    verbose: boolean;
    rules?: string[];
}

const program = new Command();

program
    .name("prh")
    .version(pkg.version, "-v, --version")
    .argument("[files...]")
    .option("--rules-json", "emit rule set in json format")
    .option("--rules-yaml", "emit rule set in yaml format")
    .option("--rules <path>", "path to rule yaml file", (value: string, previous: string[]) => previous.concat([value]), [] as string[])
    .option("--verify", "checking file validity")
    .option("--stdout", "print replaced content to stdout")
    .option("--diff", "show unified diff")
    .option("--verbose", "makes output more verbose")
    .option("-r, --replace", "replace input files")
    .action((files: string[], opts: Options) => {
        if (opts.rulesJson || opts.rulesYaml) {
            if (opts.verbose) {
                console.warn(`processing ${process.cwd()} dir...`);
            }
            const engine = getEngineByTargetDir(process.cwd(), opts);
            if (opts.rulesJson) {
                console.log(JSON.stringify(engine, null, 2));
                return;
            } else if (opts.rulesYaml) {
                console.log(yaml.dump(JSON.parse(JSON.stringify(engine, null, 2))));
                return;
            }
        }

        if (files.length === 0) {
            throw new Error("files is required more than 1 argument");
        }

        const invalidFiles: string[] = [];
        files.forEach((filePath) => {
            if (opts.verbose) {
                console.warn(`processing ${filePath}...`);
            }
            const content = fs.readFileSync(filePath, { encoding: "utf8" });
            const engine = getEngineByTargetDir(path.dirname(filePath), opts);
            const changeSet = engine.makeChangeSet(filePath);
            if (changeSet.diffs.length !== 0) {
                invalidFiles.push(filePath);
            }

            if (opts.stdout) {
                const result = changeSet.applyChangeSets(content);
                process.stdout.write(result);
            } else if (opts.diff) {
                const result = changeSet.applyChangeSets(content);
                const patch = diff.createPatch(filePath, content, result, "before", "replaced");
                console.log(patch);
            } else if (opts.replace) {
                const result = changeSet.applyChangeSets(content);
                if (content !== result) {
                    fs.writeFileSync(filePath, result);
                    console.warn(`replaced ${filePath}`);
                }
            } else {
                changeSet.diffs.forEach((d) => {
                    const before = changeSet.content.substr(d.index, d.tailIndex - d.index);
                    const after = d.newText;
                    if (after == null) {
                        return;
                    }
                    const lineColumn = indexToLineColumn(d.index, changeSet.content);
                    console.log(`${changeSet.filePath}(${lineColumn.line + 1},${lineColumn.column + 1}): ${before} → ${after}`);
                });
            }
        });
        if (opts.verify && invalidFiles.length !== 0) {
            throw new Error(`${invalidFiles.join(" ,")} failed proofreading`);
        }
    });

program
    .command("init")
    .description("generate prh.yml")
    .action(() => {
        fs.createReadStream(path.resolve(__dirname, "../misc/prh.yml")).pipe(fs.createWriteStream("prh.yml"));
        console.log("create prh.yml");
        console.log("see prh/rules collection https://github.com/prh/rules");
    });

function getEngineByTargetDir(targetDir: string, opts: Options) {
    let rulePaths: string[];
    if (opts.rules && opts.rules[0]) {
        rulePaths = [...opts.rules];
    } else {
        const foundPath = getRuleFilePath(targetDir);
        if (!foundPath) {
            throw new Error(`can't find rule file from ${targetDir}`);
        }

        rulePaths = [foundPath];
    }

    if (opts.verbose) {
        rulePaths.forEach((p, i) => {
            console.warn(`  apply ${i + 1}: ${p}`);
        });
    }

    return fromYAMLFilePaths(...rulePaths);
}

program.parseAsync(process.argv).catch(errorHandler);

function errorHandler(err: any) {
    if (err instanceof Error) {
        console.error(err.stack);
    } else {
        console.error(err);
    }
    return Promise.resolve(null).then(() => {
        process.exit(1);
    });
}
