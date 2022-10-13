# Require fixer functions to return a fix (`eslint-plugin/fixer-return`)

✅ This rule is enabled in the `recommended` config.

<!-- end rule header -->

In a [fixable](https://eslint.org/docs/developer-guide/working-with-rules#applying-fixes) rule, a fixer function is useless if it never returns anything.

## Rule Details

This rule enforces that a fixer function returns a fix in at least one situation.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/fixer-return: error */

module.exports = {
  create(context) {
    context.report({
      fix(fixer) {
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
  create(context) {
    context.report({
      fix(fixer) {
        return fixer.insertTextAfter(node, 'foo');
      },
    });
  },
};
```

```js
/* eslint eslint-plugin/fixer-return: error */

module.exports = {
  create(context) {
    context.report({
      fix(fixer) {
        if (foo) {
          return; // no autofix in this situation
        }
        return fixer.insertTextAfter(node, 'foo');
      },
    });
  },
};
```
