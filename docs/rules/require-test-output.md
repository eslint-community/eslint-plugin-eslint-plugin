# Enforce use of `output` assertions in rule tests (require-test-output)

When writing tests for a fixable rule with `RuleTester`, you can assert the autofix `output` of your test cases.

[As of ESLint 7](https://eslint.org/docs/user-guide/migrating-to-7.0.0#additional-validation-added-to-the-ruletester-class), test cases that trigger an autofix are required to provide the `output` property.

However, it can be easy to forget to assert the output of a particular test case, leading to the autofix being untested. And even tests that do not trigger an autofix can benefit from asserting that they have no autofix using `output: null`.

## Rule Details

This rule ensures all invalid test cases have `output` assertions.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-test-output: error */

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
/* eslint eslint-plugin/require-test-output: error */

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

This rule takes an optional object containing:

* `boolean` -- `consistent` -- only require `output` assertions when some test cases have them (default `false`)

## Further Reading

* [`RuleTester` documentation](http://eslint.org/docs/developer-guide/working-with-plugins#testing)
