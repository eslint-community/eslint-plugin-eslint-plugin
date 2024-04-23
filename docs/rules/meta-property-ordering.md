# Enforce the order of meta properties (`eslint-plugin/meta-property-ordering`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

This rule enforces that meta properties of a rule are placed in a consistent order.

## Rule Details

### Options

This rule has an array option:

- `['type', 'docs', 'fixable', 'hasSuggestions', 'deprecated', 'replacedBy', 'schema', 'defaultOptions', 'messages']` (default): The order that the properties of `meta` should be placed in.

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
  create() {},
};

// invalid; extra properties must be placed afterwards.
module.exports = {
  meta: {
    type: 'problem',
    fooooooooo: 'foo',
    docs: '',
    fixable: 'code',
  },
  create() {},
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
  create() {},
};
```

## When Not To Use It

If don't want to enforce ordering of meta properties, you can turn off this rule.
