# Enforces always return from a fixer function (fixer-return)

In a fixable rule, missing return from a fixer function will not apply fixes.

## Rule Details

This rule enforces that fixer functions always return a value.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/fixer-return: error */
module.exports = {
    create: function(context) {
        context.report( {
            fix: function(fixer) {
                fixer.foo();
            }
        });
    }
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/fixer-return: error */
module.exports = {
    create: function(context) {
        context.report( {
            fix: function(fixer) {
                return fixer.foo();
            }
        });
    }
};
```

## When Not To Use It

If you don't want to enforce always return from a fixer function, do not enable this rule.
