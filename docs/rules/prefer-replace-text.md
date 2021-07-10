# Require using `replaceText()` instead of `replaceTextRange()` (prefer-replace-text)

## Rule Details

The rule reports an error if `replaceTextRange()`'s first argument is an array of identical array elements. It can be easily replaced by `replaceText()` to improve readability.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/prefer-replace-text: error */

module.exports = {
  create (context) {
    context.report({
      fix (fixer) {
        // error, can be written: return fixer.replaceText([node, '']);
        return fixer.replaceTextRange([node.range[0], node.range[1]], '');
      },
    });
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/prefer-replace-text: error */

module.exports = {
  create (context) {
    context.report({
      fix (fixer) {
        return fixer.replaceText(node, '');
      },
    });
  },
};

module.exports = {
  create (context) {
    context.report({
      fix (fixer) {
        // start = ...
        // end = ...
        return fixer.replaceTextRange([start, end], '');
      },
    });
  },
};
```

## Further Reading

* [Applying Fixes](https://eslint.org/docs/developer-guide/working-with-rules#applying-fixes)
