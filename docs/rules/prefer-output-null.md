# Disallows invalid RuleTester test cases with the output the same as the code. (prefer-output-null)

## Rule Details

This rule aims to enforce `output: null` for invalid test cases to indicate that no output is produced.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/prefer-output-null: error */

new RuleTester().run('foo', bar, {
    valid: [],
    invalid: [
      { code: 'foo', errors: [{ message: 'bar' }] },
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
