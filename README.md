# proofread-helper [![Circle CI](https://circleci.com/gh/vvakame/prh.svg?style=svg)](https://circleci.com/gh/vvakame/prh)

校正を雑にサポートしてくれるライブラリ。

[WEB+DB PRESS用語統一ルール](https://gist.github.com/inao/f55e8232e150aee918b9)と[wzeditor-word-rules-parser](https://github.com/azu/wzeditor-word-rules-parser)を参考にしています。

## インストール

```
$ npm install -g prh
```

## 利用方法

```
$ cat sample.re
= サンプルですよ

ウェッブではクッキーというものがあります。
$ prh sample.re
= サンプルですよ

WebではCookieというものがあります。
```

`--replace`オプションなどと併用すると良いでしょう。

## 目標

[techbooster](http://techbooster.org/)での執筆活動を快適にするぞ。
[@mhidaka](https://twitter.com/mhidaka)がアホみたいに働くのであいつが過労死しないようにしてやる。

## 機能

### 現在の機能

[ルールのサンプル](https://github.com/vvakame/prh/blob/master/misc/sample.yml)

* yamlでルールが書ける
* とりあえず置換できる
* ルールに対するテストをルールの近くに書くことができる
    * もちろん書かなくてもよい
* `--yaml`や`--json`オプション付きで実行すると内部的にどういう正規表現が組み上げられているか確認できる

### あったほうが楽かもしれない機能

* pattern単位でのルール設定
    * 単一patternでのfooと複数パターンでのfooは挙動が違う。具体的に全角英数変換。
* コンフィグファイルの統合
    * 基本、Android用、TypeScript用と作っておいて組み合わせて使う。
* 独自の無視設定の追加
    * 具体的にはRe:VIEWの構文を解釈し`@<list>{module}`とかのmoduleを置換しないようにする。
* 同じexpectedがある場合、後定義を優先してoverrideできるほうがよさそう
* event-streamとか使ったほうがいいのかもわからん…
* xregexpとか使って名前付き後方参照を導入したほうがよいかも…

## 推奨される使い方

[このへん](https://github.com/vvakame/prh/blob/master/misc/WEB%2BDB_PRESS.yml)をベースに、自分(の団体)用のルールセットを定義するのが良いだろう。
