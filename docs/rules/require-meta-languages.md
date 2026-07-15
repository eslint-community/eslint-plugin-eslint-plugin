# eslint-plugin/require-meta-languages

📝 Require rules to implement a `meta.languages` property.

<!-- end auto-generated rule header -->

ESLint v10.2.0 introduced `meta.languages` to declare which languages a rule supports, using plugin-prefixed identifiers such as `'js/js'` or `'json/json'`.

When `meta.languages` is omitted, ESLint assumes the rule supports every language. This assumption is incorrect for almost all rules: a rule written for JavaScript can crash on an unfamiliar JSON or CSS AST, or silently do nothing. Declaring `meta.languages` allows ESLint to report a clear configuration-time error instead.

Dynamically computed values and unresolved spreads in `meta` are skipped, matching the behavior of the other `require-meta-*` rules.

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

## Further Reading

- [ESLint v10.2.0 released](https://eslint.org/blog/2026/04/eslint-v10.2.0-released/)
- [ESLint custom rule docs](https://eslint.org/docs/latest/extend/custom-rules)
