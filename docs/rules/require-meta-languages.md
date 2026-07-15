# eslint-plugin/require-meta-languages

📝 Require rules to implement a `meta.languages` property.

<!-- end auto-generated rule header -->

## Rule Details

This rule requires ESLint rules to have a non-empty `meta.languages` array containing only strings.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-languages: error */

module.exports = {
  meta: {},
  create(context) {
    /* ... */
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-languages: error */

module.exports = {
  meta: { languages: ['js/js'] },
  create(context) {
    /* ... */
  },
};
```
