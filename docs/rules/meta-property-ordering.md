# enforce ordering of meta properties in rule source (meta-property-ordering)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) automatically fixes problems reported by this rule.

This rule enforces that the properties of rule meta are arranged in a consistent order.

## Rule Details

### Options

This rule has an array option:

* `['type', 'docs', 'fixable', 'schema', 'messages', 'deprecated', 'replacedBy']` (default): The properties of meta should be placed in a consistent order.

Examples of **incorrect** code for this rule:

```js

/* eslint eslint-plugin/meta-property-ordering: ["error",
  ["type", "docs", "fixable", "schema", "messages"]
] */

// invalid; wrong order
{
  fixable: false,
  type: "problem",
  docs: "",
}

```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/test-case-property-ordering: ["error",
  ["type", "docs", "fixable", "schema", "messages"]
] */

// valid;
{
  type: "bar",
  docs: "foo",
  fooooooooo: "foo",
  fixable: false,
}

```

## When Not To Use It

If don't want to enforce ordering of properies in meta, you can turn off this rule.
