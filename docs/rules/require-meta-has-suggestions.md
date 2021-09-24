# Require suggestable rules to implement a `meta.hasSuggestions` property (require-meta-has-suggestions)

⚒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#--fix) can automatically fix some of the problems reported by this rule.

A suggestable ESLint rule should specify the `meta.hasSuggestions` property with a value of `true`. This makes it easier for both humans and tooling to tell whether a rule provides suggestions. [As of ESLint 8](https://eslint.org/blog/2021/06/whats-coming-in-eslint-8.0.0#rules-with-suggestions-now-require-the-metahassuggestions-property), an exception will be thrown if a suggestable rule is missing this property.

Likewise, rules that do not report suggestions should not enable the `meta.hasSuggestions` property.

## Rule Details

This rule aims to require ESLint rules to have a `meta.hasSuggestions` property if necessary.

Examples of **incorrect** code for this rule:

```js
/* eslint eslint-plugin/require-meta-has-suggestions: "error" */

module.exports = {
  meta: {}, // Missing `meta.hasSuggestions`.
  create (context) {
    context.report({
      node,
      message: 'foo',
      suggest: [
        {
          desc: 'Insert space at the beginning',
          fix: fixer => fixer.insertTextBefore(node, ' '),
        },
      ],
    });
  },
};
```

```js
/* eslint eslint-plugin/require-meta-has-suggestions: "error" */

module.exports = {
  meta: { hasSuggestions: true }, // Has `meta.hasSuggestions` enabled but never provides suggestions.
  create (context) {
    context.report({
      node,
      message: 'foo',
    });
  },
};
```

Examples of **correct** code for this rule:

```js
/* eslint eslint-plugin/require-meta-has-suggestions: "error" */

module.exports = {
  meta: { hasSuggestions: true },
  create (context) {
    context.report({
      node,
      message: 'foo',
      suggest: [
        {
          desc: 'Insert space at the beginning',
          fix: fixer => fixer.insertTextBefore(node, ' '),
        },
      ],
    });
  },
};
```

```js
/* eslint eslint-plugin/require-meta-has-suggestions: "error" */

module.exports = {
  meta: {},
  create (context) {
    context.report({
      node,
      message: 'foo',
    });
  },
};
```

## Further Reading

* [ESLint's suggestion API](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions)
* [ESLint rule basics describing the `meta.hasSuggestions` property](https://eslint.org/docs/developer-guide/working-with-rules#rule-basics)
