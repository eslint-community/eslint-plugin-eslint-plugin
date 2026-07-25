# eslint-plugin/no-useless-meta-schema

📝 Disallow rule options schema constructs that ESLint ignores.

<!-- end auto-generated rule header -->

ESLint validates rule options with a configured Ajv 6 instance. Some schema
forms accept every options array, use ignored keywords, or contain constraints
that cannot take effect. This rule reports those objective defects.

## Rule Details

| Check                      | Reports                                                             | Why                                                                            |
| -------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `emptyRoot`                | An object-form `meta.schema: {}`.                                   | An empty object validates every options array.                                 |
| `bareArrayRoot`            | An object-form schema whose only assertion is `type: 'array'`.      | The type repeats what ESLint already guarantees and adds no option constraint. |
| `nonArrayRootType`         | An object-form schema whose explicit `type` excludes arrays.        | ESLint always validates the rule-options array at this root.                   |
| `nonConstrainingRoot`      | An object-form schema with no keyword that can constrain an array.  | Array-irrelevant root keywords cannot reject any options array.                |
| `ignoredKeywords`          | A curated keyword that ESLint's configured Ajv silently ignores.    | An ignored keyword does not enforce the constraint it appears to describe.     |
| `ignoredRefSiblings`       | Constraint siblings beside `$ref`.                                  | Ajv 6 ignores `$ref` siblings.                                                 |
| `unresolvedRefs`           | A `$ref` that cannot be resolved in the schema.                     | ESLint configures Ajv with `missingRefs: 'ignore'`, so the reference accepts.  |
| `ignoredAdditionalItems`   | `additionalItems` without tuple-form `items`.                       | Ajv ignores `additionalItems` unless `items` is an array.                      |
| `incompatibleTypeKeywords` | A keyword that cannot apply to any explicitly declared schema type. | The keyword cannot constrain a value of the declared type.                     |
| `impossibleBounds`         | Contradictory minimum and maximum bounds.                           | No value can satisfy the schema.                                               |

### Dialect basis

ESLint 9.39.5 configures ajv@6 with the draft-04 meta-schema and
`schemaId: "auto"`, while ajv@6 enforces the draft-07 runtime keyword set. It
silently ignores later-draft keywords such as `prefixItems`,
`unevaluatedItems`, `dependentSchemas`, and `$dynamicRef`. It also ignores
draft-03 `required: true`, unresolved references, and constraint siblings
beside `$ref`.

`schema: false` remains the explicit validation opt-out established by
[ESLint RFC 85](https://github.com/eslint/rfcs/tree/main/designs/2021-schema-object-rules#opt-out).
In contrast, `schema: []` accepts no options, while `schema: [{}]` carries
array-shorthand cardinality semantics and is not classified as useless.

## Options

All checks are enabled by default when this rule is enabled. The rule remains
unrecommended in the current minor release. Each check can be disabled
independently:

### `checks`

```js
export default [
  {
    rules: {
      'eslint-plugin/no-useless-meta-schema': [
        'error',
        { checks: { ignoredKeywords: false } },
      ],
    },
  },
];
```

## Related Rules

- [no-incomplete-meta-schema](./no-incomplete-meta-schema.md) — the opinionated counterpart. It enforces opt-in completeness policies for schemas that are valid but underspecified, and it will remain opt-in. This rule is limited to objective defects and is intended to become part of the `recommended` config in a future major release.
