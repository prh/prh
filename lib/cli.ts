import * as path from "path";
import * as fs from "fs";
import * as yaml from "js-yaml";
import { fromYAMLFilePath } from "./";

import * as commandpost from "commandpost";
const pkg = require("../package.json");

interface RootOpts {
    json: boolean;
    yaml: boolean;
    replace: boolean;
    rules: string[];
}

interface RootArgs {
    files: string[];
}

const root = commandpost
    .create<RootOpts, RootArgs>("prh <files...>")
    .version(pkg.version, "-v, --version")
    .option("--json", "emit rule set in json format")
    .option("--yaml", "emit rule set in yaml format")
    .option("--rules <path>", "path to rule yaml file")
    .option("-r, --replace", "replace input files")
    .action((opts, args) => {
        let paths = [getConfigFileName(process.cwd(), "prh.yml") || path.resolve(__dirname, "../rules/media/WEB+DB_PRESS.yml")];
        if (opts.rules && opts.rules[0]) {
            paths = opts.rules;
        }
        const engine = fromYAMLFilePath(paths[0]);
        paths.splice(1).forEach(path => {
            const e = fromYAMLFilePath(path);
            engine.merge(e);
        });

        if (opts.json) {
            console.log(JSON.stringify(engine, null, 2));
            return;
        } else if (opts.yaml) {
            console.log(yaml.dump(JSON.parse(JSON.stringify(engine, null, 2))));
            return;
        }
        args.files.forEach(filePath => {
            const result = engine.replaceByRule(filePath);
            if (opts.replace) {
                fs.writeFileSync(filePath, result);
            } else {
                console.log(result);
            }
        });
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

export function getConfigFileName(baseDir: string, configFileName: string): string | null {
    const configFilePath = path.resolve(baseDir, configFileName);
    if (fs.existsSync(configFilePath)) {
        return configFilePath;
    }

    if (baseDir.length === path.dirname(baseDir).length) {
        return null;
    }

    return getConfigFileName(path.resolve(baseDir, "../"), configFileName);
}
