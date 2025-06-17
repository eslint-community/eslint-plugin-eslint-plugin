# Disallow using the `meta.replacedBy` rule property (`eslint-plugin/no-meta-replaced-by`)

<!-- end auto-generated rule header -->

As of ESLint v9.21.0, the rule property `meta.deprecated` can be either a boolean or an object of type `DeprecatedInfo`. The `DeprecatedInfo` includes an optional `replacedBy` array that replaces the now-deprecated `meta.replacedBy` property.

Examples of correct usage:

- [array-bracket-newline](https://github.com/eslint/eslint/blob/4112fd09531092e9651e9981205bcd603dc56acf/lib/rules/array-bracket-newline.js#L18-L38)
- [typescript-eslint/no-empty-interface](https://github.com/typescript-eslint/typescript-eslint/blob/af94f163a1d6447a84c5571fff5e38e4c700edb9/packages/eslint-plugin/src/rules/no-empty-interface.ts#L19-L30)

## Rule Details

This rule disallows the `meta.replacedBy` property in a rule.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/no-meta-replaced-by: error */

module.exports = {
  meta: {
    deprecated: true,
    replacedBy: ['the-new-rule'],
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
  meta: {
    deprecated: true,
  },
  create() {},
};
```

## When Not To Use It

If you do not plan to provide rule's documentation in website, you can turn off this rule.

## Further Reading

- [ESLint docs: `DeprecatedInfo`](https://eslint.org/docs/latest/extend/rule-deprecation#-deprecatedinfo-type)
- [RFC introducing `DeprecatedInfo` type](https://github.com/eslint/rfcs/tree/main/designs/2024-deprecated-rule-metadata)
