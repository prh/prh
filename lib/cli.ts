/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/js-yaml/js-yaml.d.ts" />

import fs = require("fs");
import yaml = require("js-yaml");

import lib = require("./index");

var data = fs.readFileSync("./test/misc/rules.yml", {encoding: "utf8"});
var config = lib.fromYAML(data);
// console.log(JSON.stringify(config, null, 2));

var convertedYaml = yaml.dump(JSON.parse(JSON.stringify(config)));
console.log(convertedYaml);
