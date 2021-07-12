# Disallow the version of `context.report()` with multiple arguments (no-deprecated-report-api)

✔️ The `"extends": "plugin:eslint-plugin/recommended"` property in a configuration file enables this rule.

⚒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#--fix) can automatically fix some of the problems reported by this rule.

ESLint has two APIs that rules can use to report problems.

* The [deprecated API](http://eslint.org/docs/developer-guide/working-with-rules-deprecated) accepts multiple arguments: `context.report(node, [loc], message)`.
* The ["new API"](http://eslint.org/docs/developer-guide/working-with-rules#contextreport) accepts a single argument: an object containing information about the reported problem.

It is recommended that all rules use the new API.

## Rule Details

This rule aims to disallow use of the deprecated `context.report(node, [loc], message)` API.

Examples of **incorrect** code for this rule:

```js
module.exports = {
  create (context) {
    context.report(node, 'This node is bad.');
  },
};

```

Examples of **correct** code for this rule:

```js
module.exports = {
  create (context) {
    context.report({ node, message: 'This node is bad.' });

    context.report({ node, loc, message: 'This node is bad.' });
  },
};
```

## Further Reading

* [Deprecated rule API](http://eslint.org/docs/developer-guide/working-with-rules-deprecated)
* [New rule API](http://eslint.org/docs/developer-guide/working-with-rules)
