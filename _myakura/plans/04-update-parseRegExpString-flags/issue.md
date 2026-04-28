# Update `parseRegExpString` to Support Modern Flags

**Last updated:** 2026-04-29
**Status:** IMPLEMENTED (upstream PR #93)

## Background

The `parseRegExpString()` function parses user-written regexp literals from YAML config strings (e.g., `/pattern/gi`).

## Problem

The flag capture regex `/^\/(.*)\/([gimy]*)$/` only recognizes `g`, `i`, `m`, and `y` flags. It silently drops `u` (unicode) and `s` (dotAll) flags. If a user writes `/pattern/us` in their YAML config, those flags would be lost, potentially causing incorrect matching behavior.

## Solution

Update the flag capture regex to include `u` and `s`: `/^\/(.*)\/([gimsuy]*)$/`.

## Changes

- Update `regexpRegexp` constant in `lib/utils/regexp.ts` (line 1)
- Add tests for `u`, `s`, and combined modern flags in `test/utils/regexpSpec.ts`

## Migration

None required. This is a bug fix — previously valid flags were silently dropped.

## PR

- Upstream PR #93: https://github.com/prh/prh/pull/93
