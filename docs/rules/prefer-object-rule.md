# eslint-plugin/prefer-object-rule

📝 Disallow function-style rules.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Prior to ESLint v9, ESLint supported both [function-style](https://eslint.org/docs/latest/extend/custom-rules-deprecated) and [object-style](https://eslint.org/docs/latest/extend/custom-rules) rules. However, function-style rules have been deprecated since 2016, and do not support newer features like autofixing and suggestions.

As of [ESLint v9](https://github.com/eslint/rfcs/tree/main/designs/2021-schema-object-rules#motivation-for-requiring-object-style-rules), ESLint supports only object-style rules.

## Rule Details

The rule reports an error if it encounters a rule that's defined using the deprecated function-style format.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/prefer-object-rule: error */

module.exports = function create(context) {
  return {
    Program() {
      context.report();
    },
  };
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/prefer-object-rule: error */

module.exports = {
  meta: {/* ... */},
  create(context) {
    return {
      Program() {
        context.report();
      },
    };
  },
};
```

When autofixing, any `schema` or `deprecated` properties that the deprecated function-style format exposed directly on the exported function are ported over into the `meta` object.

Static values (literals, or arrays/objects of literals) are inlined directly into `meta`:

Before:

```js
module.exports = function create(context) {
  return {/* ... */};
};
module.exports.schema = [{/* options */}];
module.exports.deprecated = true;
```

After:

```js
module.exports = {
  meta: { schema: [{/* options */}], deprecated: true },
  create(context) {
    return {/* ... */};
  },
};
```

A value that can't be safely relocated — for example, one that references a variable or has side effects — is instead reassigned onto `meta` in place, so its evaluation order and any side effects are preserved:

Before:

```js
module.exports = function create(context) {
  return {/* ... */};
};
module.exports.schema = getSchema();
```

After:

```js
module.exports = {
  meta: {},
  create(context) {
    return {/* ... */};
  },
};
module.exports.meta.schema = getSchema();
```
