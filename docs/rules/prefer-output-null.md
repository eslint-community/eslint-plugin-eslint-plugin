# Disallows invalid RuleTester test cases with the output the same as the code. (prefer-output-null)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) automatically fixes problems reported by this rule.

## Rule Details

The rule reports an error if it encounters a test case where the output is the same as the code.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/prefer-output-null: error */

new RuleTester().run('foo', bar, {
    valid: [],
    invalid: [
      { code: 'foo', output: 'foo', errors: [{ message: 'bar' }] },
    ]
});
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/prefer-output-null: error */

new RuleTester().run('foo', bar, {
    valid: [],
    invalid: [
      { code: 'foo', output: null, errors: [{ message: 'bar' }] },
    ]
});
```
