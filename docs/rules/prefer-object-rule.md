# Disallow function-style rules (`eslint-plugin/prefer-object-rule`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Prior to ESLint v9, ESLint supported both [function-style](https://eslint.org/docs/developer-guide/working-with-rules-deprecated) and [object-style](https://eslint.org/docs/developer-guide/working-with-rules) rules. However, function-style rules have been deprecated since 2016, and do not support newer features like autofixing and suggestions.

As of [ESLint v9](https://github.com/eslint/rfcs/tree/main/designs/2021-schema-object-rules#motivation-for-requiring-object-style-rules), ESLint supports only object-style rules.

## Rule Details

The rule reports an error if it encounters a rule that's defined using the deprecated function-style format.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/prefer-object-rule: error */

module.exports = function create(context) {
  return {
    Program() {
      context.report();
    },
  };
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/prefer-object-rule: error */

module.exports = {
  meta: { /* ... */ },
  create(context) {
    return {
      Program() {
        context.report();
      },
    };
  },
};
```
