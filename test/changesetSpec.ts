import * as assert from "power-assert";

import { collectAll } from "../lib/utils/regexp";

import { makeChangeSet, ChangeSet } from "../lib/changeset";
import { Diff } from "../lib/changeset/diff";

describe("ChangeSet", () => {
    describe(".applyChangeSets", () => {
        it("can apply change sets. pattern shorten", () => {
            const pattern = /Webだー*/g;
            const expected = "Webさ";
            const base = "今日の晩御飯はWebだーーーーーーー！そしておかずもWebだ！";
            const diffs = collectAll(pattern, base)
                .map(matches => {
                    return new Diff({ pattern, expected, index: matches.index, matches });
                });
            const changeSets = new ChangeSet({ content: base, diffs });
            const result = changeSets.applyChangeSets(base);
            assert(result === "今日の晩御飯はWebさ！そしておかずもWebさ！");
        });
        it("can apply change sets. pattern longer", () => {
            const pattern = /Web/g;
            const expected = "ウェッブ";
            const base = "今日の晩御飯はWebだ！そしておかずもWebだ！";
            const diffs = collectAll(pattern, base)
                .map(matches => {
                    return new Diff({ pattern, expected, index: matches.index, matches });
                });
            const changeSets = new ChangeSet({ content: base, diffs });
            const result = changeSets.applyChangeSets(base);
            assert(result === "今日の晩御飯はウェッブだ！そしておかずもウェッブだ！");
        });
        it("can apply change sets with grouping", () => {
            const pattern = /(博多)の(潮)/g;
            const expected = "伯方($1ではない)の塩($2ではない)";
            const base = "白いご飯と博多の潮！";
            const diffs = collectAll(pattern, base)
                .map(matches => {
                    return new Diff({ pattern, expected, index: matches.index, matches });
                });
            const changeSets = new ChangeSet({ content: base, diffs });
            const result = changeSets.applyChangeSets(base);
            assert(result === "白いご飯と伯方(博多ではない)の塩(潮ではない)！");
        });
        it("can apply change sets with grouping", () => {
            const patternA = /Web/ig;
            const patternB = /火/ig;
            const base = "ある火のWEBと、とある火のwebの話";
            const diffA = collectAll(patternA, base)
                .map(matches => {
                    return new Diff({ pattern: patternA, expected: "Web", index: matches.index, matches });
                });
            const diffB = collectAll(patternB, base)
                .map(matches => {
                    return new Diff({ pattern: patternB, expected: "日", index: matches.index, matches });
                });
            const changeSetsA = new ChangeSet({ content: base, diffs: diffA });
            const changeSetsB = new ChangeSet({ content: base, diffs: diffB });
            const changeSets = changeSetsA.concat(changeSetsB);
            const result = changeSets.applyChangeSets(base);
            assert(result === "ある日のWebと、とある日のWebの話");
        });
    });
    describe(".makeChangeSet", () => {
        it("make change sets", () => {
            const base = "今日はjs明日はts明後日はなんのaltjsですかねぇ？";
            const changeSets = makeChangeSet("tmp.txt", base, /JS/ig, "JS");

            const result = changeSets.applyChangeSets(base);
            assert(result === "今日はJS明日はts明後日はなんのaltJSですかねぇ？");
        });
    });
    describe(".subtract", () => {
        it("subtract changeset from other changeset", () => {
            const base = "次に見るjs（@<list>{hoge-js}）はただのjsではありません。\nしかし、altjs（@<fn>{alt-js}）ほどではないでしょう。";
            const minuend = makeChangeSet("tmp.txt", base, /js/ig, "JS");
            const subtrahend = makeChangeSet("tmp.txt", base, /(@<(?:list|fn)>{.+?})/ig, "$1");

            const changeSets = minuend.subtract(subtrahend);

            const result = changeSets.applyChangeSets(base);
            assert(result === "次に見るJS（@<list>{hoge-js}）はただのJSではありません。\nしかし、altJS（@<fn>{alt-js}）ほどではないでしょう。");
        });
        it("not subtract changeset with over wrapped changeset", () => {
            const base = "js(@<list>{js})js";
            const minuendA = makeChangeSet("tmp.txt", base, /\((.+?)\)/ig, "（$1）");
            const minuendB = makeChangeSet("tmp.txt", base, /JS/ig, "JS");
            const minuend = minuendA.concat(minuendB);
            const subtrahend = makeChangeSet("tmp.txt", base, /(@<(?:list|fn)>{.+?})/ig, "$1");

            const changeSets = minuend.subtract(subtrahend);

            const result = changeSets.applyChangeSets(base);
            assert(result === "JS（@<list>{js}）JS");
        });
    });
    describe(".intersect", () => {
        it("intersect changeset with audit changeset", () => {
            const base = "let foo = 'js';\n// これがjsだ！\n let bar = 'altjs'; /* これもjsだ */\n let buzz = 'jsx';";
            const baseSet = makeChangeSet("tmp.txt", base, /js/igm, "JS");
            const auditA = makeChangeSet("tmp.txt", base, /\/\/\s*(.*?)$/gm, "$1");
            const auditB = makeChangeSet("tmp.txt", base, /\/\*.*?\*\//gm, "$1");
            const audit = auditA.concat(auditB);

            const changeSets = baseSet.intersect(audit);

            const result = changeSets.applyChangeSets(base);
            assert(result === "let foo = 'js';\n// これがJSだ！\n let bar = 'altjs'; /* これもJSだ */\n let buzz = 'jsx';");
        });
    });
});
