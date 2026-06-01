# eslint-plugin/require-error-positions

📝 Requires the position of errors to be explicitly stated for all expected errors.

<!-- end auto-generated rule header -->

Requires all the [position properties](https://eslint.org/docs/latest/integrate/nodejs-api#ruletesterrun) (`line`, `endLine`, `column`, and `endColumn`) to be present for all expected errors.

## Rule Details

This rule reports any expected error in an invalid test case that does not explicitly specify all four position properties.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-error-positions: error */

new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [{ code: 'foo', errors: [{ messageId: 'bar' }] }],
});
```

```js
/* eslint eslint-plugin/require-error-positions: error */

const errorPositions = { line: 1, column: 2 };

new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [{ code: 'foo', errors: [{ messageId: 'bar', ...errorPositions }] }],
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
        { messageId: 'bar', line: 1, column: 2, endColumn: 3, endLine: 4 },
      ],
    },
  ],
});
```

```js
/* eslint eslint-plugin/require-error-positions: error */

const errorPositions = { line: 1, column: 2, endColumn: 3, endLine: 4 };

new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [{ code: 'foo', errors: [{ messageId: 'bar', ...errorPositions }] }],
});
```
