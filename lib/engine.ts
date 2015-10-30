"use strict";

import * as fs from "fs";

import * as r from "./utils/regexp";

import * as raw from "./raw";
import Target from "./target";
import Rule from "./rule";
import * as changeSet from "./changeset";

export default class Engine {
    version: number;
    targets: Target[];
    rules: Rule[];

    constructor(src: raw.Config) {
        if (!src) {
            throw new Error("src is requried");
        }
        this.version = +src.version || 1;
        this.targets = (src.targets || []).map(target => new Target(target));
        this.rules = (src.rules || []).map(rule => new Rule(rule));
    }

    merge(other: Engine) {
        if (!other) {
            throw new Error("other is required");
        }
        if (this.version !== other.version) {
            throw new Error("version mismatch!");
        }
        other.targets.forEach(otherTarget => {
            let exists = this.targets.filter(target => r.equals(target.file, otherTarget.file)).length !== 0;
            if (!exists) {
                this.targets.push(otherTarget);
            }
        });
        other.rules.forEach(otherRule => {
            let exists = this.rules.filter(rule => rule.expected === otherRule.expected).length !== 0;
            if (!exists) {
                this.rules.push(otherRule);
            }
        });
    }

    makeChangeSet(filePath: string, content?: string): changeSet.ChangeSet {
        if (content == null) {
            content = fs.readFileSync(filePath, { encoding: "utf8" });
        }
        let changeSets = new changeSet.ChangeSet();
        this.rules.forEach(rule => {
            let set = rule.applyRule(content);
            changeSets = changeSets.concat(set);
        });

        let includes = new changeSet.ChangeSet();
        let excludes = new changeSet.ChangeSet();
        let includesExists = false;
        let excludesExists = false;
        this.targets.forEach(target => {
            target.reset();
            if (!target.file.test(filePath)) {
                return;
            }
            if (target.includes.length !== 0) {
                // .ts の // の後や /* */ の内部だけ対象にしたい場合のための機能
                includesExists = true;
                target.includes.forEach(include => {
                    includes = includes.concat(changeSet.makeChangeSet(content, include.pattern, null));
                });
            }
            if (target.excludes.length !== 0) {
                // .re の #@ の後を対象にしたくない場合のための機能
                excludesExists = true;
                target.excludes.forEach(exclude => {
                    excludes = excludes.concat(changeSet.makeChangeSet(content, exclude.pattern, null));
                });
            }
        });

        if (includesExists) {
            changeSets = changeSets.intersect(includes);
        }
        if (excludesExists) {
            changeSets = changeSets.subtract(excludes);
        }

        return changeSets;
    }

    replaceByRule(filePath: string, content?: string) {
        if (content == null) {
            content = fs.readFileSync(filePath, { encoding: "utf8" });
        }
        let changeSets = this.makeChangeSet(filePath, content);
        return changeSets.applyChangeSets(content);
    }
}
