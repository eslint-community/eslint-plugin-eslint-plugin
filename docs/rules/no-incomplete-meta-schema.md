# eslint-plugin/no-incomplete-meta-schema

📝 Require explicit policy choices in rule options schemas.

<!-- end auto-generated rule header -->

Rule option schemas can be valid while leaving important authoring choices
implicit. This opinionated rule is intended to remain opt-in and reports places
where schema authors may want to state those choices explicitly.

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

### Intentional open policies

This rule requires policies to be explicit; it does not require them to be
restrictive:

- Use `items: {}` to explicitly allow any array item.
- For tuple schemas, use `additionalItems: true` to explicitly allow items
  beyond the declared tuple positions.

Completeness checks are not applied inside `if`, `then`, `else`, or `not`,
because adding constraints there could change the schema's meaning.

## Options

Each check can be disabled independently:

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

## Related Rules

- [no-useless-meta-schema](./no-useless-meta-schema.md) — the safe counterpart. It reports only objective defects.
