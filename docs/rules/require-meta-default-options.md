# eslint-plugin/require-meta-default-options

📝 Require only rules with options to implement a `meta.defaultOptions` property.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Defining default options declaratively in a rule's `meta.defaultOptions` property enables ESLint v9.15.0+ to merge any user-provided options with the default options, simplifying the rule's implementation. It can also be useful for other tools like [eslint-doc-generator](https://github.com/bmish/eslint-doc-generator) to generate documentation for the rule's options.

## Rule Details

This rule requires ESLint rules to have a valid `meta.defaultOptions` property if and only if the rule has options defined in its `meta.schema` property.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-default-options: error */

module.exports = {
  meta: {
    schema: [
      {
        type: 'object',
        /* ... */
      },
    ],
    // defaultOptions is missing
  },
  create(context) {
    /* ... */
  },
};

module.exports = {
  meta: {
    schema: [],
    defaultOptions: [{}], // defaultOptions is not needed when schema is empty
  },
  create(context) {
    /* ... */
  },
};

module.exports = {
  meta: {
    schema: [
      {
        /* ... */
      },
    ],
    defaultOptions: {}, // defaultOptions should be an array
  },
  create(context) {
    /* ... */
  },
};

module.exports = {
  meta: {
    schema: [
      {
        /* ... */
      },
    ],
    defaultOptions: [], // defaultOptions should not be empty
  },
  create(context) {
    /* ... */
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-default-options: error */

module.exports = {
  meta: { schema: [] }, // no defaultOptions needed when schema is empty
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
    defaultOptions: [{ exceptRange: false }],
  },
  create(context) {
    /* ... */
  },
};
```

## Further Reading

- [ESLint rule docs: Option Defaults](https://eslint.org/docs/latest/extend/custom-rules#option-defaults)
- [RFC introducing `meta.defaultOptions`](https://github.com/eslint/rfcs/blob/main/designs/2023-rule-options-defaults/README.md)
