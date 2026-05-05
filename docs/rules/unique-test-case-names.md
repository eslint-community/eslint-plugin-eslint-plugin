# eslint-plugin/unique-test-case-names

📝 Enforce that all test cases with names have unique names.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

<!-- end auto-generated rule header -->

This rule enforces that any test cases that have names defined, have unique names within their `valid` and `invalid` arrays.

## Rule Details

This rule aims to ensure test suites are producing logs in a form that make it easy to identify failing tests, when they occur.
For thoroughly tested rules, it's not uncommon for test cases to have names defined so that they're easily distinguishable in the test log output.
Requiring that, within each `valid` and `invalid` group, any test cases with names have unique names, it ensures the test logs are unambiguous.

Examples of **incorrect** code for this rule:

```js
new RuleTester().run('foo', bar, {
  valid: [
    {
      code: 'nin',
      name: 'test case 1',
    },
    {
      code: 'smz',
      name: 'test case 1',
    },
  ],
  invalid: [
    {
      code: 'foo',
      errors: ['Error'],
      name: 'test case 2',
    },
    {
      code: 'bar',
      errors: ['Error'],
      name: 'test case 2',
    },
  ],
});
```

Examples of **correct** code for this rule:

```js
new RuleTester().run('foo', bar, {
  valid: [
    {
      code: 'nin',
      name: 'test case 1',
    },
    {
      code: 'smz',
      name: 'test case 2',
    },
  ],
  invalid: [
    {
      code: 'foo',
      errors: ['Error'],
      name: 'test case 1',
    },
    {
      code: 'bar',
      errors: ['Error'],
      name: 'test case 2',
    },
  ],
});
```

## When Not to Use It

If you aren't concerned with the nature of test logs.
