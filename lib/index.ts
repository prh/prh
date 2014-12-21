/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/js-yaml/js-yaml.d.ts" />

"use strict";

import yaml = require("js-yaml");

import m = require("./model");
export import Config = m.Config;

export function fromYAML(yamlContent:string):m.Config {
	"use strict";

	var rawConfig = yaml.load(yamlContent);
	return fromRowConfig(rawConfig);
}

export function fromRowConfig(rawConfig:m.raw.Config):m.Config {
	"use strict";

	return new m.Config(rawConfig);
}
