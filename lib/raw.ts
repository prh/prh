"use strict";

export interface Config {
    version: number;
    targets?: Target[];
    rules?: (string | Rule)[]; // string | regexp style string or array
}

export interface Target {
    file: string; // string | regexp style string
    includes?: (string | TargetPattern)[]; // (string | TargetPattern) array;
    excludes?: (string | TargetPattern)[]; // (string | TargetPattern) array;
}

export interface TargetPattern {
    pattern: string; // string | regexp style string
}

export interface Rule {
    expected: string;
    pattern?: string | string[]; // string | regexp style string or array
    patterns?: string | string[]; // string | regexp style string or array
    options?: Options;
    specs?: RuleSpec[];
}

export interface Options {
    wordBoundary?: boolean;
}

export interface RuleSpec {
    from: string;
    to: string;
}
