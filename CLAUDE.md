# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

prh (proofreading helper) はYAMLベースのルールセットを使って日本語テキストの表記揺れを検出・修正する校正ツール。CLIツールとしてもライブラリとしても動作する。

## コマンド

```bash
# ビルド（TypeScriptコンパイル）
npm run build

# テスト（ビルド + vitest）
npm test

# lint
npm run lint

# フォーマット
npm run format

# gitサブモジュール更新（prh-rules）
npm run update-submodules
```

vitestはTypeScriptソースを直接実行するが、`npm test`はビルドも行う（`npm run build && vitest run`）。

## CI

GitHub Actions（`.github/workflows/ci.yml`）でCI実行。master へのpush/PRで `npm ci`、`npm run build`、`npm test` を実行。サブモジュール（prh-rules）は自動チェックアウトされる。

## アーキテクチャ

### 処理パイプライン

```
YAML設定 → Engine → テキストをParagraphに分割 → Ruleを適用 → Diff生成 → ChangeSet
```

1. **`lib/index.ts`** — 公開API。YAML設定の読み込み、importsの再帰的解決、`Engine`インスタンスの生成
2. **`lib/engine.ts`** — `Engine`クラス。ルールとターゲットを保持。テキストを空行区切りで`Paragraph`に分割し、ルールを適用して`ChangeSet`を生成。ターゲットによるinclude/excludeフィルタリングも担当
3. **`lib/rule.ts`** — `Rule`クラス。YAMLのルール定義を`RegExp`パターンに変換。patternが未指定の場合、`expected`値から`spreadAlphaNum`で半角/全角のバリエーションを自動生成。`regexpMustEmpty`はJSに否定後読みがないことへの回避策
4. **`lib/paragraph.ts`** — `Paragraph`クラス。`prh:disable`プラグマ（`#@# prh:disable`や`<!-- prh:disable -->`）によるチェック無効化を処理
5. **`lib/changeset/`** — `ChangeSet`（ファイル単位のdiff集合）と`Diff`（単一の置換）。ターゲットフィルタリング用の集合演算（`intersect`, `subtract`, `concat`）をサポート
6. **`lib/utils/regexp.ts`** — 正規表現ユーティリティ: `spreadAlphaNum`（半角/全角展開）、`addBoundary`、`parseRegExpString`、`combine`、`concat`
7. **`lib/raw.ts`** — YAML設定構造のTypeScriptインターフェース定義
8. **`lib/cli.ts`** — `commander`を使ったCLI実装

### 設計上の重要ポイント

- `Engine.merge()`はルールを`expected`値で重複排除する — 同じ`expected`を持つ後からのimportは無視される
- ルールは構築時に`specs`（from/toのテストケース）を検証し、不正なルールは即座にエラーを投げる
- コンパイル済みの`.js`、`.js.map`、`.d.ts`ファイルは`.ts`ソースと同じディレクトリに出力される（別ディレクトリへの出力なし）

## リリース手順

1. `npm version patch`（またはminor/major）でpackage.jsonのバージョン更新・コミット・gitタグ作成
2. `git push && git push --tags` でリモートに反映
3. GitHub上でそのタグからReleaseを作成
4. `.github/workflows/publish.yml` が自動的にトリガーされ、npmにpublishされる

## コードスタイル

- TypeScript strictモード、ターゲットES2020/CommonJS
- lint: eslint + typescript-eslint（`eslint.config.mjs`）— prefer-const、prefer-template、eqeqeq、no-var等
- フォーマット: prettier（`prettierrc.json`）— eslint-config-prettierでlintとの競合を回避
- `npm run lint`でlintチェック、`npm run format`でフォーマット適用
