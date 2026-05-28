# eslint-plugin/require-error-positions

📝 Requires the position of errors to be explicitly stated for all expected errors.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

<!-- end auto-generated rule header -->

Requires all of `line`, `endLine`, `column`, and `endColumn` to be present for all expected errors.

## Rule Details

The rule reports an error if it encounters a test case where the doesn't contain all of `line`, `endLine`, `column`, and `endColumn`.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-error-positions: error */

new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [{ code: 'foo', errors: [{ message: 'bar' }] }],
});
```

```js
/* eslint eslint-plugin/require-error-positions: error */

const errorPositions = { line: 1, column: 2, endColumn: 3, endLine: 4 };

new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [{ code: 'foo', errors: [{ message: 'bar', ...errorPositions }] }],
});
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-error-positions: error */

new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {
      code: 'foo',
      errors: [
        { message: 'bar', line: 1, column: 2, endColumn: 3, endLine: 4 },
      ],
    },
  ],
});
```
