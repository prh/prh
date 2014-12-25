"use strict";

export interface Config {
	version: number;
	rules: any[]; // (string | Rule)[]
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
