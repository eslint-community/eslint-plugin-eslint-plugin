# Disallow unused placeholders in rule report messages (no-unused-placeholders)

✔️ The `"extends": "plugin:eslint-plugin/recommended"` property in a configuration file enables this rule.

This rule aims to disallow unused placeholders in rule report messages.

## Rule Details

Reports when a `context.report()` call contains a data property that does not have a corresponding placeholder in the report message.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/no-unused-placeholders: error*/

module.exports = {
  create (context) {
    context.report({
      node,
      message: 'something is wrong.',
      data: { something: 'foo' },
    });

    context.report(node, 'something is wrong.', { something: 'foo' });
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/no-unused-placeholders: error*/

module.exports = {
  create (context) {
    context.report({
      node,
      message: 'something is wrong.',
    });

    context.report({
      node,
      message: '{{something}} is wrong.',
      data: { something: 'foo' },
    });

    context.report(node, '{{something}} is wrong.', { something: 'foo' });
  },
};
```

## When Not To Use It

If you want to allow unused placeholders, you should turn off this rule.

## Further Reading

* [context.report() API](http://eslint.org/docs/developer-guide/working-with-rules#contextreport)
* [no-missing-placeholders](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/no-missing-placeholders.md)
