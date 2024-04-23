# Enforce consistent use of `output` assertions in rule tests (`eslint-plugin/consistent-output`)

<!-- end auto-generated rule header -->

When writing tests for fixable rules, the `output` property on each test case can be used to assert what autofixed code is produced, or to assert that no autofix is produced using `output: null`.

Prior to ESLint 7, it was easy to forget to assert the autofix output of a particular test case, resulting in incomplete test coverage and a greater chance of unexpected behavior / bugs.

[As of ESLint 7](https://eslint.org/docs/user-guide/migrating-to-7.0.0#additional-validation-added-to-the-ruletester-class), test cases that trigger an autofix are required by ESLint to provide the `output` property. Thus, it's now acceptable and more concise to omit this property when there's no autofix.

## Rule Details

This rule aims to ensure that if any invalid test cases have output assertions, then all test cases have output assertions.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/consistent-output: error */

new RuleTester().run('example-rule', rule, {
  valid: [],
  invalid: [
    {
      code: 'foo',
      output: 'bar',
      errors: ['baz'],
    },
    {
      code: 'bar',
      errors: ['baz'],
    },
  ],
});
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/consistent-output: error */

new RuleTester().run('example-rule', rule, {
  valid: [],
  invalid: [
    {
      code: 'foo',
      output: 'bar',
      errors: ['baz'],
    },
    {
      code: 'bar',
      output: 'qux',
      errors: ['baz'],
    },
    {
      code: 'foo',
      output: null, // asserts that there is no autofix
      errors: ['baz'],
    },
  ],
});
```

## Options

This rule takes an optional string enum option with one of the following values:

- `"consistent"` - (default) if any invalid test cases have output assertions, then all invalid test cases must have output assertions
- `"always"` - always require invalid test cases to have output assertions

## When Not To Use It

If you're not writing fixable rules, or you want to write test cases without output assertions, do not enable this rule.

As mentioned in the introduction, the need for this rule is reduced as of ESLint v7.

## Further Reading

- [`RuleTester` documentation](http://eslint.org/docs/developer-guide/working-with-plugins#testing)
