# Disallow using `in` to narrow node types instead of looking at properties (`eslint-plugin/no-property-in-node`)

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

When working with a node of type `ESTree.Node` or `TSESTree.Node`, it can be tempting to use the `'in'` operator to narrow the node's type.
`'in'` narrowing is susceptible to confusing behavior from quirks of ASTs, such as node properties sometimes being omitted from nodes and other times explicitly being set to `null` or `undefined`.

Instead, checking a node's `type` property is generally considered preferable.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
/* eslint eslint-plugin/no-property-in-node: error */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    /* ... */
  },
  create(context) {
    return {
      'ClassDeclaration, FunctionDeclaration'(node) {
        if ('superClass' in node) {
          console.log('This is a class declaration:', node);
        }
      },
    };
  },
};
```

Examples of **correct** code for this rule:

```ts
/* eslint eslint-plugin/no-property-in-node: error */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    /* ... */
  },
  create(context) {
    return {
      'ClassDeclaration, FunctionDeclaration'(node) {
        if (node.type === 'ClassDeclaration') {
          console.log('This is a class declaration:', node);
        }
      },
    };
  },
};
```
