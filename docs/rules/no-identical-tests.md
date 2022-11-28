# Disallow identical tests (`eslint-plugin/no-identical-tests`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

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
