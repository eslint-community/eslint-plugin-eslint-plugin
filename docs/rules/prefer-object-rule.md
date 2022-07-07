# Disallow function-style rules (prefer-object-rule)

✔️ The `"extends": "plugin:eslint-plugin/recommended"` property in a configuration file enables this rule.

⚒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#--fix) can automatically fix some of the problems reported by this rule.

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
