# eslint-plugin/consistent-test-errors

📝 Enforces consistent definition of all expected errors in rule tests.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

<!-- end auto-generated rule header -->

Requires all of `line`, `endLine`, `column`, and `endColumn` to be present for all expected errors.

## Rule Details

The rule reports that doesn't have consistent test errors definition

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/consistent-test-errors: error */

new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [{ code: 'foo', errors: [{ message: 'bar' }] }],
});
```

```js
/* eslint eslint-plugin/consistent-test-errors: error */

const errorPositions = { line: 1, column: 2, endColumn: 3, endLine: 4 };

new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [{ code: 'foo', errors: [{ message: 'bar', ...errorPositions }] }],
});
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/consistent-test-errors: error */

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

## Options

<!-- begin auto-generated rule options list -->

| Name              | Description                                                               | Type    | Default |
| :---------------- | :------------------------------------------------------------------------ | :------ | :------ |
| `requireLocation` | Whether to enforce stating the position of errors to be explicitly stated | Boolean | `true`  |

<!-- end auto-generated rule options list -->

### `requireLocation`

When this option is enabled, it forces the errors to contain all of `line`, `endLine`, `column`, and `endColumn`
