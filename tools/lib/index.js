const path = require("path");
const fs = require("fs");

const parser = require("wzeditor-word-rules-parser");
const yaml = require("js-yaml");

const content = fs.readFileSync(path.join(__dirname, "../webdb-rules.rel"), "utf-8");
const result = parser.parse(content);

const prhResult = {
  version: 1,
  rules: result.map(v => {
    let pattern = v.pattern;
    let expected = v.expected;
    let flag = v.flag || "";
    return {
      expected,
      pattern: ` /${pattern}/${flag}`,
    };
  })
};
const yamlContent = yaml.dump(prhResult);
console.log(yamlContent.replace(/pattern: '(.+)'\n/gm, "pattern: $1\n"));
