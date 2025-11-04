import type { Rule } from 'eslint';
import type {
  ArrayPattern,
  ArrowFunctionExpression,
  AssignmentPattern,
  Expression,
  FunctionDeclaration,
  FunctionExpression,
  Literal,
  MaybeNamedClassDeclaration,
  MaybeNamedFunctionDeclaration,
  Node,
  ObjectPattern,
  Pattern,
  Property,
  RestElement,
  SpreadElement,
} from 'estree';

export interface FunctionInfo {
  codePath: Rule.CodePath | null;
  hasReturnWithFixer?: boolean;
  hasYieldWithFixer?: boolean;
  node: Node | null;
  shouldCheck: boolean;
  upper: FunctionInfo | null;
}

export interface PartialRuleInfo {
  create?:
    | Node
    | MaybeNamedFunctionDeclaration
    | MaybeNamedClassDeclaration
    | null;
  isNewStyle?: boolean;
  meta?: Expression | Pattern | FunctionDeclaration;
}

export interface RuleInfo extends PartialRuleInfo {
  create: FunctionExpression | ArrowFunctionExpression | FunctionDeclaration;
  isNewStyle: boolean;
}

export type TestInfo = {
  invalid: (Expression | SpreadElement | null)[];
  valid: (Expression | SpreadElement | null)[];
};

export type ViolationAndSuppressionData = {
  messageId?:
    | Expression
    | SpreadElement
    | ObjectPattern
    | ArrayPattern
    | RestElement
    | AssignmentPattern;
  message?:
    | Expression
    | SpreadElement
    | ObjectPattern
    | ArrayPattern
    | RestElement
    | AssignmentPattern;
  data?:
    | Expression
    | SpreadElement
    | ObjectPattern
    | ArrayPattern
    | RestElement
    | AssignmentPattern;
  fix?:
    | Expression
    | SpreadElement
    | ObjectPattern
    | ArrayPattern
    | RestElement
    | AssignmentPattern;
};

export type MetaDocsProperty = {
  docsNode: Property | undefined;
  metaNode: Node | undefined;
  metaPropertyNode: Property | undefined;
};

export type StringLiteral = Literal & { value: string };
