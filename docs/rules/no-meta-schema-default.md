# Disallow rules `meta.schema` properties to include defaults (`eslint-plugin/no-meta-schema-default`)

<!-- end auto-generated rule header -->

Since ESLint v9.15.0, rules' default options are supported using `meta.defaultOptions`. Additionally defining them using the `default` property in `meta.schema` is confusing, error-prone, and can be ambiguous for complex schemas.

## Rule Details

This rule disallows the `default` property in rules' `meta.schema`.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/no-meta-schema-default: error */

module.exports = {
  meta: {
    schema: [
      {
        elements: { type: 'string' },
        type: 'array',
        default: [],
      },
    ],
  },
  create() {},
};

module.exports = {
  meta: {
    schema: {
      type: 'object',
      properties: {
        foo: { type: 'string', default: 'bar' },
        baz: { type: 'number', default: 42 },
      },
    },
  },
  create() {},
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/no-meta-schema-default: error */

module.exports = {
  meta: {
    schema: [
      {
        elements: { type: 'string' },
        type: 'array',
      },
    ],
    defaultOptions: [[]],
  },
  create() {},
};

module.exports = {
  meta: {
    schema: {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        baz: { type: 'number' },
      },
    },
    defaultOptions: [{ foo: 'bar', baz: 42 }],
  },
  create() {},
};
```

## When Not To Use It

When using [`eslint-doc-generator`](https://github.com/bmish/eslint-doc-generator) to generate documentation for your rules, you may want to disable this rule to include the `default` property in the generated documentation. This is because `eslint-doc-generator` does not yet support `meta.defaultOptions`, see [bmish/eslint-doc-generator#513](https://github.com/bmish/eslint-doc-generator/issues/513).

## Further Reading

- [ESLint rule docs: Option Defaults](https://eslint.org/docs/latest/extend/custom-rules#option-defaults)
- [RFC introducing `meta.defaultOptions`](https://github.com/eslint/rfcs/blob/main/designs/2023-rule-options-defaults/README.md)
