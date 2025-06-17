# Disallow rules to use a `meta.replacedBy` property (`eslint-plugin/no-meta-replaced-by`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

<!-- end auto-generated rule header -->

ESLint v9.21.0 introduces a new `DeprecatedInfo` type to describe whether a rule is deprecated and how it can be replaced. The legacy format used the meta property `replacedBy` which should be defined inside `deprecated` instead of at the top level.

Examples of a correct usage can be found at [array-bracket-newline](https://github.com/eslint/eslint/blob/4112fd09531092e9651e9981205bcd603dc56acf/lib/rules/array-bracket-newline.js#L18-L38) and [typescript-eslint/no-empty-interface](https://github.com/typescript-eslint/typescript-eslint/blob/af94f163a1d6447a84c5571fff5e38e4c700edb9/packages/eslint-plugin/src/rules/no-empty-interface.ts#L19-L30)

## Rule Details

This rule disallows the `replacedBy` property in rules' `meta`.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/no-meta-replaced-by: error */

module.exports = {
  meta: {
    deprecated: true,
    replacedBy: [],
  },
  create() {},
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/no-meta-replaced-by: error */

module.exports = {
  meta: {
    deprecated: {
      message: 'The new rule adds more functionality',
      replacedBy: [
        {
          rule: {
            name: 'the-new-rule',
          },
        },
      ],
    },
  },
  create() {},
};

module.exports = {
  meta: {},
  create() {},
};
```

## Further Reading

- [ESLint docs: `DeprecatedInfo`](https://eslint.org/docs/latest/extend/rule-deprecation#-deprecatedinfo-type)
- [RFC introducing `DeprecatedInfo` type](https://github.com/eslint/rfcs/blob/main/designs/2023-rule-options-defaults/README.md)
