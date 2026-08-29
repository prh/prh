export interface Config {
    /**
     * 設定ファイル形式のバージョンを指定します。
     * @example 1
     */
    version: number;
    /** ルールセットのメタデータを指定します。この値は校正処理には影響しません。 */
    meta?: { [key: string]: unknown }; // NOTE prh本体は参照しない 設定ファイルの仕様として定義している
    /**
     * 現在の設定へ統合する別の設定ファイルを指定します。パスは現在の設定ファイルを基準に解決されます。
     * @example "./prh-rules/media/techbooster.yml"
     * @example ["./prh-rules/media/techbooster.yml", "./prh-rules/files/markdown.yml"]
     * @example [{ "path": "./prh-rules/media/techbooster.yml", "ignoreRules": ["/テストB/gmu"] }]
     */
    imports?: string | (string | ImportSpec)[];
    /**
     * ファイルパスごとに、ファイル内で校正対象とする範囲と除外する範囲を指定します。
     * @example [{ "file": "/\\.md$/", "excludes": ["/`.*?`/"] }]
     */
    targets?: Target[];
    /**
     * 適用する校正ルールを指定します。文字列を指定すると、その文字列を`expected`に指定したルールとして扱われます。
     * @example ["Cookie", { "expected": "デフォルト", "pattern": "ディフォルト" }]
     */
    rules?: (string | Rule)[]; // string | regexp style string or array
}

export interface ImportSpec {
    /**
     * 統合する設定ファイルのパスを指定します。パスは現在の設定ファイルを基準に解決されます。
     * @example "./prh-rules/media/techbooster.yml"
     */
    path: string;
    /**
     * `true`の場合、指定した設定ファイル内の`imports`を処理しません。
     * @default false
     */
    disableImports?: boolean;
    /**
     * 指定した設定ファイルから読み込まれたルールのうち、統合から除外するルールを指定します。要素に文字列を指定した場合は、同じ文字列を`pattern`に指定したものとして扱われます。
     * @example ["/テストB/gmu"]
     * @example [{ "expected": "テストA" }]
     */
    ignoreRules?: (string | IgnoreRule)[]; // when string coming, evaluate to { pattern: string; }
}

export interface IgnoreRule {
    /**
     * 除外するルールを、照合用正規表現を表す文字列で指定します。たとえば、`pattern: テストB`のルールを除外する場合は`/テストB/gmu`を指定します。
     * `pattern`を省略したルールでは`expected`から生成された正規表現になるため、`prh --rules-yaml`の出力で実際の値を確認してください。
     * @example "/テストB/gmu"
     */
    pattern?: string;
    /**
     * 除外するルールを、校正後に期待する文字列で指定します。
     * @example "テストA"
     */
    expected?: string;
}

export interface Target {
    /**
     * 校正範囲の設定を適用するファイルパスに一致する文字列または正規表現形式の文字列を指定します。
     * @example "/\\.md$/"
     * @example "/\\.re$/"
     */
    file: string; // string | regexp style string
    /**
     * ファイル内で校正対象とする範囲を指定します。複数指定した場合は、いずれかに一致する範囲が対象になります。
     * @example ["/\\/\\/.*$/"]
     */
    includes?: (string | TargetPattern)[];
    /**
     * ファイル内で校正対象から除外する範囲を指定します。`includes`と`excludes`の両方に一致する範囲は除外されます。
     * @example ["/`.*?`/", "/\\[[^\\]]*\\]\\([^)]+\\)/"]
     * @example [{ "pattern": "/^#@.*$/" }]
     */
    excludes?: (string | TargetPattern)[];
}

export interface TargetPattern {
    /**
     * ファイル内の範囲に一致する文字列または正規表現形式の文字列を指定します。
     * @example "/^#@.*$/"
     */
    pattern: string; // string | regexp style string
}

export interface Rule {
    /**
     * 校正後に期待する文字列を指定します。`pattern`のキャプチャグループを`$1`の形式で参照できます。
     * @example "ソフトウェア"
     * @example "（$1）"
     */
    expected: string;
    /**
     * 修正対象に一致する文字列、正規表現形式の文字列、またはそれらの配列を指定します。
     * `pattern`と`patterns`のどちらも省略した場合は`expected`からパターンを生成します。
     * @example "ディフォルト"
     * @example "/サーバ(?!ー)/"
     * @example ["ハードウエアー", "ハードウェアー", "ハードウエア"]
     */
    pattern?: string | string[] | null; // string | regexp style string or array
    /**
     * 修正対象に一致する文字列、正規表現形式の文字列、またはそれらの配列を指定します。`pattern`の別名であり、両方を指定すると`pattern`が優先されます。両方を省略すると`expected`からパターンを生成します。
     * @example ["ハードウエアー", "ハードウェアー", "ハードウエア"]
     */
    patterns?: string | string[] | null; // string | regexp style string or array
    /**
     * `pattern`のキャプチャグループが空であることをルールの適用条件として指定します。対象のグループは`$1`の形式で指定します。
     * @example "$1"
     */
    regexpMustEmpty?: string;
    /**
     * ルールの照合に使用するオプションを指定します。
     * @example { "wordBoundary": true }
     */
    options?: Options;
    /**
     * ルールの変換結果を検証するテストケースを指定します。期待と異なる場合は設定ファイルの読み込みに失敗します。
     * @example [{ "from": "jquery", "to": "jQuery" }, { "from": "ＪＱＵＥＲＹ", "to": "jQuery" }]
     */
    specs?: RuleSpec[];
    /**
     * 外部ツール向けの補足メッセージを指定します。この値はprh本体の校正処理には影響しません。
     * @example "半角カッコの代わりに全角カッコを使うこと。文字のバランスが崩れるためです"
     */
    prh?: string; // NOTE prh本体は参照しない Rule#raw 経由で外部ツールが参照する
}

export interface Options {
    /**
     * `true`の場合、照合用の正規表現の前後に単語境界（`\b`）を追加します。
     * @default false
     */
    wordBoundary?: boolean;
}

export interface RuleSpec {
    /**
     * ルールのテストに使用する入力文字列を指定します。
     * @example "ＪＱＵＥＲＹ"
     */
    from: string;
    /**
     * 入力文字列にルールを適用した結果として期待する文字列を指定します。
     * @example "jQuery"
     */
    to: string;
}
