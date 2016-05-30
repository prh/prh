<a name="1.0.1"></a>
## [1.0.1](https://github.com/vvakame/prh/compare/1.0.0...v1.0.1) (2016-05-30)


### Bug Fixes

* **prh:** Engine#mergeで別ルールをマージする時にルールの除去を一括で行うようの修正 closes [#18](https://github.com/vvakame/prh/issues/18) ([904b23b](https://github.com/vvakame/prh/commit/904b23b)), closes [#18](https://github.com/vvakame/prh/issues/18)
* **techbooster.yml:** その時間 が警告にならないように修正 ([e1a9e7f](https://github.com/vvakame/prh/commit/e1a9e7f))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/vvakame/prh/compare/0.9.0...v1.0.0) (2016-05-02)

prh is stable.

### Bug Fixes

* **techbooster.yml:** 記事 を 記こと に開かないようにした([5ee3c62](https://github.com/vvakame/prh/commit/5ee3c62))
* **techbooster.yml:** 下記の を 次の と言い換えるように修正([73206fe](https://github.com/vvakame/prh/commit/73206fe))
* **techbooster.yml:** 事実 事体 の 事 を開かないようにした([5ae9ec1](https://github.com/vvakame/prh/commit/5ae9ec1))
* **techbooster.yml:** 事態 を こと態 に開こうとしていたのを修正([1faea5d](https://github.com/vvakame/prh/commit/1faea5d))
* **techbooster.yml:** 仕事 を 仕こと に開こうとしていたのを修正([325f92e](https://github.com/vvakame/prh/commit/325f92e))
* **techbooster.yml:** 変更に を 変さらに に開かないように修正([1a3af91](https://github.com/vvakame/prh/commit/1a3af91))
* **techbooster.yml:** 大事 を 大こと に開こうとしていたのを修正([265ba48](https://github.com/vvakame/prh/commit/265ba48))
* **techbooster.yml:** 良い例 を よい例 に開かないように調整 refs [#12](https://github.com/vvakame/prh/issues/12)([18f785a](https://github.com/vvakame/prh/commit/18f785a))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/vvakame/prh/compare/0.8.0...v0.9.0) (2015-11-02)


### Features

* **prh:** add support regexpMustEmpty field. it is use for mimic of negative lookbehind ([28b025a](https://github.com/vvakame/prh/commit/28b025a))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/vvakame/prh/compare/0.7.0...v0.8.0) (2015-10-25)

v0.8.0 has many BREAKING CHANGE.
sorry, it is not much in the future.

### Features

* **build:** add grunt-conventional-changelog ([b6f4511](https://github.com/vvakame/prh/commit/b6f4511))
* **prh:** implement imports feature ([b3f7214](https://github.com/vvakame/prh/commit/b3f7214))
* **prh:** improve class naming, rename Config to Engine refs #8 ([5f9d931](https://github.com/vvakame/prh/commit/5f9d931))
* **prh:** move function lib/changeset to ChangeSet class ([e87a1c6](https://github.com/vvakame/prh/commit/e87a1c6))
* **prh:** refactor ChangeSet. rename ChangeSet to Diff, create new ChangeType class. ([aa621e7](https://github.com/vvakame/prh/commit/aa621e7))
* **prh:** stop destructive change in ChangeSet#subtract ([19caf01](https://github.com/vvakame/prh/commit/19caf01))
