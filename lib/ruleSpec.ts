import * as raw from "./raw";

export class RuleSpec {
    from: string;
    to: string;

    constructor(src: raw.RuleSpec) {
        if (!src) {
            throw new Error("src is required");
        }
        if (!src.from) {
            throw new Error("from is required");
        }
        if (!src.to) {
            throw new Error("to is required");
        }
        this.from = src.from;
        this.to = src.to;
    }
}
