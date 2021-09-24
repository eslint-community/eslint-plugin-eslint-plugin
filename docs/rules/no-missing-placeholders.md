# Disallow missing placeholders in rule report messages (no-missing-placeholders)

✔️ The `"extends": "plugin:eslint-plugin/recommended"` property in a configuration file enables this rule.

Report messages in rules can have placeholders surrounded by curly brackets.

```js
context.report({
  node,
  message: '{{disallowedNode}} nodes are not allowed.',
  data: { disallowedNode: node.type },
});

// Resulting message: e.g. 'IfStatement nodes are not allowed.'
```

However, if no `data` argument is provided, or no matching replacement key exists in the `data` argument, the raw curly brackets will end up in the report message. This is usually a mistake.

## Rule Details

This rule aims to disallow missing placeholders in rule report messages.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/no-missing-placeholders: error*/

module.exports = {
  create (context) {
    context.report({
      node,
      message: '{{something}} is wrong.',
    });

    context.report({
      node,
      message: '{{something}} is wrong.',
      data: { somethingElse: 'foo' },
    });

    context.report(node, '{{something}} is wrong.', { somethingElse: 'foo' });
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/no-missing-placeholders: error*/

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

If you want to use rule messages that actually contain double-curly bracket text, you should turn off this rule.

## Further Reading

* [context.report() API](http://eslint.org/docs/developer-guide/working-with-rules#contextreport)
