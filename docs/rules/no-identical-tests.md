# Disallow identical tests (no-identical-tests)

When a rule has a lot of tests, it's sometimes difficult to tell if any tests are duplicates. This rule would warn if any test cases have the same properties.

## Rule Details

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/consistent-output: error */

new RuleTester().run('foo', bar, {
valid: [
    { code: 'foo' },
    { code: 'foo' }
],
invalid: []
});

```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/consistent-output: error */

new RuleTester().run('foo', bar, {
valid: [
    { code: 'foo' },
    { code: 'bar' }
],
invalid: []
});

```

## When Not To Use It

If you want to allow identical tests, do not enable this rule.
