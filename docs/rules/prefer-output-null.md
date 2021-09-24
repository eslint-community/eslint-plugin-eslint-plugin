# Disallow invalid RuleTester test cases where the `output` matches the `code` (prefer-output-null)

⚒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#--fix) can automatically fix some of the problems reported by this rule.

Instead of repeating the test case `code`, using `output: null` is more concise and makes it easier to distinguish whether a test case provides an autofix.

## Rule Details

The rule reports an error if it encounters a test case where the output is the same as the code.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/prefer-output-null: error */

new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    { code: 'foo', output: 'foo', errors: [{ message: 'bar' }] },
  ],
});
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/prefer-output-null: error */

new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    { code: 'foo', output: null, errors: [{ message: 'bar' }] },
  ],
});
```
