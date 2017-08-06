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

基本的な書き方については[misc/prh.yml](https://github.com/prh/prh/blob/master/misc/prh.yml)を参照してください。

実用するための設定ファイルは[prh/rulesのmedia/techbooster.yml](https://github.com/prh/rules/blob/master/media/techbooster.yml)がおすすめです。

その他、[prh/rules](https://github.com/prh/rules)に各種設定を取り揃えてあるので、好きに組み合わせてご利用ください。

### コマンドラインツールとして

テキストファイルであれば、どのようなファイルであっても処理対象にすることができます。

```
$ prh --help
  Usage: prh [options] [command] [--] <files...>

  Options:

    --json          emit rule set by json
    --yaml          emit rule set by yaml
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

実際に利用する時は `--replace` オプションを併用すると便利です。

### 修正点を意図的に無視させる

prh単体の利用ではMarkdownやRe:VIEWなどのファイルの構造は考慮できません。
そのため、URLの一部が変換されてしまったりします。
他にも意図的に指摘内容を無視したい場合があります。

そんな時、 `prh:disable` プラグマを使うことができます。
prhは文章を段落毎に処理し、段落にプラグマが含まれる場合大本のルールよりそちらの支持を優先します。
具体例を見ていきましょう。

```
#@# prh:disable
ここの段落は全く校正されない。

#@# prh:disable:web
web→Webの校正ルールがある場合。
ここの段落はwebというワードが含まれていても無視するよう指定されているので警告されない。

#@# prh:disable:web|jquery|[abc]
無視ルールは正規表現として解釈されるため複雑な条件も記述できる。

ルールは後置することもできる。
#@# prh:disable
```

こんな塩梅です。
この例はRe:VIEWのコメント記法を使っていますが、お使いのフォーマットでコメントと解釈される任意の構造を使うことができます。
Markdownであれば `<!-- prh:disable -->` とすることができるかもしれません。
このため、無視するルールの記述に半角スペースを利用することができなくなっています。
代わりに `\s` などを使ってください。

## 関連ツール

Atomのプラグインである[language-review](https://atom.io/packages/language-review)に組み込まれています。
エディタ上で執筆を行うと自動的に校正候補が表示され、その結果を原稿に反映していくことができます。

azuさんが作成している[textlint](https://www.npmjs.com/package/textlint)のプラグインとして[textlint-rule-prh](https://www.npmjs.com/package/textlint-rule-prh)が作成されています。
