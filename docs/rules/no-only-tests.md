# Disallow the test case property `only` (no-only-tests)

💡 Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

The [`only` property](https://eslint.org/docs/developer-guide/unit-tests#running-individual-tests) can be used as of [ESLint 7.29](https://eslint.org/blog/2021/06/eslint-v7.29.0-released#highlights) for running individual rule test cases with less-noisy debugging. This feature should be only used in development, as it prevents all the tests from running. Mistakenly checking-in a test case with this property can cause CI tests to incorrectly pass.

## Rule Details

This rule flags a violation when a test case is using `only`. Note that this rule is not autofixable since automatically deleting the property would prevent developers from being able to use it during development.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/no-only-tests: error */

const { RuleTester } = require('eslint');
const ruleTester = new RuleTester();

ruleTester.run('my-rule', myRule, {
  valid: [
    {
      code: 'const valid = 42;',
      only: true,
    },
    RuleTester.only('const valid = 42;'),
  ],
  invalid: [
    {
      code: 'const invalid = 42;',
      only: true,
      errors: [/* ... */],
    },
  ],
});
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/no-only-tests: error */

const { RuleTester } = require('eslint');
const ruleTester = new RuleTester();

ruleTester.run('my-rule', myRule, {
  valid: [
    'const valid = 42;',
    { code: 'const valid = 42;' },
  ],
  invalid: [
    {
      code: 'const invalid = 42;',
      errors: [/* ... */],
    },
  ],
});
```
