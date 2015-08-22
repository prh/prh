"use strict";

import r = require("../lib/utils/regexp");

import ChangeSet = require("../lib/changeset");

describe("ChangeSet", () => {
    describe(".applyChangeSets", () => {
        it("can apply change sets. pattern shorten", () => {
            var regexp = /Webだー*/g;
            var expected = "Webさ";
            var base = "今日の晩御飯はWebだーーーーーーー！そしておかずもWebだ！";
            var changeSets = r
                .collectAll(regexp, base)
                .map(result => {
                    return new ChangeSet(regexp, expected, result.index, Array.prototype.slice.call(result));
                });
            var result = ChangeSet.applyChangeSets(base, changeSets);
            assert(result === "今日の晩御飯はWebさ！そしておかずもWebさ！");
        });
        it("can apply change sets. pattern longer", () => {
            var regexp = /Web/g;
            var expected = "ウェッブ";
            var base = "今日の晩御飯はWebだ！そしておかずもWebだ！";
            var changeSets = r
                .collectAll(regexp, base)
                .map(result => {
                    return new ChangeSet(regexp, expected, result.index, Array.prototype.slice.call(result));
                });
            var result = ChangeSet.applyChangeSets(base, changeSets);
            assert(result === "今日の晩御飯はウェッブだ！そしておかずもウェッブだ！");
        });
        it("can apply change sets with grouping", () => {
            var regexp = /(博多)の(潮)/g;
            var expected = "伯方($1ではない)の塩($2ではない)";
            var base = "白いご飯と博多の潮！";
            var changeSets = r
                .collectAll(regexp, base)
                .map(result => {
                    return new ChangeSet(regexp, expected, result.index, Array.prototype.slice.call(result));
                });
            var result = ChangeSet.applyChangeSets(base, changeSets);
            assert(result === "白いご飯と伯方(博多ではない)の塩(潮ではない)！");
        });
        it("can apply change sets with grouping", () => {
            var regexpA = /Web/ig;
            var regexpB = /火/ig;
            var base = "ある火のWEBと、とある火のwebの話";
            var changeSetsA = r
                .collectAll(regexpA, base)
                .map(result => {
                    return new ChangeSet(regexpA, "Web", result.index, Array.prototype.slice.call(result));
                });
            var changeSetsB = r
                .collectAll(regexpB, base)
                .map(result => {
                    return new ChangeSet(regexpB, "日", result.index, Array.prototype.slice.call(result));
                });
            var changeSets = changeSetsA.concat(changeSetsB);
            var result = ChangeSet.applyChangeSets(base, changeSets);
            assert(result === "ある日のWebと、とある日のWebの話");
        });
    });
    describe(".makeChangeSet", () => {
        it("make change sets", () => {
            var base = "今日はjs明日はts明後日はなんのaltjsですかねぇ？";
            var changeSets = ChangeSet.makeChangeSet(base, /JS/ig, "JS");

            var result = ChangeSet.applyChangeSets(base, changeSets);
            assert(result === "今日はJS明日はts明後日はなんのaltJSですかねぇ？");
        });
    });
    describe(".subtract", () => {
        it("subtract changeset from other changeset", () => {
            var base = "次に見るjs（@<list>{hoge-js}）はただのjsではありません。\nしかし、altjs（@<fn>{alt-js}）ほどではないでしょう。";
            var minuend = ChangeSet.makeChangeSet(base, /js/ig, "JS");
            var subtrahend = ChangeSet.makeChangeSet(base, /(@<(?:list|fn)>{.+?})/ig, "$1");

            var changeSets = ChangeSet.subtract(minuend, subtrahend);

            var result = ChangeSet.applyChangeSets(base, changeSets);
            assert(result === "次に見るJS（@<list>{hoge-js}）はただのJSではありません。\nしかし、altJS（@<fn>{alt-js}）ほどではないでしょう。");
        });
        it("not subtract changeset with over wrapped changeset", () => {
            var base = "js(@<list>{js})js";
            var minuendA = ChangeSet.makeChangeSet(base, /\((.+?)\)/ig, "（$1）");
            var minuendB = ChangeSet.makeChangeSet(base, /JS/ig, "JS");
            var minuend = minuendA.concat(minuendB);
            var subtrahend = ChangeSet.makeChangeSet(base, /(@<(?:list|fn)>{.+?})/ig, "$1");

            var changeSets = ChangeSet.subtract(minuend, subtrahend);

            var result = ChangeSet.applyChangeSets(base, changeSets);
            assert(result === "JS（@<list>{js}）JS");
        });
    });
    describe(".intersect", () => {
        it("intersect changeset with audit changeset", () => {
            var base = "var foo = 'js';\n// これがjsだ！\n var bar = 'altjs'; /* これもjsだ */\n var buzz = 'jsx';";
            var baseSet = ChangeSet.makeChangeSet(base, /js/igm, "JS");
            var auditA = ChangeSet.makeChangeSet(base, /\/\/\s*(.*?)$/gm, "$1");
            var auditB = ChangeSet.makeChangeSet(base, /\/\*.*?\*\//gm, "$1");
            var audit = auditA.concat(auditB);

            var changeSets = ChangeSet.intersect(baseSet, audit);

            var result = ChangeSet.applyChangeSets(base, changeSets);
            assert(result === "var foo = 'js';\n// これがJSだ！\n var bar = 'altjs'; /* これもJSだ */\n var buzz = 'jsx';");
        });
    });
});
