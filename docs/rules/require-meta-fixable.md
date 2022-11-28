# Require rules to implement a `meta.fixable` property (`eslint-plugin/require-meta-fixable`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

<!-- end auto-generated rule header -->

ESLint requires fixable rules to specify a valid `meta.fixable` property (with value `code` or `whitespace`).

## Rule Details

This rule aims to require fixable ESLint rules to have a valid `meta.fixable` property.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-fixable: "error" */

module.exports = {
  meta: {}, // missing `fixable` property
  create(context) {
    context.report({
      node,
      message: 'foo',
      fix(fixer) {
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
  create(context) {
    context.report({
      node,
      message: 'foo',
      fix(fixer) {
        return fixer.remove(node);
      },
    });
  },
};
```

```js
/* eslint eslint-plugin/require-meta-fixable: ["error", { catchNoFixerButFixableProperty: true }] */

module.exports = {
  meta: { fixable: 'code' }, // property enabled but no fixer detected
  create(context) {
    context.report({ node, message: 'foo' });
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-fixable: "error" */

module.exports = {
  meta: { fixable: 'code' },
  create(context) {
    context.report({
      node,
      message: 'foo',
      fix(fixer) {
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
  create(context) {
    context.report({
      node,
      message: 'foo',
    });
  },
};
```

## Options

This rule takes an optional object containing:

* `boolean` — `catchNoFixerButFixableProperty` — default `false` - Whether the rule should attempt to detect rules that do not have a fixer but enable the `meta.fixable` property. This option is off by default because it increases the chance of false positives since fixers can't always be detected when helper functions are used.

## Further Reading

* [ESLint's autofix API](http://eslint.org/docs/developer-guide/working-with-rules#applying-fixes)
* [ESLint's rule basics mentioning `meta.fixable`](https://eslint.org/docs/developer-guide/working-with-rules#rule-basics)
