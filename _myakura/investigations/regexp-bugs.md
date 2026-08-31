# Bug Investigation: `lib/utils/regexp.ts`

**Last updated:** 2026-04-27
**Status:** INVESTIGATION COMPLETE — tasks split into [Plan 08](../plans/08-fix-escapeSpecialChars-hyphen/) and [Plan 09](../plans/09-remove-dead-flag-sort/)

## Overview

This document investigates bugs and correctness issues in `lib/utils/regexp.ts`, separate from the [RegExp Modernization](../investigations/regexp-modernization.md) effort which focuses on replacing obsolete workarounds with modern JS features.

Issues found have been split into implementation plans:
- [Plan 08: Fix `escapeSpecialChars()` hyphen & brackets](../plans/08-fix-escapeSpecialChars-hyphen/) — high severity
- [Plan 09: Remove dead flag sort code](../plans/09-remove-dead-flag-sort/) — low severity

---

## Issues Found

### Issue #34: Hyphen Escaping Causes Invalid Regex with `u` Flag (HIGH SEVERITY)

**File:** `lib/utils/regexp.ts:119`
**Status:** Confirmed bug → [Plan 08 created](../plans/08-fix-escapeSpecialChars-hyphen/)

The `escapeSpecialChars()` function escapes `-` with `\-`. Outside character classes, `-` is literal and doesn't need escaping. With the `u` flag (which prh uses via `addDefaultFlags()`), `\-` is an invalid escape sequence.

**Reproduction:**
```javascript
const escape = (str) => str.replace(/[\\*+.?{}()|^$[\]/-]/g, "\\$&");
new RegExp(escape("R-18"), "gmu"); // Error: Invalid escape sequence
new RegExp(escape("[a-z]"), "gmu"); // Error: Invalid escape sequence
```

**Impact:** Any pattern containing `-` or `[` `]` will crash when converted to regex with the `u` flag.

---

### Issue #34 (revisited): Square Bracket Escaping (HIGH SEVERITY)

**File:** `lib/utils/regexp.ts:119`
**Status:** Same as above → [Plan 08](../plans/08-fix-escapeSpecialChars-hyphen/)

The character class `[\\*+.?{}()|^$[\]/-]` includes `]` but has it in the wrong position. In a character class, `]` must be first or properly escaped.

---

### Issue: `equals()` Missing Flags (LOW SEVERITY)

**File:** `lib/utils/regexp.ts:141-155`
**Status:** Tracked in [ROADMAP as Pattern 02](../plans/02-complete-equals-flag-check/)

The `equals()` function only checks `global`, `ignoreCase`, and `multiline` flags. It misses `unicode`, `sticky`, and `dotAll`.

```typescript
export function equals(a: RegExp, b: RegExp) {
    // ... checks source, global, ignoreCase, multiline
    return true; // missing unicode, sticky, dotAll
}
```

This is tracked as [Pattern 02 in the ROADMAP](../plans/02-complete-equals-flag-check/).

---

### Issue: `parseRegExpString()` Drops `u` and `s` Flags (MEDIUM SEVERITY)

**File:** `lib/utils/regexp.ts:1`
**Status:** FIXED — PR #93 opened

The regex `/^\/(.*)\/([gimy]*)$/` only recognizes `g`, `i`, `m`, `y` flags. `u` and `s` are silently dropped.

```typescript
const regexpRegexp = /^\/(.*)\/([gimsuy]*)$/;  // Fixed
```

If a user writes `/pattern/us` in YAML, the `u` and `s` flags would be lost. However, `addDefaultFlags()` adds `gmu` by default, so this may not manifest in practice for most cases.

This was fixed in [Pattern 04 in the ROADMAP](../plans/04-update-parseRegExpString-flags/) — PR #93.

---

### Issue: Flag Sorting in `concat()` and `combine()` (LOW SEVERITY)

**File:** `lib/utils/regexp.ts:21, 47`
**Status:** → [Plan 09 created](../plans/09-remove-dead-flag-sort/)

Dead code: `arg.flags.split("").sort()` is called but the result is discarded. Should be removed.

### Issue: `concat()` Returns Empty Flags

**File:** `lib/utils/regexp.ts:36`
**Status:** NOT A BUG — `addDefaultFlags()` adds flags when needed

When `concat()` is called with only strings, `foundRegExp` remains `false` and `prevFlags` is `""`. This returns a RegExp with no flags. But `addDefaultFlags()` is always called after `concat()` in practice, so this is not a problem.

---

## Issues Not in This File

### Issue #32, #40: `$1` Reference in Combined Alternation

**Files:** `lib/utils/regexp.ts:39-64` (`combine()`), `lib/changeset/diff.ts` (`replace()`)
**Status:** Design issue, documented in [`issue-32.md`](issue-32.md) and [`issue-40.md`](issue-40.md)

When `patterns` is an array, `combine()` creates alternation with each pattern's capture group. But `$1` in `expected` always refers to the first alternation's group.

---

## Summary

| Bug | Severity | Status | Plan |
|-----|----------|--------|------|
| Hyphen/bracket escaping (`\-`) | High | Bug confirmed | [Plan 08](../plans/08-fix-escapeSpecialChars-hyphen/) |
| `equals()` missing flags | Low | Known | [Pattern 02](../plans/02-complete-equals-flag-check/) — PR #91 |
| `parseRegExpString` drops flags | Medium | FIXED | [Pattern 04](../plans/04-update-parseRegExpString-flags/) — PR #93 |
| Flag sorting dead code | Low | Bug confirmed | [Plan 09](../plans/09-remove-dead-flag-sort/) |
| `concat()` empty flags | — | Not a bug | N/A |