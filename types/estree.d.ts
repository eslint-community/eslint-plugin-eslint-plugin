import { Program as EstreeProgram } from 'estree';

/**
 * This file augments the `estree` types to include a couple of types that are not built-in to `estree` that we're using.
 * This is necessary because the `estree` types are used by ESLint, and ESLint does not natively support
 * TypeScript types.  Since we're only using a couple of them, we can just add them here, rather than
 * installing typescript estree types.
 *
 * This also adds support for the AST mutation that ESLint does to add parent nodes.
 */
declare module 'estree' {
  interface BaseNode {
    parent: Node;
  }

  interface TSAsExpression extends BaseExpression {
    type: 'TSAsExpression';
    expression: Expression | Identifier;
  }

  interface TSExportAssignment extends BaseNode {
    type: 'TSExportAssignment';
    expression: Expression;
  }

  interface ExpressionMap {
    TSAsExpression: TSAsExpression;
  }

  interface NodeMap {
    TSAsExpression: TSAsExpression;
    TSExportAssignment: TSExportAssignment;
  }
}
