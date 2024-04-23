# Require the properties of a test case to be placed in a consistent order (`eslint-plugin/test-case-property-ordering`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

This rule enforces that the properties of RuleTester test cases are arranged in a consistent order.

## Rule Details

### Options

This rule has an array option:

- `["filename", "code", "output", "options", "parser", "languageOptions", "parserOptions", "globals", "env", "errors"]` (default): The properties of a test case should be placed in a consistent order.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/test-case-property-ordering: ["error",
  ["code", "output", "options", "parserOptions", "errors"]
] */

// invalid; wrong order
const testCase1 = {
  code: 'foo',
  options: ['baz'],
  output: 'bar',
};

// invalid; extra properties should need to be placed afterwards.
const testCase2 = {
  code: 'foo',
  env: { es6: true },
  output: 'bar',
  options: ['baz'],
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/test-case-property-ordering: ["error",
  ["code", "output", "options", "parserOptions", "errors"]
] */

// valid;
const testCase1 = {
  code: 'foo',
  output: 'bar',
  options: ['baz'],
};
```

## When Not To Use It

If don't want to enforce ordering of keys in test cases, you can turn off this rule.
