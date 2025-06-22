import { Program as EstreeProgram } from 'estree';

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
