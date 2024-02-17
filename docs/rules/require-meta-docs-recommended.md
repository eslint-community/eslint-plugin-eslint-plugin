# Require rules to implement a `meta.docs.recommended` property (`eslint-plugin/require-meta-docs-recommended`)

<!-- end auto-generated rule header -->

Defining a whether recommended value for each rule can help developers understand whether they're recommended.

## Rule Details

This rule requires ESLint rules to have a valid `meta.docs.recommended` property.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-docs-recommended: error */

module.exports = {
  meta: {},
  create(context) {
    /* ... */
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-docs-recommended: error */

module.exports = {
  meta: { recommended: true },
  create(context) {
    /* ... */
  },
};
```

## Further Reading

- [working-with-rules#options-schemas](https://eslint.org/docs/developer-guide/working-with-rules#options-schemas)
