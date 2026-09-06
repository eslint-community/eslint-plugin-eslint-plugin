# eslint-plugin/prefer-placeholders

📝 Require using placeholders for dynamic report messages.

<!-- end auto-generated rule header -->

Report messages in rules can have placeholders surrounded by curly brackets.

```js
context.report({
  node,
  message: '{{disallowedNode}} nodes are not allowed.',
  data: { disallowedNode: node.type },
});
```

Using placeholders is often preferred over using dynamic report messages, for a few reasons:

- They can help enforce a separation of the message and the data.
- They can be used in messages stored in [`meta.messages`](https://eslint.org/docs/latest/extend/custom-rules#messageids) and referenced through `messageId`.

## Rule Details

This rule aims to report string concatenation and template literals in report messages.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/prefer-placeholders: error */

module.exports = {
  create(context) {
    context.report({
      node,
      message: `The node ${node.name} is not allowed to be used.`,
    });

    context.report({
      node,
      message: 'The node ' + node.name + ' is not allowed to be used.',
    });
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/prefer-placeholders: error */

module.exports = {
  create(context) {
    context.report({
      node,
      message: 'The node {{name}} is not allowed to be used.',
      data: { name: node.name },
    });
  },
};
```

## When Not To Use It

If you need to use string concatenation in your report messages for some reason, don't turn on this rule.

## Further Reading

- [ESLint rule docs: Using Message Placeholders](https://eslint.org/docs/latest/extend/custom-rules#using-message-placeholders)
