# Require fixer functions to return a fix (fixer-return)

✔️ The `"extends": "plugin:eslint-plugin/recommended"` property in a configuration file enables this rule.

In a [fixable](https://eslint.org/docs/developer-guide/working-with-rules#applying-fixes) rule, a fixer function is useless if it never returns anything.

## Rule Details

This rule enforces that a fixer function returns a fix in at least one situation.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/fixer-return: error */

module.exports = {
  create (context) {
    context.report({
      fix (fixer) {
        fixer.insertTextAfter(node, 'foo');
      },
    });
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/fixer-return: error */

module.exports = {
  create (context) {
    context.report({
      fix (fixer) {
        return fixer.insertTextAfter(node, 'foo');
      },
    });
  },
};
```

```js
/* eslint eslint-plugin/fixer-return: error */

module.exports = {
  create (context) {
    context.report({
      fix (fixer) {
        if (foo) {
          return; // no autofix in this situation
        }
        return fixer.insertTextAfter(node, 'foo');
      },
    });
  },
};
```
