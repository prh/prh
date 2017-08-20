export interface Config {
    version: number;
    imports?: string | (string | ImportSpec)[];
    targets?: Target[];
    rules?: (string | Rule)[]; // string | regexp style string or array
}

export interface ImportSpec {
    path: string;
    disableImports?: boolean;
    // when string comming, evaluate to { pattern: string; }
    ignoreRules?: (string | IgnoreRule)[];
}

export interface IgnoreRule {
    pattern?: string;
    expected?: string;
}

export interface Target {
    file: string; // string | regexp style string
    includes?: (string | TargetPattern)[];
    excludes?: (string | TargetPattern)[];
}

export interface TargetPattern {
    pattern: string; // string | regexp style string
}

export interface Rule {
    expected: string;
    pattern?: string | string[] | null; // string | regexp style string or array
    patterns?: string | string[] | null; // string | regexp style string or array
    regexpMustEmpty?: string;
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
