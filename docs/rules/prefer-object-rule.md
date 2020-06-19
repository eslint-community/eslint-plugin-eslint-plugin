# Disallow rule exports where the export is a function. (prefer-object-rule)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) automatically fixes problems reported by this rule.

## Rule Details

The rule reports an error if it encounters a rule that's defined using the old style of just a `create` function.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/prefer-object-rule: error */

module.exports = function (context) {
  return { Program() { context.report() } };
};

module.exports = function create(context) {
  return { Program() { context.report() } };
};

module.exports = (context) => {
  return { Program() { context.report() } };
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/prefer-object-rule: error */

module.exports = {
  create(context) {
    return { Program() { context.report() } };
  },
};

module.exports = {
  create(context) {
    return { Program() { context.report() } };
  },
};

module.exports = {
  create: (context) => {
    return { Program() { context.report() } };
  },
};
```
