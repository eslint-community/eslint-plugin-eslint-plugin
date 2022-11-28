# Disallow the version of `context.report()` with multiple arguments (`eslint-plugin/no-deprecated-report-api`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

ESLint has two APIs that rules can use to report problems.

* The [deprecated API](http://eslint.org/docs/developer-guide/working-with-rules-deprecated) accepts multiple arguments: `context.report(node, [loc], message)`.
* The ["new API"](http://eslint.org/docs/developer-guide/working-with-rules#contextreport) accepts a single argument: an object containing information about the reported problem.

It is recommended that all rules use the new API.

## Rule Details

This rule aims to disallow use of the deprecated `context.report(node, [loc], message)` API.

Examples of **incorrect** code for this rule:

```js
module.exports = {
  create(context) {
    context.report(node, 'This node is bad.');
  },
};
```

Examples of **correct** code for this rule:

```js
module.exports = {
  create(context) {
    context.report({ node, message: 'This node is bad.' });

    context.report({ node, loc, message: 'This node is bad.' });
  },
};
```

## Further Reading

* [Deprecated rule API](http://eslint.org/docs/developer-guide/working-with-rules-deprecated)
* [New rule API](http://eslint.org/docs/developer-guide/working-with-rules)
