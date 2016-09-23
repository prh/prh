import * as path from "path";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as lib from "./";

import * as commandpost from "commandpost";
let pkg = require("../package.json");

interface RootOpts {
    json: boolean;
    yaml: boolean;
    replace: boolean;
    rules: string[];
}

interface RootArgs {
    files: string[];
}

let root = commandpost
    .create<RootOpts, RootArgs>("prh <files...>")
    .version(pkg.version, "-v, --version")
    .option("--json", "rule set to json")
    .option("--yaml", "rule set to parsed yaml")
    .option("--rules <path>", "path to rule yaml file")
    .option("-r, --replace", "replace input files")
    .action((opts, args) => {
        let paths = [getConfigFileName(process.cwd(), "prh.yml") || __dirname + "/../misc/WEB+DB_PRESS.yml"];
        if (opts.rules && opts.rules[0]) {
            paths = opts.rules;
        }
        let config = lib.fromYAMLFilePath(paths[0]);
        paths.splice(1).forEach(path => {
            let c = lib.fromYAMLFilePath(path);
            config.merge(c);
        });

        if (opts.json) {
            console.log(JSON.stringify(config, null, 2));
            return;
        } else if (opts.yaml) {
            console.log(yaml.dump(JSON.parse(JSON.stringify(config, null, 2))));
            return;
        }
        args.files.forEach(filePath => {
            let result = config.replaceByRule(filePath);
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
        fs.createReadStream(__dirname + "/../misc/prh.yml").pipe(fs.createWriteStream("prh.yml"));
        console.log("create prh.yml");
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
    let configFilePath = path.resolve(baseDir, configFileName);
    if (fs.existsSync(configFilePath)) {
        return configFilePath;
    }

    if (baseDir.length === path.dirname(baseDir).length) {
        return null;
    }

    return getConfigFileName(path.resolve(baseDir, "../"), configFileName);
}
