# Disallow unnecessary calls to `sourceCode.getFirstToken()` and `sourceCode.getLastToken()` (no-useless-token-range)

✔️ The `"extends": "plugin:eslint-plugin/recommended"` property in a configuration file enables this rule.

⚒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#--fix) can automatically fix some of the problems reported by this rule.

AST nodes always start and end with tokens. As a result, the start index of the first token in a node is the same as the start index of the node itself, and the end index of the last token in a node is the same as the end index of the node itself. Using code like `sourceCode.getFirstToken(node).range[0]` unnecessarily hurts the performance of your rule, and makes your code less readable.

## Rule Details

This rule aims to avoid unnecessary calls to `sourceCode.getFirstToken()` and `sourceCode.getLastToken()`.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/no-useless-token-range: error */

module.exports = {
  create (context) {
    const sourceCode = context.getSourceCode();

    const rangeStart = sourceCode.getFirstToken(node).range[0];
    const rangeEnd = sourceCode.getLastToken(node).range[1];
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/no-useless-token-range: error */

module.exports = {
  create (context) {
    const sourceCode = context.getSourceCode();

    const rangeStart = node.range[0];
    const rangeEnd = node.range[1];
  },
};
```

## Known Limitations

* To ensure that your `SourceCode` instances can be detected, your rule must assign `context.getSourceCode()` to a variable somewhere.

## Further Reading

* [`SourceCode` API](https://eslint.org/docs/developer-guide/working-with-rules#contextgetsourcecode)
