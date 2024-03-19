# Require rules to implement a `meta.schema` property (`eslint-plugin/require-meta-schema`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

Defining a schema for each rule allows eslint to validate that configuration options are passed correctly. Even when there are no options for a rule, a schema can still be defined as an empty array to validate that no data is mistakenly passed to the rule.

As of [ESLint v9](https://github.com/eslint/rfcs/tree/main/designs/2021-schema-object-rules#motivation-for-requiring-schemas), ESLint will validate that options are not provided to a rule when a schema is omitted.

## Rule Details

This rule requires ESLint rules to have a valid `meta.schema` property.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-schema: error */

module.exports = {
  meta: {},
  create(context) {
    /* ... */
  },
};

module.exports = {
  meta: { schema: null },
  create(context) {
    /* ... */
  },
};

module.exports = {
  meta: { schema: [] },
  create(context) {
    const options = context.options; /* using options when schema is empty */
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-schema: error */

module.exports = {
  meta: { schema: [] }, // ensures no options are passed to the rule
  create(context) {
    /* ... */
  },
};

module.exports = {
  meta: {
    schema: [
      {
        type: 'object',
        properties: {
          exceptRange: {
            type: 'boolean',
          },
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

## Options

<!-- begin auto-generated rule options list -->

| Name                                  | Description                                                                                                                    | Type    | Default |
| :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------- | :------ | :------ |
| `requireSchemaPropertyWhenOptionless` | Whether the rule should require the `meta.schema` property to be specified (with `schema: []`) for rules that have no options. | Boolean | `true`  |

<!-- end auto-generated rule options list -->

## When Not To Use It

As mentioned in the introduction, the need for this rule is reduced as of ESLint v9.

## Further Reading

- [working-with-rules#options-schemas](https://eslint.org/docs/developer-guide/working-with-rules#options-schemas)
