"use strict";

import * as r from "../lib/utils/regexp";

import * as changeSet from "../lib/changeset";
import Diff from "../lib/changeset/diff";

describe("ChangeSet", () => {
    describe(".applyChangeSets", () => {
        it("can apply change sets. pattern shorten", () => {
            let regexp = /Webだー*/g;
            let expected = "Webさ";
            let base = "今日の晩御飯はWebだーーーーーーー！そしておかずもWebだ！";
            let diffs = r
                .collectAll(regexp, base)
                .map(result => {
                    return new Diff(regexp, expected, result.index, Array.prototype.slice.call(result));
                });
            let changeSets = new changeSet.ChangeSet(diffs);
            let result = changeSet.applyChangeSets(base, changeSets);
            assert(result === "今日の晩御飯はWebさ！そしておかずもWebさ！");
        });
        it("can apply change sets. pattern longer", () => {
            let regexp = /Web/g;
            let expected = "ウェッブ";
            let base = "今日の晩御飯はWebだ！そしておかずもWebだ！";
            let diffs = r
                .collectAll(regexp, base)
                .map(result => {
                    return new Diff(regexp, expected, result.index, Array.prototype.slice.call(result));
                });
            let changeSets = new changeSet.ChangeSet(diffs);
            let result = changeSet.applyChangeSets(base, changeSets);
            assert(result === "今日の晩御飯はウェッブだ！そしておかずもウェッブだ！");
        });
        it("can apply change sets with grouping", () => {
            let regexp = /(博多)の(潮)/g;
            let expected = "伯方($1ではない)の塩($2ではない)";
            let base = "白いご飯と博多の潮！";
            let diffs = r
                .collectAll(regexp, base)
                .map(result => {
                    return new Diff(regexp, expected, result.index, Array.prototype.slice.call(result));
                });
            let changeSets = new changeSet.ChangeSet(diffs);
            let result = changeSet.applyChangeSets(base, changeSets);
            assert(result === "白いご飯と伯方(博多ではない)の塩(潮ではない)！");
        });
        it("can apply change sets with grouping", () => {
            let regexpA = /Web/ig;
            let regexpB = /火/ig;
            let base = "ある火のWEBと、とある火のwebの話";
            let diffA = r
                .collectAll(regexpA, base)
                .map(result => {
                    return new Diff(regexpA, "Web", result.index, Array.prototype.slice.call(result));
                });
            let diffB = r
                .collectAll(regexpB, base)
                .map(result => {
                    return new Diff(regexpB, "日", result.index, Array.prototype.slice.call(result));
                });
            let changeSetsA = new changeSet.ChangeSet(diffA);
            let changeSetsB = new changeSet.ChangeSet(diffB);
            let changeSets = changeSetsA.concat(changeSetsB);
            let result = changeSet.applyChangeSets(base, changeSets);
            assert(result === "ある日のWebと、とある日のWebの話");
        });
    });
    describe(".makeChangeSet", () => {
        it("make change sets", () => {
            let base = "今日はjs明日はts明後日はなんのaltjsですかねぇ？";
            let changeSets = changeSet.makeChangeSet(base, /JS/ig, "JS");

            let result = changeSet.applyChangeSets(base, changeSets);
            assert(result === "今日はJS明日はts明後日はなんのaltJSですかねぇ？");
        });
    });
    describe(".subtract", () => {
        it("subtract changeset from other changeset", () => {
            let base = "次に見るjs（@<list>{hoge-js}）はただのjsではありません。\nしかし、altjs（@<fn>{alt-js}）ほどではないでしょう。";
            let minuend = changeSet.makeChangeSet(base, /js/ig, "JS");
            let subtrahend = changeSet.makeChangeSet(base, /(@<(?:list|fn)>{.+?})/ig, "$1");

            let changeSets = changeSet.subtract(minuend, subtrahend);

            let result = changeSet.applyChangeSets(base, changeSets);
            assert(result === "次に見るJS（@<list>{hoge-js}）はただのJSではありません。\nしかし、altJS（@<fn>{alt-js}）ほどではないでしょう。");
        });
        it("not subtract changeset with over wrapped changeset", () => {
            let base = "js(@<list>{js})js";
            let minuendA = changeSet.makeChangeSet(base, /\((.+?)\)/ig, "（$1）");
            let minuendB = changeSet.makeChangeSet(base, /JS/ig, "JS");
            let minuend = minuendA.concat(minuendB);
            let subtrahend = changeSet.makeChangeSet(base, /(@<(?:list|fn)>{.+?})/ig, "$1");

            let changeSets = changeSet.subtract(minuend, subtrahend);

            let result = changeSet.applyChangeSets(base, changeSets);
            assert(result === "JS（@<list>{js}）JS");
        });
    });
    describe(".intersect", () => {
        it("intersect changeset with audit changeset", () => {
            let base = "let foo = 'js';\n// これがjsだ！\n let bar = 'altjs'; /* これもjsだ */\n let buzz = 'jsx';";
            let baseSet = changeSet.makeChangeSet(base, /js/igm, "JS");
            let auditA = changeSet.makeChangeSet(base, /\/\/\s*(.*?)$/gm, "$1");
            let auditB = changeSet.makeChangeSet(base, /\/\*.*?\*\//gm, "$1");
            let audit = auditA.concat(auditB);

            let changeSets = changeSet.intersect(baseSet, audit);

            let result = changeSet.applyChangeSets(base, changeSets);
            assert(result === "let foo = 'js';\n// これがJSだ！\n let bar = 'altjs'; /* これもJSだ */\n let buzz = 'jsx';");
        });
    });
});
