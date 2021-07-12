# Disallow rule exports where the export is a function (prefer-object-rule)

⚒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#--fix) can automatically fix some of the problems reported by this rule.

## Rule Details

The rule reports an error if it encounters a rule that's defined using the [deprecated style](https://eslint.org/docs/developer-guide/working-with-rules-deprecated) of just a `create` function instead of the newer [object style](https://eslint.org/docs/developer-guide/working-with-rules).

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/prefer-object-rule: error */

module.exports = function (context) {
  return { Program () {
    context.report();
  } };
};

module.exports = function create (context) {
  return { Program () {
    context.report();
  } };
};

module.exports = context => {
  return { Program () {
    context.report();
  } };
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/prefer-object-rule: error */

module.exports = {
  create (context) {
    return { Program () {
      context.report();
    } };
  },
};

module.exports = {
  create (context) {
    return { Program () {
      context.report();
    } };
  },
};

module.exports = {
  create: context => {
    return { Program () {
      context.report();
    } };
  },
};
```
