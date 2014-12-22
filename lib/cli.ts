/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/commander/commander.d.ts" />
/// <reference path="../typings/js-yaml/js-yaml.d.ts" />

import fs = require("fs");
import yaml = require("js-yaml");

import lib = require("./index");

var pkg = require("../package.json");

var program:IExportedCommand = require("commander");

interface IExportedCommand extends commander.IExportedCommand {
	json:boolean;
	yaml:boolean;
	replace:string;
	rules:string;
}

program
	.version(pkg.version, "-v, --version")
	.usage('[options] <file ...>')
	.option("--json", "rule set to json")
	.option("--yaml", "rule set to parsed yaml")
	.option("--rules <path>", "path to rule yaml file")
	.option("-r, --replace", "replace input files");

program.parse(process.argv);

(()=> {
	var path = __dirname + "/../misc/WEB+DB_PRESS.yml";
	if (program.rules) {
		path = program.rules;
	}
	var config = lib.fromYAMLFilePath(path);
	if (program.json) {
		console.log(JSON.stringify(config, null, 2));
		return;
	} else if (program.yaml) {
		console.log(yaml.dump(JSON.parse(JSON.stringify(config, null, 2))));
		return;
	}
	program.args.forEach(filePath => {
		var content = fs.readFileSync(filePath, {encoding: "utf8"});
		var result = config.replaceByRule(content);
		if (program.replace) {
			fs.writeFileSync(filePath, result);
		} else {
			console.log(result);
		}
	});
})();
