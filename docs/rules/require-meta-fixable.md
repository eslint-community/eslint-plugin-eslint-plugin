# require rules to implement a meta.fixable property (require-meta-fixable)

A fixable ESLint rule must have a valid `meta.fixable` property. A rule reports a problem with a `fix()` function but does not export a `meta.fixable` property is likely to cause an unexpected error.

## Rule Details

This rule aims to require ESLint rules to have a `meta.fixable` property if necessary.

The following patterns are considered warnings:

```js

/* eslint eslint-plugin/require-meta-fixable: "error" */

module.exports = {
  meta: {},
  create(context) {
    context.report({
      node,
      message: 'foo',
      fix(fixer) {
        return fixer.remove(node);
      }
    });
  }
};

```

```js

/* eslint eslint-plugin/require-meta-fixable: "error" */

module.exports = {
  meta: { fixable: 'not a valid meta.fixable value' },
  create(context) {
    context.report({
      node,
      message: 'foo',
      fix(fixer) {
        return fixer.remove(node);
      }
    });
  }
};

```

```js

/* eslint eslint-plugin/require-meta-fixable: "error" */

module.exports = function create(context) {
  context.report({
    node,
    message: 'foo',
    fix(fixer) {
      return fixer.remove(node);
    }
  });
};

```

The following patterns are not warnings:

```js

/* eslint eslint-plugin/require-meta-fixable: "error" */

module.exports = {
  meta: { fixable: 'code' },
  create(context) {
    context.report({
      node,
      message: 'foo',
      fix(fixer) {
        return fixer.remove(node);
      }
    });
  }
};

```

```js

/* eslint eslint-plugin/require-meta-fixable: "error" */

module.exports = {
  meta: {},
  create(context) {
    context.report({
      node,
      message: 'foo'
    });
  }
};

```

## When Not To Use It

If you do not plan to implement autofixable rules, you can turn off this rule.

## Further Reading

* [ESLint's autofix API](http://eslint.org/docs/developer-guide/working-with-rules#applying-fixes)
