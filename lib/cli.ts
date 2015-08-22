/// <reference path="../node_modules/typescript/bin/lib.es6.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/js-yaml/js-yaml.d.ts" />
/// <reference path="../node_modules/commandpost/commandpost.d.ts" />

import * as fs from "fs";
import * as yaml from "js-yaml";
import * as lib from "./index";

import * as commandpost from "commandpost";
var pkg = require("../package.json");

interface RootOpts {
	json:boolean;
	yaml:boolean;
	replace:boolean;
	rules:string[];
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
		console.log(opts, args);
		var paths = [__dirname + "/../misc/WEB+DB_PRESS.yml"];
		if (opts.rules) {
			paths = opts.rules;
		}
		var config = lib.fromYAMLFilePath(paths[0]);
		paths.splice(1).forEach(path => {
			var c = lib.fromYAMLFilePath(path);
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
			var result = config.replaceByRule(filePath);
			if (opts.replace) {
				fs.writeFileSync(filePath, result);
			} else {
				console.log(result);
			}
		});
	});

commandpost
	.exec(root, process.argv)
	.catch(errorHandler);

function errorHandler(err:any) {
	"use strict";

	if (err instanceof Error) {
		console.error(err.stack);
	} else {
		console.error(err);
	}
	return Promise.resolve(null).then(()=> {
		process.exit(1);
	});
}
