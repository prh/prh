/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/js-yaml/js-yaml.d.ts" />

"use strict";

import * as fs from "fs";
import * as yaml from "js-yaml";

import * as raw from "./raw";
import Config from "./config";

export function fromYAMLFilePath(path: string): Config {
    "use strict";

    var content = fs.readFileSync(path, { encoding: "utf8" });
    return fromYAML(content);
}

export function fromYAML(yamlContent: string): Config {
    "use strict";

    var rawConfig = yaml.load(yamlContent);
    return fromRowConfig(rawConfig);
}

export function fromRowConfig(rawConfig: raw.Config): Config {
    "use strict";

    return new Config(rawConfig);
}
