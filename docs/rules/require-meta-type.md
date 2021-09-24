# Require rules to implement a `meta.type` property (require-meta-type)

ESLint v5.9.0 introduces a new `--fix-type` option for the command line interface. This option allows users to filter the type of fixes applied when using `--fix`.

Fixes in custom rules will not be applied when using `--fix-type` unless they include a `meta.type` field.

## Rule Details

This rule aims to require ESLint rules to have a valid `meta.type` property with one of the following values:

* `"problem"` means the rule is identifying code that either will cause an error or may cause a confusing behavior. Developers should consider this a high priority to resolve.
* `"suggestion"` means the rule is identifying something that could be done in a better way but no errors will occur if the code isn't changed.
* `"layout"` means the rule cares primarily about whitespace, semicolons, commas, and parentheses, all the parts of the program that determine how the code looks rather than how it executes. These rules work on parts of the code that aren't specified in the AST.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-type: error */

module.exports = {
  meta: {},
  create (context) {
    // ...
  },
};

module.exports = {
  meta: { type: 'invalid' },
  create (context) {
    // ...
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-type: error */

module.exports = {
  meta: { type: 'problem' },
  create (context) {
    // ...
  },
};
```

## Further Reading

* [command-line-interface#--fix-type](https://eslint.org/docs/user-guide/command-line-interface#--fix-type)
* [working-with-rules#rule-basics](https://eslint.org/docs/developer-guide/working-with-rules#rule-basics)
* [ESLint v5.9.0 released](https://eslint.org/blog/2018/11/eslint-v5.9.0-released#the-fix-type-option)
