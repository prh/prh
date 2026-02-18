import { parseRegExpString, escapeSpecialChars } from "./utils/regexp";

import * as raw from "./raw";
import { TargetPattern } from "./targetPattern";

export class Target {
    file: RegExp;
    includes: TargetPattern[];
    excludes: TargetPattern[];

    constructor(src: raw.Target) {
        if (!src) {
            throw new Error("src is requried");
        }
        this.file = parseRegExpString(src.file) || new RegExp(escapeSpecialChars(src.file));
        if (src.includes) {
            this.includes = src.includes.map((include) => new TargetPattern(include));
        } else {
            this.includes = [];
        }
        if (src.excludes) {
            this.excludes = src.excludes.map((exclude) => new TargetPattern(exclude));
        } else {
            this.excludes = [];
        }
    }

    reset() {
        this.file.lastIndex = 0;
        this.includes.forEach((include) => include.reset());
        this.excludes.forEach((exclude) => exclude.reset());
    }

    toJSON() {
        const alt: any = {};
        for (const key in this) {
            if (key.indexOf("_") === 0) {
                continue;
            }
            const value = (<any>this)[key];
            if (value instanceof RegExp) {
                alt[key] = value.toString();
                continue;
            }
            alt[key] = value;
        }
        return alt;
    }
}
