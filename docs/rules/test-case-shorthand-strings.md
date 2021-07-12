# Enforce consistent usage of shorthand strings for test cases with no options (test-case-shorthand-strings)

⚒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#--fix) can automatically fix some of the problems reported by this rule.

When writing valid test cases for rules with `RuleTester`, one can optionally include a string as a test case instead of an object, if the the test case does not use any options.

```js
ruleTester.run('example-rule', rule, {
  valid: [

    // shorthand string
    'validTestCase;',

    // longform object
    {
      code: 'anotherValidTestCase;',
    },
  ],
  invalid: [
    // ...
  ],
});
```

Some developers prefer using this shorthand because it's more concise, but others prefer not to use the shorthand for consistency, so that all test cases are provided as objects. Regardless of your preference, it's generally better to be consistent throughout a project.

## Rule Details

This rule aims to enforce or disallow the use of strings as test cases.

### Options

This rule has a string option:

* `as-needed` (default): Requires the use of shorthand strings wherever possible.
* `never`: Disallows the use of shorthand strings.
* `consistent`: Requires that either all valid test cases use shorthand strings, or that no valid test cases use them.
* `consistent-as-needed`: Requires that all valid test cases use the longer object form if there are any valid test cases that require the object form. Otherwise, requires all valid test cases to use shorthand strings.

#### `as-needed`

Examples of **incorrect** code for this rule with the default `as-needed` option:

```js
/* eslint eslint-plugin/test-case-shorthand-strings: "error" */

ruleTester.run('example-rule', rule, {
  valid: [
    {
      code: 'validTestCase;',
    },
    {
      code: 'anotherValidTestCase;',
    },
  ],
  invalid: [],
});
```

Examples of **correct** code for this rule with the default `as-needed` option:

```js
/* eslint eslint-plugin/test-case-shorthand-strings: "error" */

ruleTester.run('example-rule', rule, {
  valid: [
    'validTestCase;',
    'anotherValidTestCase;',
    {
      code: 'testCaseWithOption;',
      options: ['foo'],
    },
  ],
  invalid: [],
});
```

#### `never`

Examples of **incorrect** code for this rule with the `never` option:

```js
/* eslint eslint-plugin/test-case-shorthand-strings: ["error", "never"] */

ruleTester.run('example-rule', rule, {
  valid: [
    'validTestCase;',
    'anotherValidTestCase;',
  ],
  invalid: [],
});
```

Examples of **correct** code for this rule with the `never` option:

```js
/* eslint eslint-plugin/test-case-shorthand-strings: ["error", "never"] */

ruleTester.run('example-rule', rule, {
  valid: [
    {
      code: 'validTestCase;',
    },
    {
      code: 'anotherValidTestCase;',
    },
  ],
  invalid: [],
});
```

#### `consistent`

Examples of **incorrect** code for this rule with the `consistent` option:

```js
/* eslint eslint-plugin/test-case-shorthand-strings: ["error", "consistent"] */

ruleTester.run('example-rule', rule, {
  valid: [
    'validTestCase;',
    'anotherValidTestCase;',
    {
      code: 'testCaseWithOption',
      options: ['foo'],
    },
  ],
  invalid: [],
});
```

Examples of **correct** code for this rule with the `consistent` option:

```js
/* eslint eslint-plugin/test-case-shorthand-strings: ["error", "consistent"] */

ruleTester.run('example-rule', rule, {
  valid: [
    {
      code: 'validTestCase;',
    },
    {
      code: 'anotherValidTestCase',
    },
    {
      code: 'testCaseWithOption',
      options: ['foo'],
    },
  ],
  invalid: [],
});

ruleTester.run('example-rule', rule, {
  valid: [
    'validTestCase;',
    'anotherValidTestCase',
  ],
  invalid: [],
});

ruleTester.run('example-rule', rule, {
  valid: [
    {
      code: 'validTestCase;',
    },
    {
      code: 'anotherValidTestCase',
    },
  ],
  invalid: [],
});
```

#### `consistent-as-needed`

Examples of **incorrect** code for this rule with the `consistent-as-needed` option:

```js
/* eslint eslint-plugin/test-case-shorthand-strings: ["error", "consistent-as-needed"] */

ruleTester.run('example-rule', rule, {
  valid: [
    'validTestCase;',
    {
      code: 'anotherValidTestCase',
    },
  ],
  invalid: [],
});

ruleTester.run('example-rule', rule, {
  valid: [
    'validTestCase;',
    'anotherValidTestCase;',
    {
      code: 'testCaseWithOption;',
      options: ['foo'],
    },
  ],
  invalid: [],
});

ruleTester.run('example-rule', rule, {
  valid: [
    {
      code: 'validTestCase;',
    },
    {
      code: 'anotherValidTestCase;',
    },
  ],
  invalid: [],
});
```

Examples of **correct** code for this rule with the `consistent-as-needed` option:

```js
/* eslint eslint-plugin/test-case-shorthand-strings: ["error", "consistent-as-needed"] */

ruleTester.run('example-rule', rule, {
  valid: [
    'validTestCase;',
    'anotherValidTestCase;',
  ],
  invalid: [],
});

ruleTester.run('example-rule', rule, {
  valid: [
    {
      code: 'validTestCase;',
    },
    {
      code: 'anotherValidTestCase;',
    },
    {
      code: 'testCaseWithOption;',
      options: ['foo'],
    },
  ],
  invalid: [],
});
```

## Known Limitations

* Test cases which are neither object literals nor string literals are ignored by this rule.
* In order to find your test cases, your test file needs to match the following common pattern:
  * `new RuleTester()` or `new (require('eslint')).RuleTester()` is called at the top level of the file
  * `ruleTester.run` is called at the top level with the same variable (or in the same expression) as the `new RuleTester` instantiation

## When Not To Use It

If you don't care about consistent usage of shorthand strings, you should not turn on this rule.

## Further Reading

* [`RuleTester` documentation](http://eslint.org/docs/developer-guide/working-with-plugins#testing)
