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

## Options

<!-- begin auto-generated rule options list -->

| Name                      | Description                                                                          | Type  |
| :------------------------ | :----------------------------------------------------------------------------------- | :---- |
| `additionalNodeTypeFiles` | Any additional regular expressions to consider source files defining AST Node types. | Array |

<!-- end auto-generated rule options list -->

### `additionalNodeTypeFiles`

Here is an example of how the additionalNodeTypeFiles option can be configured in an ESLint configuration file:

```json
{
  "rules": {
    "eslint-plugin/no-property-in-node": [
      "error",
      {
        "additionalNodeTypeFiles": [
          "/packages[/\\]types[/\\]dist[/\\]generated[/\\]ast-spec.d.ts/",
          "/custom/path/to/types/definition.d.ts/"
        ]
      }
    ]
  }
}
```
