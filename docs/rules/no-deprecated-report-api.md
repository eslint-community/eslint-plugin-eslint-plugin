# disallow use of the deprecated context.report() API (no-deprecated-report-api)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) automatically fixes problems reported by this rule.

ESLint has two APIs that rules can use to report problems. The [deprecated API](http://eslint.org/docs/developer-guide/working-with-rules-deprecated) accepts multiple arguments: `context.report(node, [loc], message)`. The ["new API"](http://eslint.org/docs/developer-guide/working-with-rules#contextreport) accepts a single argument: an object containing information about the reported problem. It is recommended that all rules use the new API.

## Rule Details

This rule aims to disallow use of the deprecated `context.report(node, [loc], message)` API.

The following patterns are considered warnings:

```js
module.exports = {
  create(context) {

    context.report(node, 'This node is bad.');

    context.report(node, loc, 'This node is bad.');

  }
};

```

The following patterns are not warnings:

```js
module.exports = {
  create(context) {

    context.report({ node, message: 'This node is bad.' });

    context.report({ node, loc, message: 'This node is bad.' });

  }
};
```


## Further Reading

* [Deprecated rule API](http://eslint.org/docs/developer-guide/working-with-rules-deprecated)
* [New rule API](http://eslint.org/docs/developer-guide/working-with-rules)
