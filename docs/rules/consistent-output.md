# Enforce consistent use of `output` assertions in rule tests (consistent-output)

When writing tests for a fixable rule with `RuleTester`, you can assert the autofix output of your test cases. However, it can be easy to forget to assert the output of a particular test case.

[As of ESLint 7](https://eslint.org/docs/user-guide/migrating-to-7.0.0#additional-validation-added-to-the-ruletester-class), test cases that trigger an autofix are required to provide the `output` property.

Even test that do not trigger an autofix can benefit from asserting that they have no autofix using `output: null`.

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

* `"consistent"` - (default) if any invalid test cases have output assertions, then all invalid test cases must have output assertions
* `"always"` - always require invalid test cases to have output assertions

## When Not To Use It

If you're not writing fixable rules, or you want to write test cases without output assertions, do not enable this rule.

## Further Reading

* [`RuleTester` documentation](http://eslint.org/docs/developer-guide/working-with-plugins#testing)
