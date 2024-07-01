import { parseRegExpString, addDefaultFlags, escapeSpecialChars } from "./utils/regexp";
import * as raw from "./raw";

export class TargetPattern {
    pattern: RegExp;

    constructor(src: string | raw.TargetPattern) {
        if (!src) {
            throw new Error("src is required");
        }
        if (typeof src === "string") {
            this.pattern = parseRegExpString(src) || new RegExp(escapeSpecialChars(src));
            this.pattern = addDefaultFlags(this.pattern);
            return;
        } else {
            if (!src.pattern) {
                throw new Error("pattern is required");
            }
            this.pattern = parseRegExpString(src.pattern) || addDefaultFlags(new RegExp(escapeSpecialChars(src.pattern)));
            this.pattern = addDefaultFlags(this.pattern);
        }
    }

    reset() {
        this.pattern.lastIndex = 0;
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
