# Disallow using `in` to narrow node types instead of looking at properties (`eslint-plugin/no-property-in-node`)

💼 This rule is enabled in the ☑️ `recommended-type-checked` [config](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).

💭 This rule requires type information.

<!-- end auto-generated rule header -->

When working with a node of type `ESTree.Node` or `TSESTree.Node`, it can be tempting to use the `'in'` operator to narrow the node's type.
`'in'` narrowing is susceptible to confusing behavior from quirks of ASTs, such as node properties sometimes being omitted from nodes and other times explicitly being set to `null` or `undefined`.

Using direct property checks is generally considered preferable.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
/* eslint eslint-plugin/no-property-in-node: error */

declare const node: TSESTree.Parameter;

if ('optional' in node) {
  node.optional;
}
```

Examples of **correct** code for this rule:

```ts
/* eslint eslint-plugin/no-property-in-node: error */

declare const node: TSESTree.Parameter;

if (node.type !== TSESTree.AST_NODE_TYPES.TSParameterProperty) {
  node.optional;
}
```
