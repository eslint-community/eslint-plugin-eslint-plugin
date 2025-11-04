# Require suggestions to have different `messageId` than their parent report (`eslint-plugin/no-matching-violation-suggest-message-ids`)

<!-- end auto-generated rule header -->

When providing fix suggestions to a reported problem, it's important to have an actionable `messageId` for each suggestion rather than reusing the same `messageId` as the main report.

## Rule Details

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/no-matching-violation-suggest-message-ids: error */

module.exports = {
  meta: { messages: { notAllowed: '`DebuggerStatement`s are not allowed' } },

  create(context) {
    return {
      DebuggerStatement(node) {
        context.report({
          node,
          messageId: 'notAllowed',
          suggest: [{ messageId: 'notAllowed' }],
        });
      },
    };
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/no-matching-violation-suggest-message-ids: error */

module.exports = {
  meta: {
    messages: {
      notAllowed: '`DebuggerStatement`s are not allowed',
      remove: 'Remove the debugger statement',
    },
  },

  create(context) {
    return {
      DebuggerStatement(node) {
        context.report({
          node,
          messageId: 'notAllowed',
          suggest: [
            {
              messageId: 'remove',
              fix: (fixer) => fixer.remove(node),
            },
          ],
        });
      },
    };
  },
};
```

## Further Reading

- [ESLint rule docs: Providing Suggestions](https://eslint.org/docs/latest/extend/custom-rules#providing-suggestions)
- [ESLint rule docs: Suggestion `messageId`s](https://eslint.org/docs/latest/extend/custom-rules#suggestion-messageids)
- [no-missing-message-ids](./no-missing-message-ids.md) rule
- [no-unused-message-ids](./no-unused-message-ids.md.md) rule
- [prefer-message-ids](./prefer-message-ids.md) rule
