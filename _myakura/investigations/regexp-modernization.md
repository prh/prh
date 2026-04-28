# RegExp Modernization Investigation

**Last updated:** 2026-04-27
**Status:** Patterns 01, 07 merged (PR #86, #87); Pattern 03 PR #92 opened; Pattern 06 done locally

## Overview

The prh codebase was written when JavaScript's RegExp support was significantly more limited. Several workarounds and manual implementations exist that can now be replaced with modern ECMAScript features, since the project targets **ES2020** (`tsconfig.json`).

This investigation identifies 6 patterns that can be modernized, ordered by implementation difficulty (easiest first).

---

## 1. Remove `supportRegExpUnicodeFlag` Runtime Detection

**File:** `lib/utils/regexp.ts:7-14`
**Difficulty:** Trivial
**Impact:** Low (cleanup)

### Current Code

```typescript
export const supportRegExpUnicodeFlag = (() => {
    try {
        new RegExp("", "u");
        return true;
    } catch (e) {
        return false;
    }
})();
```

Used in `addDefaultFlags()` (line 119-128):

```typescript
export function addDefaultFlags(regexp: RegExp) {
    let flags = "gm";
    if (supportRegExpUnicodeFlag) {
        flags += "u";
    }
    if (regexp.ignoreCase) {
        flags += "i";
    }
    return new RegExp(regexp.source, flags);
}
```

### Problem

The `u` flag was introduced in ES2015 and is universally supported in all modern JS engines. The project targets ES2020, making this runtime check completely unnecessary. It adds dead code and a conditional branch that always evaluates to `true`.

### Solution

Delete the IIFE entirely. Unconditionally use the `u` flag in `addDefaultFlags()`:

```typescript
export function addDefaultFlags(regexp: RegExp) {
    let flags = "gmu";
    if (regexp.ignoreCase) {
        flags += "i";
    }
    return new RegExp(regexp.source, flags);
}
```

---

## 2. Complete `equals()` Flag Comparison

**File:** `lib/utils/regexp.ts:156-171`
**Difficulty:** Low
**Impact:** Low (correctness fix)

### Current Code

```typescript
export function equals(a: RegExp, b: RegExp) {
    if (a.source !== b.source) {
        return false;
    }
    if (a.global !== b.global) {
        return false;
    }
    if (a.ignoreCase !== b.ignoreCase) {
        return false;
    }
    if (a.multiline !== b.multiline) {
        return false;
    }
    return true;
}
```

### Problem

Only checks `global`, `ignoreCase`, and `multiline` flags. Missing `unicode`, `sticky`, and `dotAll` — all standard since ES2015/ES2018. Two RegExps with identical sources but different `u` flags would incorrectly be reported as equal.

### Solution

Add checks for the missing flags:

```typescript
if (a.unicode !== b.unicode) {
    return false;
}
if (a.sticky !== b.sticky) {
    return false;
}
if (a.dotAll !== b.dotAll) {
    return false;
}
```

---

## 3. Replace `collectAll()` with `String.prototype.matchAll()`

**File:** `lib/utils/regexp.ts`
**Difficulty:** Trivial
**Impact:** Low (code simplification)
**Status:** DONE — PR #92 merged

### Problem

The custom `collectAll()` function manually iterates over regex matches using `RegExp.exec()`. This duplicates native functionality available since ES2020 via `String.prototype.matchAll()`.

### Solution (Implemented)

- Removed `collectAll()` function entirely from `lib/utils/regexp.ts`
- Updated `lib/rule.ts` to use `[...content.matchAll(this.pattern)]`
- Updated `lib/changeset/index.ts` to use `[...content.matchAll(pattern)]`
- Updated tests to use `matchAll()` directly

This removes ~20 lines of custom code with no behavior change.

---

## 4. Update `parseRegExpString` to Support Modern Flags

**File:** `lib/utils/regexp.ts:1`
**Difficulty:** Low
**Impact:** Medium (correctness for user-facing YAML)
**Status:** DONE — PR #93 opened

### Current Code

```typescript
const regexpRegexp = /^\/(.*)\/([gimsuy]*)$/;
```

### Problem

Only captures `g`, `i`, `m`, `y` flags. Missing `u` and `s` (dotAll). If a user writes `/pattern/us` in their YAML config, the `u` and `s` flags would be silently dropped.

### Solution (Implemented)

Updated the flag capture regex to include `u` and `s` flags. Added tests for `u`, `s`, and combined modern flags.

Note: `y` (sticky) is already included but rarely used. `d` (hasIndices, ES2022) and `v` (unicodeSets, ES2024) could be added later if needed.

---

## 5. Modernize `jpKanji` Surrogate Pairs

**File:** `lib/utils/regexp.ts:20`
**Difficulty:** Medium
**Impact:** Medium (readability and correctness)

### Current Code

```typescript
export const jpKanji = /(?:[々〇〻\u3400-\u9FFF\uF900-\uFAFF]|[\uD840-\uD87F][\uDC00-\uDFFF])/;
```

### Problem

Manually encodes surrogate pairs for CJK Unified Ideographs Extension B. This is hard to read, error-prone, and was necessary before the `u` flag was available. With the `u` flag, code point escapes can be used directly.

### Solution

Option A — Code point escapes with `u` flag:

```typescript
export const jpKanji = /(?:[々〇〻\u3400-\u9FFF\uF900-\uFAFF]|\u{20000}-\u{2A6DF}|\u{2F800}-\u{2FA1F})/u;
```

Option B — Unicode property escape (simplest but broader):

```typescript
export const jpKanji = /[\p{Script=Han}々〇〻]/u;
```

Option B may match more characters than the original (e.g., simplified Chinese Han characters), so Option A is safer for maintaining exact compatibility.

---

## 6. Deprecate `regexpMustEmpty` — Negative Lookbehind Substitute

**Files:** `lib/rule.ts:14,58,137-148`, `lib/raw.ts:34`, `misc/prh.yml:74`
**Difficulty:** Medium
**Impact:** Non-breaking (deprecation warning only)

### Current Code

**`lib/rule.ts:137-148`:**

```typescript
// JavaScriptでの正規表現では /(?<!記|大)事/ のような書き方ができない
// /(記|大)事/ で regexpMustEmpty $1 の場合、第一グループが空じゃないとマッチしない、というルールにして回避
if (this.regexpMustEmpty) {
    const match = /^\$([0-9]+)$/.exec(this.regexpMustEmpty);
    if (match == null) {
        throw new Error(`${this.expected} target failed. please use $1 format.`);
    }
    const index = parseInt(match[1], 10);
    if (matches[index]) {
        return null;
    }
}
```

**`lib/raw.ts:34`:**

```typescript
regexpMustEmpty?: string;
```

**`misc/prh.yml:74` (comment):**

```yaml
# 否定戻り先読みが欲しいがJSにはない… regexpMustEmptyで、特定のキャプチャグループが空であることを指定して代用とする
```

### Problem

This entire feature exists as a workaround for JavaScript lacking negative lookbehind. ES2018 introduced variable-length negative lookbehind `(?<!...)`, making this workaround obsolete.

Users currently write:

```yaml
pattern: /(記|大)事/
regexpMustEmpty: $1
```

With native lookbehind, they can write:

```yaml
pattern: /(?<!記|大)事/
```

However, there are many existing YAML rule files using `regexpMustEmpty` in the wild (see [GitHub search](https://github.com/search?type=code&q=regexpMustEmpty+language%3AYAML&l=YAML)), so removal is not feasible.

### Solution

**Deprecation path:**

- Keep the field and logic intact (no breaking changes)
- Add a `console.warn()` when `regexpMustEmpty` is used
- Update comments in `misc/prh.yml` to note that native lookbehind is preferred
- Document the migration path in README

```typescript
if (this.regexpMustEmpty) {
    console.warn(`regexpMustEmpty is deprecated. Use native negative lookbehind (?<!...) in your pattern instead.`);
    const match = /^\$([0-9]+)$/.exec(this.regexpMustEmpty);
    // ... rest unchanged
}
```

### Affected Files

| File           | Lines   | Change                  |
| -------------- | ------- | ----------------------- |
| `lib/rule.ts`  | 137-148 | Add deprecation warning |
| `misc/prh.yml` | 74      | Update comment          |

---

## Summary

- 01: Remove `supportRegExpUnicodeFlag`
    - Trivial. 1 IIFE deleted, 1 function simplified — **DONE** (PR #86 merged)
- 02: Complete `equals()` flag check
    - Low. Add 3 flag comparisons — **DONE** (PR #91 opened)
- 03: Replace `collectAll` with `matchAll`
    - Trivial. 1 function → one-liner — **DONE** (PR #92 merged)
- 04: Update `parseRegExpString` flags
    - Low. 1 regex pattern update — **DONE** (PR #93 opened)
- 05: Modernize `jpKanji` surrogate pairs
    - Medium. Unicode range rewrite
- 06: Remove `regexpMustEmpty`
    - High. Removes field, interface, logic, comments

| #   | Feature Used                  | ES Version    | Node |
| --- | ----------------------------- | ------------- | ---- |
| 01  | `u` flag                      | ES2015        | v10+ |
| 02  | `unicode`, `sticky`, `dotAll` | ES2015/ES2018 | v10+ |
| 03  | `String.matchAll()`           | ES2020        | v14+ | DONE (PR #92) |
| 04  | `s` flag                      | ES2018        | v12+ |
| 05  | `\u{...}` + `u` flag          | ES2015        | v10+ |
| 06  | Negative lookbehind           | ES2018        | v10+ |

All changes are enabled by the project's ES2020 target. Patterns 01-05 are non-breaking. Pattern 06 is a breaking change for users of `regexpMustEmpty` in their YAML rules.

All features used here are available in every currently maintained Node.js LTS line (v20, v22, v24). No minimum version bump is required.
