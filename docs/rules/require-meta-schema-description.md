# Require rules `meta.schema` properties to include descriptions (`eslint-plugin/require-meta-schema-description`)

<!-- end auto-generated rule header -->

Defining a description in the schema for each rule option helps explain that option to users.
It also allows documentation generators such as [`eslint-doc-generator`](https://github.com/bmish/eslint-doc-generator) to generate more informative documentation for users.

## Rule Details

This rule requires that if a rule option has a property in the rule's `meta.schema`, it should have a `description`.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-schema-description: error */

module.exports = {
  meta: {
    schema: [
      {
        elements: { type: 'string' },
        type: 'array',
      },
    ],
  },
  create() {},
};

module.exports = {
  meta: {
    schema: [
      {
        properties: {
          something: {
            type: 'string',
          },
        },
        type: 'object',
      },
    ],
  },
  create() {},
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-schema-description: error */

module.exports = {
  meta: {
    schema: [
      {
        description: 'Elements to allow.',
        elements: { type: 'string' },
        type: 'array',
      },
    ],
  },
  create() {},
};

module.exports = {
  meta: {
    schema: [
      {
        oneOf: [
          {
            description: 'Elements to allow.',
            elements: { type: 'string' },
            type: 'array',
          },
        ],
      },
    ],
  },
  create() {},
};
```

## When Not To Use It

If your rule options are very simple and well-named, and your rule isn't used by developers outside of your immediate team, you may not need this rule.

## Further Reading

- [working-with-rules#options-schemas](https://eslint.org/docs/developer-guide/working-with-rules#options-schemas)
