import * as path from "path";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as diff from "diff";

import { fromYAMLFilePath, getRuleFilePath } from "./";
import { indexToLineColumn } from "./utils/content";

import * as commandpost from "commandpost";
const pkg = require("../package.json");

interface RootOpts {
    rulesJson: boolean;
    rulesYaml: boolean;
    replace: boolean;
    verify: boolean;
    stdout: boolean;
    diff: boolean;
    rules: string[];
}

interface RootArgs {
    files: string[];
}

const root = commandpost
    .create<RootOpts, RootArgs>("prh [files...]")
    .version(pkg.version, "-v, --version")
    .option("--rules-json", "emit rule set in json format")
    .option("--rules-yaml", "emit rule set in yaml format")
    .option("--rules <path>", "path to rule yaml file")
    .option("--verify", "checking file validity")
    .option("--stdout", "print replaced content to stdout")
    .option("--diff", "show unified diff")
    .option("-r, --replace", "replace input files")
    .action((opts, args) => {

        if (opts.rulesJson || opts.rulesYaml) {
            const engine = getEngineByTargetDir(process.cwd());
            if (opts.rulesJson) {
                console.log(JSON.stringify(engine, null, 2));
                return;
            } else if (opts.rulesYaml) {
                console.log(yaml.dump(JSON.parse(JSON.stringify(engine, null, 2))));
                return;
            }
        }

        if (args.files.length === 0) {
            throw new Error("files is required more than 1 argument");
        }

        if (opts.verify) {
            const invalidFiles: string[] = [];
            args.files.forEach(filePath => {
                const engine = getEngineByTargetDir(path.dirname(filePath));
                const changeSet = engine.makeChangeSet(filePath);
                if (changeSet.diffs.length !== 0) {
                    invalidFiles.push(filePath);
                }
            });
            if (invalidFiles.length !== 0) {
                throw new Error(`${invalidFiles.join(" ,")} failed proofreading`);
            }
            return;
        } else if (opts.stdout) {
            args.files.forEach(filePath => {
                const engine = getEngineByTargetDir(path.dirname(filePath));
                const result = engine.replaceByRule(filePath);
                console.log(result);
            });
            return;
        } else if (opts.diff) {
            args.files.forEach(filePath => {
                const content = fs.readFileSync(filePath, { encoding: "utf8" });
                const engine = getEngineByTargetDir(path.dirname(filePath));
                const result = engine.replaceByRule(filePath, content);
                const patch = diff.createPatch(filePath, content, result, "before", "replaced");
                console.log(patch);
            });
            return;
        } else if (opts.replace) {
            args.files.forEach(filePath => {
                const content = fs.readFileSync(filePath, { encoding: "utf8" });
                const engine = getEngineByTargetDir(path.dirname(filePath));
                const result = engine.replaceByRule(filePath, content);
                if (content !== result) {
                    fs.writeFileSync(filePath, result);
                    console.warn(`replaced ${filePath}`);
                }
            });
            return;
        } else {
            // show report
            args.files.forEach(filePath => {
                const engine = getEngineByTargetDir(path.dirname(filePath));
                const changeSet = engine.makeChangeSet(filePath);
                if (changeSet.diffs.length === 0) {
                    return;
                }

                changeSet.diffs.forEach(diff => {
                    const before = changeSet.content.substr(diff.index, diff.tailIndex - diff.index);
                    const after = diff.apply(before, -diff.index);
                    if (after == null) {
                        return;
                    }
                    const lineColumn = indexToLineColumn(diff.index, changeSet.content);
                    console.log(`${changeSet.filePath}(${lineColumn.line + 1},${lineColumn.column + 1}): ${before} → ${after.replaced}`);
                });
            });
            return;
        }

        function getEngineByTargetDir(targetDir: string) {
            let rulePaths: string[];

            if (opts.rules && opts.rules[0]) {
                rulePaths = opts.rules;
            } else {
                const foundPath = getRuleFilePath(targetDir);
                if (!foundPath) {
                    throw new Error(`can't find rule file from ${targetDir}`);
                }

                rulePaths = [foundPath];
            }

            const engine = fromYAMLFilePath(rulePaths[0]);
            rulePaths.splice(1).forEach(path => {
                engine.merge(fromYAMLFilePath(path));
            });
            return engine;
        }
    });

root
    .subCommand<{}, {}>("init")
    .description("generate prh.yml")
    .action((_opts, _args) => {
        fs.createReadStream(path.resolve(__dirname, "../misc/prh.yml")).pipe(fs.createWriteStream("prh.yml"));
        console.log("create prh.yml");
        console.log("see prh/rules collection https://github.com/prh/rules");
    });

commandpost
    .exec(root, process.argv)
    .catch(errorHandler);

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
