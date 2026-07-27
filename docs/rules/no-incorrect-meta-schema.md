# eslint-plugin/no-incorrect-meta-schema

📝 Disallow rule options schema constructs that ESLint ignores.

<!-- end auto-generated rule header -->

Some schema forms accept every options array, use ignored keywords, or contain
constraints that cannot take effect. This rule reports those objective defects.
This rule is intended to become part of the `recommended` config.

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

### Validator compatibility

This rule follows the schema keywords that ESLint actually enforces. ESLint
uses Ajv 6, which silently ignores some keywords from newer JSON Schema drafts
or other schema dialects. Examples include `prefixItems`,
`unevaluatedProperties`, `elements`, and `discriminator`.

The `ignoredKeywords` check reports only known ineffective constructs; it does
not reject arbitrary unknown keywords. It also reports known no-op forms such
as `allOf: []`.

### Root schema forms

Use `schema: false` to explicitly disable option validation. Use `schema: []`
for a rule that accepts no options. `schema: [{}]` is different: it permits one
unconstrained option, so this rule does not report it.

## Options

All checks are enabled by default when this rule is enabled. Each check can be
disabled independently:

### `checks`

```js
export default [
  {
    rules: {
      'eslint-plugin/no-incorrect-meta-schema': [
        'error',
        { checks: { ignoredKeywords: false } },
      ],
    },
  },
];
```

## Related Rules

- [no-incomplete-meta-schema](./no-incomplete-meta-schema.md) — the opinionated counterpart.
