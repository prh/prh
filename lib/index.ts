"use strict";

import * as fs from "fs";
import * as yaml from "js-yaml";

import * as raw from "./raw";
import Engine from "./engine";

export {Engine};

export function fromYAMLFilePath(path: string): Engine {
    "use strict";

    let content = fs.readFileSync(path, { encoding: "utf8" });
    return fromYAML(content);
}

export function fromYAML(yamlContent: string): Engine {
    "use strict";

    let rawConfig = yaml.load(yamlContent);
    return fromRowConfig(rawConfig);
}

export function fromRowConfig(rawConfig: raw.Config): Engine {
    "use strict";

    return new Engine(rawConfig);
}
