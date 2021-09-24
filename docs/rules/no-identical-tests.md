# Disallow identical tests (no-identical-tests)

✔️ The `"extends": "plugin:eslint-plugin/recommended"` property in a configuration file enables this rule.

⚒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#--fix) can automatically fix some of the problems reported by this rule.

When a rule has a lot of tests, it's sometimes difficult to tell if any tests are duplicates. This rule would warn if any test cases have the same properties.

## Rule Details

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/no-identical-tests: error */

new RuleTester().run('foo', bar, {
  valid: [
    { code: 'foo' },
    { code: 'foo' },
  ],
  invalid: [],
});
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/no-identical-tests: error */

new RuleTester().run('foo', bar, {
  valid: [
    { code: 'foo' },
    { code: 'bar' },
  ],
  invalid: [],
});
```

## When Not To Use It

If you want to allow identical tests, do not enable this rule.
