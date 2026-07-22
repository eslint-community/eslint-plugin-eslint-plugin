# eslint-plugin/no-incomplete-schema

📝 Disallow incomplete rule options schemas.

<!-- end auto-generated rule header -->

Rule option schemas can look restrictive while still accepting values they were
intended to reject. This rule reports eight structurally incomplete schema
shapes that can be identified without guessing about a rule's option semantics.

## Rule Details

| Check                                | Reports                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `rootEmptySchema`                    | An object-form `meta.schema: {}` that validates every options array.                        |
| `rootBareArraySchema`                | An object-form schema whose only assertion is `type: 'array'`.                              |
| `rootWrongOptionsType`               | An object-form schema whose explicit `type` excludes arrays.                                |
| `rootObjectKeywordNoop`              | An object-form schema containing no keyword that can constrain an options array.            |
| `objectAdditionalPropertiesExplicit` | An explicit object schema with no stated `additionalProperties` policy.                     |
| `tupleAdditionalItems`               | A tuple schema that permits unconstrained extra items and has no equivalent `maxItems` cap. |
| `arrayItems`                         | An explicit array schema with no recognized item constraint.                                |
| `arrayItemType`                      | An array item schema with neither `type` nor a recognized type-constraining alternative.    |

For example, the following schemas are incomplete:

```js
/* eslint eslint-plugin/no-incomplete-schema: error */

module.exports = {
  meta: {
    schema: {},
  },
  create(context) {
    /* ... */
  },
};

module.exports = {
  meta: {
    schema: [{ type: 'array', elements: { type: 'string' } }],
  },
  create(context) {
    /* ... */
  },
};
```

The corresponding explicit schemas are:

```js
/* eslint eslint-plugin/no-incomplete-schema: error */

module.exports = {
  meta: {
    schema: false,
  },
  create(context) {
    /* ... */
  },
};

module.exports = {
  meta: {
    schema: [{ type: 'array', items: { type: 'string' } }],
  },
  create(context) {
    /* ... */
  },
};
```

### Explicit validation opt-out

Use `schema: false` when a rule intentionally opts out of option validation.
This is the explicit opt-out established by
[ESLint RFC 85](https://github.com/eslint/rfcs/tree/main/designs/2021-schema-object-rules#opt-out).
In contrast, `schema: []` means that the rule accepts no options.

## Options

All eight checks are enabled by default. A check can be disabled without
turning off the other structural checks:

### `checks`

```js
export default [
  {
    rules: {
      'eslint-plugin/no-incomplete-schema': [
        'error',
        { checks: { objectAdditionalPropertiesExplicit: false } },
      ],
    },
  },
];
```

The policy-oriented `schemaType`, `knownKeywords`,
`objectAdditionalPropertiesFalse`, `arrayMinItems`, `arrayMaxItems`,
`stringMinLength`, `stringMaxLength`, `objectProperties`, and
`arrayUniqueItems` checks are excluded because valid schemas produced false
positives for those policies.
