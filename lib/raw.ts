"use strict";

export interface Config {
    version: number;
    targets?: Target[];
    rules?: any[]; // string | regexp style string or array
}
export interface Target {
    file: string; // string | regexp style string
    includes?: any[]; // (string | TargetPattern) array;
    excludes?: any[]; // (string | TargetPattern) array;
}
export interface TargetPattern {
    pattern: any; // string | regexp style string
}
export interface Rule {
    expected: string;
    pattern?: any; // string | regexp style string or array
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
