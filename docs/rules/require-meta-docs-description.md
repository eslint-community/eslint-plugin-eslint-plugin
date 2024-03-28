# Require rules to implement a `meta.docs.description` property with the correct format (`eslint-plugin/require-meta-docs-description`)

<!-- end auto-generated rule header -->

Defining a clear and consistent description for each rule helps developers understand what they're used for.

In particular, each rule description should begin with an allowed prefix:

- `enforce`
- `require`
- `disallow`

## Rule Details

This rule requires ESLint rules to have a valid `meta.docs.description` property.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-docs-description: error */

module.exports = {
  meta: {},
  create(context) {
    /* ... */
  },
};

module.exports = {
  meta: { description: 'this rule does ...' }, // missing allowed prefix
  create(context) {
    /* ... */
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-docs-description: error */

module.exports = {
  meta: { description: 'disallow unused variables' },
  create(context) {
    /* ... */
  },
};
```

## Options

<!-- begin auto-generated rule options list -->

| Name      | Description                                                                         | Type   | Default                         |
| :-------- | :---------------------------------------------------------------------------------- | :----- | :------------------------------ |
| `pattern` | A regular expression that the description must match. Use `'.+'` to allow anything. | String | `^(enforce\|require\|disallow)` |

<!-- end auto-generated rule options list -->

## Further Reading

- [working-with-rules#options-schemas](https://eslint.org/docs/developer-guide/working-with-rules#options-schemas)
