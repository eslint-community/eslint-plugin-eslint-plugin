# Enforce a consistent format for rule report messages (report-message-format)

It is sometimes desirable to maintain consistent formatting for all report messages. For example, you might want to mandate that all report messages begin with a capital letter and end with a period.

## Rule Details

This rule aims to enforce a consistent format for rule report messages.

### Options

This rule has a string option. The string should be a regular expression that all report messages must match.

For example, in order to mandate that all report messages begin with a capital letter and end with a period, you can use the following configuration:

```json
{
    "rules": {
        "eslint-plugin/report-message-format": ["error", "^[A-Z].*\\.$"]
    },
    "plugins": [
        "eslint-plugin"
    ]
}
```

Note that since this rule uses static analysis and does not actually run your code, it will attempt to match report messages *before* placeholders are inserted.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/report-message-format: ["error", "^[A-Z].*\\.$"] */

module.exports = {
  meta: {},
  create (context) {
    context.report(node, 'this message does not match the regular expression.');

    context.report(node, 'Neither does this one');

    context.report(node, 'This will get reported, regardless of the value of the {{placeholder}}', { placeholder: foo });
  },
};
```

Examples of **correct** code for this rule:

```js
module.exports = {
  meta: {},
  create (context) {
    context.report(node, 'This message matches the regular expression.');

    context.report(node, 'So does this one.');
  },
};
```

## When Not To Use It

If you don't want to enforce consistent formatting for your report messages, you can turn off this rule.
