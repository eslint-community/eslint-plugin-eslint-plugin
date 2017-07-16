# enforce ordering of keys in test cases (test-case-property-ordering)

## Rule Details

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/test-case-property-ordering: ["error",
  ["code", "output", "options", "parserOptions", "errors"]
] */

// valid;
{
  code: "foo",
  output: "bar",
  options: ["baz"],
}

```

Examples of **correct** code for this rule:

```js

/* eslint eslint-plugin/test-case-property-ordering: ["error",
  ["code", "output", "options", "parserOptions", "errors"]
] */

// invalid; wrong order
{
  code: "foo",
  options: ["baz"],
  output: "bar",
}


// invalid; extra properties should need to be placed afterwards.
{
  code: "foo",
  env: { es6: true }
  output: "bar",
  options: ["baz"],
}
```

### Options

This rule has an array option:

* `["code", "output", "options", "parserOptions", "errors"]` (default): The properties of a test case should be placed in the given order.


## When Not To Use It

If don't want to enforce ordering of keys in test cases, you can turn off this rule.
