# Require rules to implement a `meta.fixable` property (require-meta-fixable)

✔️ The `"extends": "plugin:eslint-plugin/recommended"` property in a configuration file enables this rule.

ESLint requires fixable rules to specify a valid `meta.fixable` property (with value `code` or `whitespace`).

## Rule Details

This rule aims to require fixable ESLint rules to have a valid `meta.fixable` property.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-fixable: "error" */

module.exports = {
  meta: {}, // missing `fixable` property
  create (context) {
    context.report({
      node,
      message: 'foo',
      fix (fixer) {
        return fixer.remove(node);
      },
    });
  },
};
```

```js
/* eslint eslint-plugin/require-meta-fixable: "error" */

module.exports = {
  meta: { fixable: 'not a valid meta.fixable value' },
  create (context) {
    context.report({
      node,
      message: 'foo',
      fix (fixer) {
        return fixer.remove(node);
      },
    });
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-fixable: "error" */

module.exports = {
  meta: { fixable: 'code' },
  create (context) {
    context.report({
      node,
      message: 'foo',
      fix (fixer) {
        return fixer.remove(node);
      },
    });
  },
};
```

```js
/* eslint eslint-plugin/require-meta-fixable: "error" */

module.exports = {
  meta: {},
  create (context) {
    context.report({
      node,
      message: 'foo',
    });
  },
};
```

## Further Reading

* [ESLint's autofix API](http://eslint.org/docs/developer-guide/working-with-rules#applying-fixes)
* [ESLint's rule basics mentioning `meta.fixable`](https://eslint.org/docs/developer-guide/working-with-rules#rule-basics)
