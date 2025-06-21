import type { Rule } from 'eslint';
import type {
  ArrowFunctionExpression,
  Expression,
  FunctionDeclaration,
  FunctionExpression,
  Node,
  SpreadElement,
} from 'estree';

export interface FunctionInfo {
  codePath: Rule.CodePath | null;
  hasReturnWithFixer: boolean;
  hasYieldWithFixer: boolean;
  node: Node | null;
  shouldCheck: boolean;
  upper: FunctionInfo | null;
}

export interface PartialRuleInfo {
  create?: Node | null;
  isNewStyle?: boolean;
  meta?: Node | null;
}

export interface RuleInfo extends PartialRuleInfo {
  create: FunctionExpression | ArrowFunctionExpression | FunctionDeclaration;
  isNewStyle: boolean;
}

export type TestInfo = {
  invalid: (Expression | SpreadElement | null)[];
  valid: (Expression | SpreadElement | null)[];
};
