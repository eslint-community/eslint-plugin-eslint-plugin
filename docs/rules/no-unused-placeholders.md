# eslint-plugin/no-unused-placeholders

📝 Disallow unused placeholders in rule report messages.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

<!-- end auto-generated rule header -->

This rule aims to disallow unused placeholders in rule report messages.

## Rule Details

Reports when a `context.report()` call contains a data property that does not have a corresponding placeholder in the report message.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/no-unused-placeholders: error*/

module.exports = {
  create(context) {
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
  create(context) {
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

- [ESLint rule docs: Using Message Placeholders](https://eslint.org/docs/latest/extend/custom-rules#use-message-placeholders)
- [no-missing-placeholders](./no-missing-placeholders.md)
