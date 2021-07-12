# Enforce the order of meta properties (meta-property-ordering)

⚒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#--fix) can automatically fix some of the problems reported by this rule.

This rule enforces that meta properties of a rule are placed in a consistent order.

## Rule Details

### Options

This rule has an array option:

* `['type', 'docs', 'fixable', 'schema', 'messages', 'deprecated', 'replacedBy']` (default): The order that the properties of `meta` should be placed in.

Examples of **incorrect** code for this rule:

```js

/* eslint eslint-plugin/meta-property-ordering: ["error",
  ["type", "docs", "fixable", "schema", "messages"]
] */

// invalid; wrong order.
module.exports = {
  meta: {
    docs: '',
    type: 'problem',
    fixable: 'code',
  },
  create () {},
};

// invalid; extra properties must be placed afterwards.
module.exports = {
  meta: {
    type: 'problem',
    fooooooooo: 'foo',
    docs: '',
    fixable: 'code',
  },
  create () {},
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/meta-property-ordering: ["error",
  ["type", "docs", "fixable", "schema", "messages"]
] */

// valid;
module.exports = {
  meta: {
    type: 'bar',
    docs: 'foo',
    messages: ['zoo'],
    fooooooooo: 'foo',
  },
  create () {},
};
```

## When Not To Use It

If don't want to enforce ordering of meta properties, you can turn off this rule.
