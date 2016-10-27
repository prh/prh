# proofread-helper [![Circle CI](https://circleci.com/gh/prh/prh.svg?style=svg)](https://circleci.com/gh/prh/prh)

あなたの校正を手伝ってくれるライブラリ。

今まで、校正作業は主に編集のフェーズの作業でした。
これからは校正情報を編集者が作り、著者が執筆しながら自分で校正を行うようになります。

## インストール

自分のライブラリに組み込んで使う場合。

```
$ npm install --save prh
```

コマンドラインツールとして使う場合。

```
$ npm install -g prh
```

## 利用方法

### 設定ファイルの作成

基本的な書き方については[misc/prh.yml](https://github.com/prh/prh/blob/master/misc/prh.yml)を参照。

実用するための設定ファイルは[prh/rulesのmedia/techbooster.yml](https://github.com/prh/rules/blob/master/media/techbooster.yml)をおすすめする。

その他、[prh/rules](https://github.com/prh/rules)に各種設定を取り揃えてあるので、好きに組み合わせて使ってほしい。

### コマンドラインツールとして

テキストファイルであれば、どのようなファイルであっても処理対象にすることができます。

```
$ prh --help
  Usage: prh [options] [command] [--] <files...>

  Options:

    --json          rule set to json
    --yaml          rule set to parsed yaml
    --rules <path>  path to rule yaml file
    -r, --replace   replace input files


  Commands:

    init  generate prh.yml

$ cat sample.md
# サンプルですよ

ウェッブではクッキーというものがあります。

$ prh sample.md
# サンプルですよ

WebではCookieというものがあります。
```

実際に利用する時は`--replace`オプションを併用すると良い。
注意点として、prh単体の利用ではMarkdownやRe:VIEWなどのファイルの構造は考慮しない。
そのため、URLの一部が変換されてしまうなどの使いにくさがある。
実際に利用する際はprhが組み込まれている何らかのツールを介して使うのがよいだろう。

## 関連ツール

Atomのプラグインである[language-review](https://atom.io/packages/language-review)に組み込まれている。
エディタ上で執筆を行っていくと、自動的に校正候補が表示され、その結果を原稿に反映していくことができる。

azuさんが作成している[textlint](https://www.npmjs.com/package/textlint)のプラグインとして[textlint-rule-prh](https://www.npmjs.com/package/textlint-rule-prh)が作成されている。
