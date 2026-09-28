# eslint-plugin/no-deprecated-sourcecode-methods

📝 Disallow usage of deprecated methods on source code objects.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

This rule disallows the use of deprecated methods on the [`SourceCode`](https://eslint.org/docs/latest/extend/custom-rules#accessing-the-source-code) object.

The deprecated methods are:

- `getSource`
- `getSourceLines`

Instead of using these methods, you should use the equivalent methods on `SourceCode`:

- `sourceCode.getSource(node)` -> `sourceCode.getText(node)`
- `sourceCode.getSourceLines()` -> `sourceCode.getLines()`

## Rule Details

Examples of **incorrect** code for this rule:

```js
module.exports = {
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      Program(ast) {
        const source = sourceCode.getSource(ast);
      },
    };
  },
};
```

Examples of **correct** code for this rule:

```js
module.exports = {
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      Program(ast) {
        const source = sourceCode.getText(ast);
      },
    };
  },
};
```

## When Not To Use It

If you need to support very old versions of ESLint where the replacement methods on `SourceCode` don't exist, you should not enable this rule.

## Further Reading

- [ESLint rule docs: Accessing the Source Code](https://eslint.org/docs/latest/extend/custom-rules#accessing-the-source-code)
