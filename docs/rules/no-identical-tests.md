# Disallow identical tests (no-identical-tests)

✔️ The `"extends": "plugin:eslint-plugin/recommended"` property in a configuration file enables this rule.

⚒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#--fix) can automatically fix some of the problems reported by this rule.

Duplicate test cases can cause confusion, can be hard to detect manually in a long file, and serve no purpose.

As of [ESLint v9](https://github.com/eslint/rfcs/tree/main/designs/2021-stricter-rule-test-validation#disallow-identical-test-cases), ESLint attempts to detect and disallow duplicate tests.

## Rule Details

This rule detects duplicate test cases.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/no-identical-tests: error */

new RuleTester().run('foo', bar, {
  valid: [
    'foo',
    'foo', // duplicate of previous
  ],
  invalid: [
    {
      code: 'bar',
      errors: [{ messageId: 'my-message', type: 'CallExpression' }],
    },
    {
      code: 'bar',
      errors: [{ messageId: 'my-message', type: 'CallExpression' }],
    }, // duplicate of previous
  ],
});
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/no-identical-tests: error */

new RuleTester().run('foo', bar, {
  valid: ['foo', 'bar'],
  invalid: [
    {
      code: 'baz',
      errors: [{ messageId: 'my-message', type: 'CallExpression' }],
    },
  ],
});
```
