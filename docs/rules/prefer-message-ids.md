# Require using `messageId` instead of `message` or `desc` to report rule violations (`eslint-plugin/prefer-message-ids`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

<!-- end auto-generated rule header -->

When reporting a rule violation, it's preferred to provide the violation message with the `messageId` property instead of the `message` property. Message IDs provide the following benefits:

* Rule violation messages can be stored in a central `meta.messages` object for convenient management
* Rule violation messages do not need to be repeated in both the rule file and rule test file

## Rule Details

This rule catches usages of the `message` property when reporting a rule violation.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/prefer-message-ids: error */

module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        context.report({
          node,
          message: 'Some error message.',
        });
      },
    };
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/prefer-message-ids: error */

module.exports = {
  meta: {
    messages: {
      someMessageId: 'Some error message',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        context.report({
          node,
          messageId: 'someMessageId',
        });
      },
    };
  },
};
```

## Further Reading

* [messageIds API](https://eslint.org/docs/developer-guide/working-with-rules#messageids)
* [no-invalid-message-ids](./no-invalid-message-ids.md) rule
* [no-missing-message-ids](./no-missing-message-ids.md) rule
