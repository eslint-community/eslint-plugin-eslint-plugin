# Require test cases to have a `name` property under certain conditions (`eslint-plugin/require-test-case-name`)

<!-- end auto-generated rule header -->

This rule enforces that test cases include a `name` property, under certain circumstances based on the configuration.

## Rule Details

This rule aims to ensure test suites are producing logs in a form that make it easy to identify failing test, when they happen.
For thoroughly tested rules, it's not uncommon to have the same `code` across multiple test cases, with only `options` or `settings` differing between them.
Requiring these test cases to have a `name` helps ensure the test output is meaningful and distinct.

### Options

This rule has one option.

#### `require: 'always' | 'objects' | 'objects-with-config'`

- `always`: all test cases should have a `name` property (this means that no shorthand string test cases are allowed as a side effect)
- `objects`: requires that a `name` property is present in all `object`-based test cases.
- `objects-with-config` (default): requires that test cases that have `options` or `settings` defined, should also have a `name` property.

Examples of **incorrect** code for this rule:

```js
// invalid; require: objects-with-config (default)
const testCase1 = {
  code: 'foo',
  options: ['baz'],
};

// invalid; require: objects
const testCase2 = {
  code: 'foo',
};

// invalid; require: always
const testCase3 = 'foo';
```

Examples of **correct** code for this rule:

```js
// require: objects-with-config, objects
const testCase1 = 'foo';

// require: objects-with-config, objects, always
const testCase2 = {
  code: 'foo',
  options: ['baz'],
  name: "foo (option: ['baz'])",
};

// require: objects-with-config, objects, always
const testCase4 = {
  code: 'foo',
  name: 'foo without options',
};
```

## When Not to Use It

If you aren't concerned with the nature of the test logs or don't want to require `name` on test cases.
