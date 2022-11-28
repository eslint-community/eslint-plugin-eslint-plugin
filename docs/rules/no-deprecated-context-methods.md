# Disallow usage of deprecated methods on rule context objects (`eslint-plugin/no-deprecated-context-methods`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

This rule disallows the use of deprecated methods on rule `context` objects.

The deprecated methods are:

* `getSource`
* `getSourceLines`
* `getAllComments`
* `getNodeByRangeIndex`
* `getComments`
* `getCommentsBefore`
* `getCommentsAfter`
* `getCommentsInside`
* `getJSDocComment`
* `getFirstToken`
* `getFirstTokens`
* `getLastToken`
* `getLastTokens`
* `getTokenAfter`
* `getTokenBefore`
* `getTokenByRangeStart`
* `getTokens`
* `getTokensAfter`
* `getTokensBefore`
* `getTokensBetween`

Instead of using these methods, you should use the equivalent methods on [`SourceCode`](https://eslint.org/docs/developer-guide/working-with-rules#contextgetsourcecode), e.g. `context.getSourceCode().getText()` instead of `context.getSource()`.

## Rule Details

Examples of **incorrect** code for this rule:

```js
module.exports = {
  create(context) {
    return {
      Program(ast) {
        const firstToken = context.getFirstToken(ast);
      },
    };
  },
};
```

Examples of **correct** code for this rule:

```js
module.exports = {
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      Program(ast) {
        const firstToken = sourceCode.getFirstToken(ast);
      },
    };
  },
};
```

## When Not To Use It

If you need to support very old versions of ESLint where `SourceCode` doesn't exist, you should not enable this rule.

## Further Reading

* [`SourceCode` API](https://eslint.org/docs/developer-guide/working-with-rules#contextgetsourcecode)
