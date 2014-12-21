/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/power-assert/power-assert.d.ts" />

/// <reference path="./regexpSpec.ts" />
/// <reference path="./modelSpec.ts" />

"use strict";

import fs = require("fs");

import lib = require("../lib/index");

describe("index", ()=> {
	describe("fromYAMLFilePath", ()=> {
		it("parse yaml to Config", ()=> {
			lib.fromYAMLFilePath("./misc/rules.yml");
		});
	});
	describe("fromYAML", ()=> {
		it("parse yaml string to Config", ()=> {
			var yamlContent = fs.readFileSync("./misc/rules.yml", {encoding: "utf8"});
			lib.fromYAML(yamlContent);
		});
	});
});
