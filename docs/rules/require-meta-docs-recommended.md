# Require rules to implement a `meta.docs.recommended` property (`eslint-plugin/require-meta-docs-recommended`)

<!-- end auto-generated rule header -->

Utilizing `meta.docs.recommended` makes it clear from each rule implementation whether a rule is part of the `recommended` config. Some plugins also have scripting for conveniently generating their config based on this flag.

However, this flag may not be appropriate for all plugins:

- Extra scripting/tooling is needed to keep the flags in sync with the config
- The flag may not scale to plugins that have multiple/many configs or don't have a recommended config
- Or some may simply prefer to keep the source of truth solely in the config rather than duplicating config membership data in the rules

By default, this rule enforces a `recommended` property be set to a `boolean` value.

## Rule Details

This rule requires ESLint rules to have a valid `meta.docs.recommended` property.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-docs-recommended: error */

module.exports = {
  meta: {},
  create(context) {
    /* ... */
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-docs-recommended: error */

module.exports = {
  meta: { recommended: true },
  create(context) {
    /* ... */
  },
};
```

## Options

<!-- begin auto-generated rule options list -->

| Name              | Description                                          | Type    | Default |
| :---------------- | :--------------------------------------------------- | :------ | :------ |
| `allowNonBoolean` | Whether to allow values of types other than boolean. | Boolean | `false` |

<!-- end auto-generated rule options list -->

### `allowNonBoolean`

Some plugins require `meta.docs.recommended` values but allow value types other than `boolean`.
This option changes the rule to only enforce that the values exist.

Example of **correct** code for this rule with `allowNonBoolean`:

```js
/* eslint eslint-plugin/require-meta-docs-recommended: ["error", { "allowNonBoolean": true }] */

module.exports = {
  meta: { recommended: 'strict' },
  create(context) {
    /* ... */
  },
};
```

## Further Reading

- [Rule Structure](https://eslint.org/docs/latest/extend/custom-rules#rule-structure)
