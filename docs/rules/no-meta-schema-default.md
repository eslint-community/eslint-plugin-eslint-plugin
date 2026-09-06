# eslint-plugin/no-meta-schema-default

📝 Disallow rules `meta.schema` properties to include defaults.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

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

## Further Reading

- [ESLint rule docs: Option Defaults](https://eslint.org/docs/latest/extend/custom-rules#option-defaults)
- [RFC introducing `meta.defaultOptions`](https://github.com/eslint/rfcs/blob/main/designs/2023-rule-options-defaults/README.md)
