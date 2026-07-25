# eslint-plugin/no-incomplete-meta-schema

📝 Require explicit policy choices in rule options schemas.

<!-- end auto-generated rule header -->

Rule option schemas can be valid while leaving important authoring policies
implicit. This opt-in rule reports four places where a schema author may want
to state that policy explicitly.

## Rule Details

| Check                          | Reports                                                                     | Why                                                                  |
| ------------------------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `explicitAdditionalProperties` | An object schema with no stated `additionalProperties` policy.              | An explicit value records whether unlisted properties are accepted.  |
| `explicitItems`                | An array schema with no stated `items` policy.                              | An explicit value records whether and how array items are validated. |
| `typedItems`                   | An item schema without a type or recognized type-constraining alternative.  | A type or alternative makes the accepted item shape clear.           |
| `boundedTuples`                | A tuple schema with no explicit policy for items beyond the declared tuple. | A bound or opt-in value records whether extra items are accepted.    |

For example:

```js
/* eslint eslint-plugin/no-incomplete-meta-schema: error */

module.exports = {
  meta: {
    schema: [
      {
        type: 'object',
        properties: {
          value: { type: 'string' },
        },
      },
    ],
  },
  create(context) {
    /* ... */
  },
};
```

The corresponding explicit schema states its property policy:

```js
/* eslint eslint-plugin/no-incomplete-meta-schema: error */

module.exports = {
  meta: {
    schema: [
      {
        type: 'object',
        properties: {
          value: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    /* ... */
  },
};
```

`items: {}` is an explicit opt-in to unconstrained items.
`additionalItems: true` is an explicit opt-in to an open tuple.

## Options

All four checks are enabled when this opt-in rule is enabled. Each check can
be disabled independently:

### `checks`

```js
export default [
  {
    rules: {
      'eslint-plugin/no-incomplete-meta-schema': [
        'error',
        { checks: { explicitAdditionalProperties: false } },
      ],
    },
  },
];
```
