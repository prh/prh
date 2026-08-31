# ROADMAP: RegExp Modernization

**Last updated:** 2026-04-29
**Status:** 6/9 patterns complete (01, 07 merged; 02 PR #91 opened; 03 PR #92 opened; 04 PR #93 opened; 06 done locally)

## Overview

Modernize regexp patterns and workarounds in prh that were written when JavaScript's RegExp support was limited. The project targets ES2020, making several workarounds obsolete.

Ordered by implementation difficulty (easiest first) to help maintainers understand the problem space and review patches incrementally.

---

## Tasks

- [x] [01: Remove `supportRegExpUnicodeFlag` runtime detection](01-remove-unicode-flag-detection/) — **IMPLEMENTED** (upstream PR #86, merged)
- [x] [02: Complete `equals()` flag comparison](02-complete-equals-flag-check/) — **IMPLEMENTED** (upstream PR #91)
- [x] [03: Replace `collectAll()` with `matchAll()`](03-replace-collectAll-with-matchAll/) — **IMPLEMENTED** (upstream PR #92)
- [x] [04: Update `parseRegExpString` to support modern flags](04-update-parseRegExpString-flags/) — **IMPLEMENTED** (upstream PR #93)
- [ ] [05: Modernize `jpKanji` surrogate pairs](05-modernize-jpKanji-surrogate-pairs/)
- [ ] [06: Deprecate `regexpMustEmpty` workaround](06-remove-regexpMustEmpty/)
- [x] [07: Fix `escapeSpecialChars()` yen sign](07-fix-escapeSpecialChars/) — **IMPLEMENTED** (upstream PR #87, merged)
- [ ] [08: Fix `escapeSpecialChars()` hyphen & brackets](08-fix-escapeSpecialChars-hyphen/) — Issue #34
- [ ] [09: Remove dead flag sort in `concat()` and `combine()`](09-remove-dead-flag-sort/)

---

## Dependencies

```
01 (unicode flag detection) ──┬── 05 (jpKanji surrogate pairs)
                               └── 02 (equals flag check)
03 (collectAll → matchAll) ── independent, upstream PR #92 opened
04 (parseRegExpString flags) ── independent, PR #93 opened
06 (regexpMustEmpty) ───────── independent
02 (equals flag check) ─────── upstream PR #91 opened
07 (escapeSpecialChars yen) ─── upstream PR #87 merged ✓
08 (escapeSpecialChars hyphen) ── independent (follow-up to PR #87)
09 (dead flag sort) ─────────── independent
```

## Impact Summary

| #   | Difficulty | Breaking?        | Review Effort |
| --- | ---------- | ---------------- | ------------- |
| 01  | Trivial    | No               | Minimal       |
| 02  | Low        | No               | Minimal       |
| 03  | Trivial    | No               | Minimal       |
| 04  | Low        | No               | Low           |
| 05  | Medium     | No               | Moderate      |
| 06  | Medium     | No (deprecation) | Low           |
| 07  | Trivial    | No (bug fix)     | Minimal       |
| 08  | Trivial    | No (bug fix)     | Minimal       |
| 09  | Trivial    | No (cleanup)     | Minimal       |

---

## Notes

- Tasks 01-05 are non-breaking internal cleanups
- Task 06 (`regexpMustEmpty`) is a deprecation warning — the field and logic are kept for backward compatibility
- Task 07 (`escapeSpecialChars`) fixed the yen sign — PR #87 merged
- Task 08 (`escapeSpecialChars`) fixes hyphen and bracket escaping — Issue #34 (NOT fixed by PR #87)
- Task 09 (`concat`/`combine`) removes dead flag sort code — cosmetic fix
- Full investigation: [`../investigations/regexp-modernization.md`](../investigations/regexp-modernization.md)
- Bug investigation: [`../investigations/regexp-bugs.md`](../investigations/regexp-bugs.md)
