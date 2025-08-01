import { getStaticValue, findVariable } from '@eslint-community/eslint-utils';
import type { Rule, Scope, SourceCode } from 'eslint';
import estraverse from 'estraverse';
import type {
  ArrowFunctionExpression,
  AssignmentProperty,
  CallExpression,
  Directive,
  Expression,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  MaybeNamedClassDeclaration,
  MaybeNamedFunctionDeclaration,
  MemberExpression,
  ModuleDeclaration,
  Node,
  ObjectExpression,
  Pattern,
  Program,
  Property,
  SpreadElement,
  Statement,
  Super,
  TSExportAssignment,
  VariableDeclarator,
} from 'estree';

import type {
  MetaDocsProperty,
  PartialRuleInfo,
  RuleInfo,
  TestInfo,
  ViolationAndSuppressionData,
} from './types.js';

const functionTypes = new Set([
  'FunctionExpression',
  'ArrowFunctionExpression',
  'FunctionDeclaration',
]);
const isFunctionType = (
  node:
    | MaybeNamedClassDeclaration
    | MaybeNamedFunctionDeclaration
    | Node
    | null
    | undefined,
): node is FunctionExpression | ArrowFunctionExpression | FunctionDeclaration =>
  !!node && functionTypes.has(node.type);

/**
 * Determines whether a node is a 'normal' (i.e. non-async, non-generator) function expression.
 * @param node The node in question
 * @returns `true` if the node is a normal function expression
 */
function isNormalFunctionExpression(
  node: FunctionExpression | ArrowFunctionExpression | FunctionDeclaration,
): boolean {
  return !node.generator && !node.async;
}

/**
 * Determines whether a node is constructing a RuleTester instance
 * @param {ASTNode} node The node in question
 * @returns `true` if the node is probably constructing a RuleTester instance
 */
function isRuleTesterConstruction(node: Expression | Super): boolean {
  return (
    node.type === 'NewExpression' &&
    ((node.callee.type === 'Identifier' && node.callee.name === 'RuleTester') ||
      (node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'RuleTester'))
  );
}

const interestingRuleKeys = ['create', 'meta'] as const;
type InterestingRuleKey = (typeof interestingRuleKeys)[number];
const INTERESTING_RULE_KEYS = new Set(interestingRuleKeys);

const isInterestingRuleKey = (key: string): key is InterestingRuleKey =>
  INTERESTING_RULE_KEYS.has(key as InterestingRuleKey);

/**
 * Collect properties from an object that have interesting key names into a new object
 * @param properties
 * @param interestingKeys
 */
function collectInterestingProperties<T extends string>(
  properties: (Property | SpreadElement)[],
  interestingKeys: Set<T>,
): Record<T, Expression | Pattern> {
  return properties.reduce<Record<string, Expression | Pattern>>(
    (parsedProps, prop) => {
      const keyValue = getKeyName(prop);
      if (isProperty(prop) && keyValue && interestingKeys.has(keyValue as T)) {
        // In TypeScript, unwrap any usage of `{} as const`.
        parsedProps[keyValue] =
          prop.value.type === 'TSAsExpression'
            ? prop.value.expression
            : prop.value;
      }
      return parsedProps;
    },
    {},
  );
}

/**
 * Check if there is a return statement that returns an object somewhere inside the given node.
 */
function hasObjectReturn(node: Node): boolean {
  let foundMatch = false;
  estraverse.traverse(node, {
    enter(child) {
      if (
        child.type === 'ReturnStatement' &&
        child.argument &&
        child.argument.type === 'ObjectExpression'
      ) {
        foundMatch = true;
      }
    },
    fallback: 'iteration', // Don't crash on unexpected node types.
  });
  return foundMatch;
}

/**
 * Determine if the given node is likely to be a function-style rule.
 * @param node
 */
function isFunctionRule(
  node: Node | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration,
): boolean {
  return (
    isFunctionType(node) && // Is a function expression or declaration.
    isNormalFunctionExpression(node) && // Is a function definition.
    node.params.length === 1 && // The function has a single `context` argument.
    hasObjectReturn(node) // Returns an object containing the visitor functions.
  );
}

/**
 * Check if the given node is a function call representing a known TypeScript rule creator format.
 */
function isTypeScriptRuleHelper(
  node: Node | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration,
): node is CallExpression & { arguments: ObjectExpression[] } {
  return (
    node.type === 'CallExpression' &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'ObjectExpression' &&
    // Check various TypeScript rule helper formats.
    // createESLintRule({ ... })
    (node.callee.type === 'Identifier' ||
      // util.createRule({ ... })
      (node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.property.type === 'Identifier') ||
      // ESLintUtils.RuleCreator(docsUrl)({ ... })
      (node.callee.type === 'CallExpression' &&
        node.callee.callee.type === 'MemberExpression' &&
        node.callee.callee.object.type === 'Identifier' &&
        node.callee.callee.property.type === 'Identifier'))
  );
}

/**
 * Helper for `getRuleInfo`. Handles ESM and TypeScript rules.
 */
function getRuleExportsESM(
  ast: Omit<Program, 'body'> & {
    body: (Directive | Statement | ModuleDeclaration | TSExportAssignment)[];
  },
  scopeManager: Scope.ScopeManager,
): PartialRuleInfo {
  const possibleNodes: (
    | Node
    | MaybeNamedClassDeclaration
    | Expression
    | MaybeNamedFunctionDeclaration
  )[] = [];

  for (const statement of ast.body) {
    switch (statement.type) {
      // export default rule;
      case 'ExportDefaultDeclaration': {
        possibleNodes.push(statement.declaration);
        break;
      }
      // export = rule;
      case 'TSExportAssignment': {
        possibleNodes.push(statement.expression);
        break;
      }
      // export const rule = { ... };
      // or export {rule};
      case 'ExportNamedDeclaration': {
        for (const specifier of statement.specifiers) {
          possibleNodes.push(specifier.local);
        }
        if (statement.declaration) {
          const nodes =
            statement.declaration.type === 'VariableDeclaration'
              ? statement.declaration.declarations.map(
                  (declarator) => declarator.init!,
                )
              : [statement.declaration];

          // named exports like `export const rule = { ... };`
          // skip if it's function-style to avoid false positives
          // refs: https://github.com/eslint-community/eslint-plugin-eslint-plugin/issues/450
          possibleNodes.push(
            ...nodes.filter((node) => node && !isFunctionType(node)),
          );
        }
        break;
      }
    }
  }

  return possibleNodes.reduce<PartialRuleInfo>((currentExports, node) => {
    if (node.type === 'ObjectExpression') {
      // Check `export default { create() {}, meta: {} }`
      return collectInterestingProperties(
        node.properties,
        INTERESTING_RULE_KEYS,
      );
    } else if (isFunctionRule(node)) {
      // Check `export default function(context) { return { ... }; }`
      return { create: node, meta: undefined, isNewStyle: false };
    } else if (isTypeScriptRuleHelper(node)) {
      // Check `export default someTypeScriptHelper({ create() {}, meta: {} });
      return collectInterestingProperties(
        node.arguments[0].properties,
        INTERESTING_RULE_KEYS,
      );
    } else if (node.type === 'Identifier') {
      // Rule could be stored in a variable before being exported.
      const possibleRule = findVariableValue(node, scopeManager);
      if (possibleRule) {
        if (possibleRule.type === 'ObjectExpression') {
          // Check `const possibleRule = { ... }; export default possibleRule;
          return collectInterestingProperties(
            possibleRule.properties,
            INTERESTING_RULE_KEYS,
          );
        } else if (isFunctionRule(possibleRule)) {
          // Check `const possibleRule = function(context) { return { ... } }; export default possibleRule;`
          return { create: possibleRule, meta: undefined, isNewStyle: false };
        } else if (isTypeScriptRuleHelper(possibleRule)) {
          // Check `const possibleRule = someTypeScriptHelper({ ... }); export default possibleRule;
          return collectInterestingProperties(
            possibleRule.arguments[0].properties,
            INTERESTING_RULE_KEYS,
          );
        }
      }
    }
    return currentExports;
  }, {} as PartialRuleInfo);
}

/**
 * Helper for `getRuleInfo`. Handles CJS rules.
 */
function getRuleExportsCJS(
  ast: Program,
  scopeManager: Scope.ScopeManager,
): PartialRuleInfo {
  let exportsVarOverridden = false;
  let exportsIsFunction = false;
  return ast.body
    .filter((statement) => statement.type === 'ExpressionStatement')
    .map((statement) => statement.expression)
    .filter((expression) => expression.type === 'AssignmentExpression')
    .filter((expression) => expression.left.type === 'MemberExpression')
    .reduce<PartialRuleInfo>((currentExports, node) => {
      const leftExpression = node.left as MemberExpression;
      if (
        leftExpression.object.type === 'Identifier' &&
        leftExpression.object.name === 'module' &&
        leftExpression.property.type === 'Identifier' &&
        leftExpression.property.name === 'exports'
      ) {
        exportsVarOverridden = true;
        if (isFunctionRule(node.right)) {
          // Check `module.exports = function (context) { return { ... }; }`

          exportsIsFunction = true;
          return { create: node.right, meta: undefined, isNewStyle: false };
        } else if (node.right.type === 'ObjectExpression') {
          // Check `module.exports = { create: function () {}, meta: {} }`

          return collectInterestingProperties(
            node.right.properties,
            INTERESTING_RULE_KEYS,
          );
        } else if (node.right.type === 'Identifier') {
          // Rule could be stored in a variable before being exported.
          const possibleRule = findVariableValue(node.right, scopeManager);
          if (possibleRule) {
            if (possibleRule.type === 'ObjectExpression') {
              // Check `const possibleRule = { ... }; module.exports = possibleRule;
              return collectInterestingProperties(
                possibleRule.properties,
                INTERESTING_RULE_KEYS,
              );
            } else if (isFunctionRule(possibleRule)) {
              // Check `const possibleRule = function(context) { return { ... } }; module.exports = possibleRule;`
              return {
                create: possibleRule,
                meta: undefined,
                isNewStyle: false,
              };
            }
          }
        }
        return {};
      } else if (
        !exportsIsFunction &&
        leftExpression.object.type === 'MemberExpression' &&
        leftExpression.object.object.type === 'Identifier' &&
        leftExpression.object.object.name === 'module' &&
        leftExpression.object.property.type === 'Identifier' &&
        leftExpression.object.property.name === 'exports' &&
        leftExpression.property.type === 'Identifier' &&
        isInterestingRuleKey(leftExpression.property.name)
      ) {
        // Check `module.exports.create = () => {}`

        currentExports[leftExpression.property.name] = node.right;
      } else if (
        !exportsVarOverridden &&
        leftExpression.object.type === 'Identifier' &&
        leftExpression.object.name === 'exports' &&
        leftExpression.property.type === 'Identifier' &&
        isInterestingRuleKey(leftExpression.property.name)
      ) {
        // Check `exports.create = () => {}`

        currentExports[leftExpression.property.name] = node.right;
      }
      return currentExports;
    }, {} as PartialRuleInfo);
}

/**
 * Find the value of a property in an object by its property key name.
 * @param obj
 * @returns property value
 */
function findObjectPropertyValueByKeyName(
  obj: ObjectExpression,
  keyName: String,
): Property['value'] | undefined {
  const property = obj.properties.find(
    (prop) =>
      isProperty(prop) &&
      prop.key.type === 'Identifier' &&
      prop.key.name === keyName,
  ) as Property | undefined;
  return property ? property.value : undefined;
}

/**
 * Get the first value (or function) that a variable is initialized to.
 * @param node - the Identifier node for the variable.
 * @returns the first value (or function) that the given variable is initialized to.
 */
function findVariableValue(
  node: Identifier,
  scopeManager: Scope.ScopeManager,
): Expression | FunctionDeclaration | undefined {
  const variable = findVariable(
    scopeManager.acquire(node) || scopeManager.globalScope!,
    node,
  );
  if (variable && variable.defs && variable.defs[0] && variable.defs[0].node) {
    const variableDefNode: Node = variable.defs[0].node;
    if (variableDefNode.type === 'VariableDeclarator' && variableDefNode.init) {
      // Given node `x`, get `123` from `const x = 123;`.
      return variableDefNode.init;
    } else if (variableDefNode.type === 'FunctionDeclaration') {
      // Given node `foo`, get `function foo() {}` from `function foo() {}`.
      return variableDefNode;
    }
  }
}

/**
 * Retrieve all possible elements from an array.
 * If a ternary conditional expression is involved, retrieve the elements that may exist on both sides of it.
 * Ex: [a, b, c] will return [a, b, c]
 * Ex: foo ? [a, b, c] : [d, e, f] will return [a, b, c, d, e, f]
 * @param node
 * @returns the list of elements
 */
function collectArrayElements(node: Node): Node[] {
  if (!node) {
    return [];
  }
  if (node.type === 'ArrayExpression') {
    return node.elements.filter((element) => element !== null);
  }
  if (node.type === 'ConditionalExpression') {
    return [
      ...collectArrayElements(node.consequent),
      ...collectArrayElements(node.alternate),
    ];
  }
  return [];
}

/**
* Performs static analysis on an AST to try to determine the final value of `module.exports`.
* @param sourceCode The object contains `Program` AST node, and optional `scopeManager`
* @returns An object with keys `meta`, `create`, and `isNewStyle`. `meta` and `create` correspond to the AST nodes
for the final values of `module.exports.meta` and `module.exports.create`. `isNewStyle` will be `true` if `module.exports`
is an object, and `false` if `module.exports` is just the `create` function. If no valid ESLint rule info can be extracted
from the file, the return value will be `null`.
*/
export function getRuleInfo({
  ast,
  scopeManager,
}: {
  ast: Program;
  scopeManager: Scope.ScopeManager;
}): RuleInfo | null {
  const exportNodes =
    ast.sourceType === 'module'
      ? getRuleExportsESM(ast, scopeManager)
      : getRuleExportsCJS(ast, scopeManager);

  const createExists = 'create' in exportNodes;
  if (!createExists) {
    return null;
  }

  // If create/meta are defined in variables, get their values.
  for (const key of interestingRuleKeys) {
    const exportNode = exportNodes[key];
    if (exportNode && exportNode.type === 'Identifier') {
      const value = findVariableValue(exportNode, scopeManager);
      if (value) {
        exportNodes[key] = value;
      }
    }
  }

  const { create, ...remainingExportNodes } = exportNodes;
  if (!(isFunctionType(create) && isNormalFunctionExpression(create))) {
    return null;
  }

  return { isNewStyle: true, create, ...remainingExportNodes };
}

/**
 * Gets all the identifiers referring to the `context` variable in a rule source file. Note that this function will
 * only work correctly after traversing the AST has started (e.g. in the first `Program` node).
 * @param scopeManager
 * @param ast The `Program` node for the file
 * @returns A Set of all `Identifier` nodes that are references to the `context` value for the file
 */
export function getContextIdentifiers(
  scopeManager: Scope.ScopeManager,
  ast: Program,
): Set<Identifier> {
  const ruleInfo = getRuleInfo({ ast, scopeManager });

  if (
    !ruleInfo ||
    ruleInfo.create?.params.length === 0 ||
    ruleInfo.create.params[0].type !== 'Identifier'
  ) {
    return new Set();
  }

  return new Set(
    scopeManager
      .getDeclaredVariables(ruleInfo.create)
      .find(
        (variable) =>
          variable.name === (ruleInfo.create.params[0] as Identifier).name,
      )!
      .references.map((ref) => ref.identifier),
  );
}

/**
 * Gets the key name of a Property, if it can be determined statically.
 * @param node The `Property` node
 * @param scope
 * @returns The key name, or `null` if the name cannot be determined statically.
 */
export function getKeyName(
  property: Property | SpreadElement,
  scope?: Scope.Scope,
): string | null {
  if (!('key' in property)) {
    // likely a SpreadElement or another non-standard node
    return null;
  }
  if (property.key.type === 'Identifier') {
    if (property.computed) {
      // Variable key: { [myVariable]: 'hello world' }
      if (scope) {
        const staticValue = getStaticValue(property.key, scope);
        return staticValue ? (staticValue.value as string) : null;
      }
      // TODO: ensure scope is always passed to getKeyName() so we don't need to handle the case where it's not passed.
      return null;
    }
    return property.key.name;
  }
  if (property.key.type === 'Literal') {
    return '' + property.key.value;
  }
  if (
    property.key.type === 'TemplateLiteral' &&
    property.key.quasis.length === 1
  ) {
    return property.key.quasis[0].value.cooked ?? null;
  }
  return null;
}

/**
 * Extracts the body of a function if the given node is a function
 *
 * @param node
 */
function extractFunctionBody(
  node: Expression | SpreadElement,
): (Statement | Expression)[] {
  if (
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionExpression'
  ) {
    if (node.body.type === 'BlockStatement') {
      return node.body.body;
    }

    return [node.body];
  }

  return [];
}

/**
 * Checks the given statements for possible test info
 *
 * @param context The `context` variable for the source file itself
 * @param statements The statements to check
 * @param variableIdentifiers
 */
function checkStatementsForTestInfo(
  context: Rule.RuleContext,
  statements: (ModuleDeclaration | Statement | Directive | Expression)[],
  variableIdentifiers = new Set<Node>(),
): CallExpression[] {
  const sourceCode = context.sourceCode;
  const runCalls = [];

  for (const statement of statements) {
    if (statement.type === 'VariableDeclaration') {
      for (const declarator of statement.declarations) {
        if (!declarator.init) {
          continue;
        }

        const extracted = extractFunctionBody(declarator.init);

        runCalls.push(
          ...checkStatementsForTestInfo(
            context,
            extracted,
            variableIdentifiers,
          ),
        );

        if (
          isRuleTesterConstruction(declarator.init) &&
          declarator.id.type === 'Identifier'
        ) {
          const vars = sourceCode.getDeclaredVariables(declarator);
          vars.forEach((variable) => {
            variable.references
              .filter((ref) => ref.isRead())
              .forEach((ref) => variableIdentifiers.add(ref.identifier));
          });
        }
      }
    }

    if (statement.type === 'FunctionDeclaration') {
      runCalls.push(
        ...checkStatementsForTestInfo(
          context,
          statement.body.body,
          variableIdentifiers,
        ),
      );
    }

    if (statement.type === 'IfStatement') {
      const body =
        statement.consequent.type === 'BlockStatement'
          ? statement.consequent.body
          : [statement.consequent];

      runCalls.push(
        ...checkStatementsForTestInfo(context, body, variableIdentifiers),
      );

      continue;
    }

    const expression =
      statement.type === 'ExpressionStatement'
        ? statement.expression
        : statement;

    if (expression.type !== 'CallExpression') {
      continue;
    }

    for (const arg of expression.arguments) {
      const extracted = extractFunctionBody(arg);

      runCalls.push(
        ...checkStatementsForTestInfo(context, extracted, variableIdentifiers),
      );
    }

    if (
      expression.callee.type === 'MemberExpression' &&
      (isRuleTesterConstruction(expression.callee.object) ||
        variableIdentifiers.has(expression.callee.object)) &&
      expression.callee.property.type === 'Identifier' &&
      expression.callee.property.name === 'run'
    ) {
      runCalls.push(expression);
    }
  }

  return runCalls;
}

/**
 * Performs static analysis on an AST to try to find test cases
 * @param context The `context` variable for the source file itself
 * @param ast The `Program` node for the file.
 * @returns A list of objects with `valid` and `invalid` keys containing a list of AST nodes corresponding to tests
 */
export function getTestInfo(
  context: Rule.RuleContext,
  ast: Program,
): TestInfo[] {
  const runCalls = checkStatementsForTestInfo(context, ast.body);

  return runCalls
    .filter((call) => call.arguments.length >= 3)
    .map((call) => call.arguments[2])
    .filter((call) => call.type === 'ObjectExpression')
    .map((run) => {
      const validProperty = run.properties.find(
        (prop) => getKeyName(prop) === 'valid',
      );
      const invalidProperty = run.properties.find(
        (prop) => getKeyName(prop) === 'invalid',
      );

      return {
        valid:
          validProperty &&
          validProperty.type !== 'SpreadElement' &&
          validProperty.value.type === 'ArrayExpression'
            ? validProperty.value.elements.filter(Boolean)
            : [],
        invalid:
          invalidProperty &&
          invalidProperty.type !== 'SpreadElement' &&
          invalidProperty.value.type === 'ArrayExpression'
            ? invalidProperty.value.elements.filter(Boolean)
            : [],
      };
    });
}

/**
 * Gets information on a report, given the ASTNode of context.report().
 * @param node The ASTNode of context.report()
 */
export function getReportInfo(
  node: CallExpression,
  context: Rule.RuleContext,
):
  | Record<string, Property['value']>
  | Record<string, Expression | SpreadElement>
  | null {
  const reportArgs = node.arguments;

  // If there is exactly one argument, the API expects an object.
  // Otherwise, if the second argument is a string, the arguments are interpreted as
  // ['node', 'message', 'data', 'fix'].
  // Otherwise, the arguments are interpreted as ['node', 'loc', 'message', 'data', 'fix'].

  if (reportArgs.length === 0) {
    return null;
  }

  if (reportArgs.length === 1) {
    if (reportArgs[0].type === 'ObjectExpression') {
      return reportArgs[0].properties.reduce<Record<string, Property['value']>>(
        (reportInfo, property) => {
          const propName = getKeyName(property);

          if (propName !== null && 'value' in property) {
            return Object.assign(reportInfo, { [propName]: property.value });
          }
          return reportInfo;
        },
        {},
      );
    }
    return null;
  }

  let keys: string[];
  const sourceCode = context.sourceCode;
  const scope = sourceCode.getScope(node);
  const secondArgStaticValue = getStaticValue(reportArgs[1], scope);

  if (
    (secondArgStaticValue && typeof secondArgStaticValue.value === 'string') ||
    reportArgs[1].type === 'TemplateLiteral'
  ) {
    keys = ['node', 'message', 'data', 'fix'];
  } else if (
    reportArgs[1].type === 'ObjectExpression' ||
    reportArgs[1].type === 'ArrayExpression' ||
    (reportArgs[1].type === 'Literal' &&
      typeof reportArgs[1].value !== 'string') ||
    (secondArgStaticValue &&
      ['object', 'number'].includes(typeof secondArgStaticValue.value))
  ) {
    keys = ['node', 'loc', 'message', 'data', 'fix'];
  } else {
    // Otherwise, we can't statically determine what argument means what, so no safe fix is possible.
    return null;
  }

  return Object.fromEntries(
    keys
      .slice(0, reportArgs.length)
      .map((key, index) => [key, reportArgs[index]]),
  );
}

/**
 * Gets a set of all `sourceCode` identifiers.
 * @param scopeManager
 * @param ast The AST of the file. This must have `parent` properties.
 * @returns A set of all identifiers referring to the `SourceCode` object.
 */
export function getSourceCodeIdentifiers(
  scopeManager: Scope.ScopeManager,
  ast: Program,
): Set<Identifier> {
  return new Set(
    [...getContextIdentifiers(scopeManager, ast)]
      .filter(
        (identifier) =>
          identifier.parent &&
          identifier.parent.type === 'MemberExpression' &&
          identifier === identifier.parent.object &&
          identifier.parent.property.type === 'Identifier' &&
          identifier.parent.property.name === 'getSourceCode' &&
          identifier.parent.parent.type === 'CallExpression' &&
          identifier.parent === identifier.parent.parent.callee &&
          identifier.parent.parent.parent.type === 'VariableDeclarator' &&
          identifier.parent.parent === identifier.parent.parent.parent.init &&
          identifier.parent.parent.parent.id.type === 'Identifier',
      )
      .flatMap((identifier) =>
        scopeManager.getDeclaredVariables(identifier.parent.parent.parent),
      )
      .flatMap((variable) => variable.references)
      .map((ref) => ref.identifier),
  );
}

/**
 * Insert a given property into a given object literal.
 * @param fixer The fixer.
 * @param node The ObjectExpression node to insert a property.
 * @param propertyText The property code to insert.
 */
export function insertProperty(
  fixer: Rule.RuleFixer,
  node: ObjectExpression,
  propertyText: string,
  sourceCode: SourceCode,
): Rule.Fix {
  if (node.properties.length === 0) {
    return fixer.replaceText(node, `{\n${propertyText}\n}`);
  }
  return fixer.insertTextAfter(
    sourceCode.getLastToken(node.properties.at(-1)!)!,
    `,\n${propertyText}`,
  );
}

/**
 * Collect all context.report({...}) violation/suggestion-related nodes into a standardized array for convenience.
 * @param reportInfo - Result of getReportInfo().
 * @returns {messageId?: String, message?: String, data?: Object, fix?: Function}[]
 */
export function collectReportViolationAndSuggestionData(
  reportInfo: NonNullable<ReturnType<typeof getReportInfo>>,
): ViolationAndSuppressionData[] {
  return [
    // Violation message
    {
      messageId: reportInfo.messageId,
      message: reportInfo.message,
      data: reportInfo.data,
      fix: reportInfo.fix,
    },
    // Suggestion messages
    ...collectArrayElements(reportInfo.suggest)
      .map((suggestObjNode) => {
        if (suggestObjNode.type !== 'ObjectExpression') {
          // Ignore non-objects (like variables or function calls).
          return null;
        }
        return {
          messageId: findObjectPropertyValueByKeyName(
            suggestObjNode,
            'messageId',
          ),
          message: findObjectPropertyValueByKeyName(suggestObjNode, 'desc'), // Note: suggestion message named `desc`
          data: findObjectPropertyValueByKeyName(suggestObjNode, 'data'),
          fix: findObjectPropertyValueByKeyName(suggestObjNode, 'fix'),
        };
      })
      .filter((item) => item !== null),
  ];
}

/**
 * Whether the provided node represents an autofixer function.
 * @param node
 * @param contextIdentifiers
 */
export function isAutoFixerFunction(
  node: Node,
  contextIdentifiers: Set<Identifier>,
  context: Rule.RuleContext,
): node is FunctionExpression | ArrowFunctionExpression {
  const parent = node.parent;
  return (
    ['FunctionExpression', 'ArrowFunctionExpression'].includes(node.type) &&
    parent.parent.type === 'ObjectExpression' &&
    parent.parent.parent.type === 'CallExpression' &&
    parent.parent.parent.callee.type === 'MemberExpression' &&
    contextIdentifiers.has(parent.parent.parent.callee.object as Identifier) &&
    parent.parent.parent.callee.property.type === 'Identifier' &&
    parent.parent.parent.callee.property.name === 'report' &&
    getReportInfo(parent.parent.parent, context)?.fix === node
  );
}

/**
 * Whether the provided node represents a suggestion fixer function.
 * @param node
 * @param contextIdentifiers
 * @param context
 */
export function isSuggestionFixerFunction(
  node: Node,
  contextIdentifiers: Set<Identifier>,
  context: Rule.RuleContext,
): boolean {
  const parent = node.parent;
  return (
    (node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression') &&
    isProperty(parent) &&
    parent.key.type === 'Identifier' &&
    parent.key.name === 'fix' &&
    parent.parent.type === 'ObjectExpression' &&
    parent.parent.parent.type === 'ArrayExpression' &&
    isProperty(parent.parent.parent.parent) &&
    parent.parent.parent.parent.key.type === 'Identifier' &&
    parent.parent.parent.parent.key.name === 'suggest' &&
    parent.parent.parent.parent.parent.type === 'ObjectExpression' &&
    parent.parent.parent.parent.parent.parent.type === 'CallExpression' &&
    contextIdentifiers.has(
      // @ts-expect-error -- Property 'object' does not exist on type 'Expression | Super'.  Property 'object' does not exist on type 'ClassExpression'.ts(2339)
      parent.parent.parent.parent.parent.parent.callee.object,
    ) &&
    // @ts-expect-error -- Property 'property' does not exist on type 'Expression | Super'.  Property 'property' does not exist on type 'ClassExpression'.ts(2339)
    parent.parent.parent.parent.parent.parent.callee.property.name ===
      'report' &&
    getReportInfo(parent.parent.parent.parent.parent.parent, context)
      ?.suggest === parent.parent.parent
  );
}

/**
 * List all properties contained in an object.
 * Evaluates and includes any properties that may be behind spreads.
 * @param objectNode
 * @param scopeManager
 * @returns the list of all properties that could be found
 */
export function evaluateObjectProperties(
  objectNode: Node | undefined,
  scopeManager: Scope.ScopeManager,
): (Property | SpreadElement)[] {
  if (!objectNode || objectNode.type !== 'ObjectExpression') {
    return [];
  }

  return objectNode.properties.flatMap((property) => {
    if (property.type === 'SpreadElement') {
      const value = findVariableValue(
        property.argument as Identifier,
        scopeManager,
      );
      if (value && value.type === 'ObjectExpression') {
        return value.properties;
      }
      return [];
    }
    return [property];
  });
}

export function getMetaDocsProperty(
  propertyName: string,
  ruleInfo: RuleInfo,
  scopeManager: Scope.ScopeManager,
): MetaDocsProperty {
  const metaNode = ruleInfo.meta ?? undefined;

  const docsNode = evaluateObjectProperties(metaNode, scopeManager)
    .filter(isProperty)
    .find((p) => getKeyName(p) === 'docs');

  const metaPropertyNode = evaluateObjectProperties(
    docsNode?.value,
    scopeManager,
  )
    .filter(isProperty)
    .find((p) => getKeyName(p) === propertyName);

  return { docsNode, metaNode, metaPropertyNode };
}

/**
 * Get the `meta.messages` node from a rule.
 * @param ruleInfo
 * @param scopeManager
 */
export function getMessagesNode(
  ruleInfo: RuleInfo | null,
  scopeManager: Scope.ScopeManager,
): ObjectExpression | undefined {
  if (!ruleInfo) {
    return;
  }

  const metaNode = ruleInfo.meta ?? undefined;
  const messagesNode = evaluateObjectProperties(metaNode, scopeManager)
    .filter(isProperty)
    .find((p) => getKeyName(p) === 'messages');

  if (messagesNode) {
    if (messagesNode.value.type === 'ObjectExpression') {
      return messagesNode.value;
    }
    const value = findVariableValue(
      messagesNode.value as Identifier,
      scopeManager,
    );
    if (value && value.type === 'ObjectExpression') {
      return value;
    }
  }
}

/**
 * Get the list of messageId properties from `meta.messages` for a rule.
 * @param ruleInfo
 * @param scopeManager
 */
export function getMessageIdNodes(
  ruleInfo: RuleInfo,
  scopeManager: Scope.ScopeManager,
): (Property | SpreadElement)[] | undefined {
  const messagesNode = getMessagesNode(ruleInfo, scopeManager);

  return messagesNode && messagesNode.type === 'ObjectExpression'
    ? evaluateObjectProperties(messagesNode, scopeManager)
    : undefined;
}

const isProperty = (node: Node): node is Property => node.type === 'Property';
/**
 * Get the messageId property from a rule's `meta.messages` that matches the given `messageId`.
 * @param messageId - the messageId to check for
 * @param ruleInfo
 * @param scopeManager
 * @param scope
 * @returns The matching messageId property from `meta.messages`.
 */
export function getMessageIdNodeById(
  messageId: string,
  ruleInfo: RuleInfo,
  scopeManager: Scope.ScopeManager,
  scope: Scope.Scope,
): Property | undefined {
  return getMessageIdNodes(ruleInfo, scopeManager)
    ?.filter(isProperty)
    .find((p) => getKeyName(p, scope) === messageId);
}

export function getMetaSchemaNode(
  metaNode: Node | undefined,
  scopeManager: Scope.ScopeManager,
): Property | undefined {
  return evaluateObjectProperties(metaNode, scopeManager)
    .filter(isProperty)
    .find((p) => getKeyName(p) === 'schema');
}

export function getMetaSchemaNodeProperty(
  schemaNode: AssignmentProperty | Property | undefined,
  scopeManager: Scope.ScopeManager,
): Node | null {
  if (!schemaNode) {
    return null;
  }

  let { value } = schemaNode;
  if (value.type === 'Identifier' && value.name !== 'undefined') {
    const variable = findVariable(
      scopeManager.acquire(value) || scopeManager.globalScope!,
      value,
    );

    // If we can't find the declarator, we have to assume it's in correct type
    if (
      !variable ||
      !variable.defs ||
      !variable.defs[0] ||
      !variable.defs[0].node ||
      variable.defs[0].node.type !== 'VariableDeclarator' ||
      !variable.defs[0].node.init
    ) {
      return null;
    }

    value = (variable.defs[0].node as VariableDeclarator).init! as Expression;
  }

  return value;
}

/**
 * Get the possible values that a variable was initialized to at some point.
 * @param node - the Identifier node for the variable.
 * @param scopeManager
 * @returns the values that the given variable could be initialized to.
 */
export function findPossibleVariableValues(
  node: Identifier,
  scopeManager: Scope.ScopeManager,
): Node[] {
  const variable = findVariable(
    scopeManager.acquire(node) || scopeManager.globalScope!,
    node,
  );
  return ((variable && variable.references) || []).flatMap((ref) => {
    if (
      ref.writeExpr &&
      (ref.writeExpr.parent.type !== 'AssignmentExpression' ||
        ref.writeExpr.parent.operator === '=')
    ) {
      // Given node `x`, get `123` from `x = 123;`.
      // Ignore assignments with other operators like `x += 'abc';'`;
      return [ref.writeExpr];
    }
    return [];
  });
}

/**
 * @param node
 * @returns Whether the node is an Identifier with name `undefined`.
 */
export function isUndefinedIdentifier(node: Node): boolean {
  return node.type === 'Identifier' && node.name === 'undefined';
}

/**
 * Check whether a variable's definition is from a function parameter.
 * @param node - the Identifier node for the variable.
 * @param scopeManager
 * @returns whether the variable comes from a function parameter
 */
export function isVariableFromParameter(
  node: Identifier,
  scopeManager: Scope.ScopeManager,
): boolean {
  const variable = findVariable(
    scopeManager.acquire(node) || scopeManager.globalScope!,
    node,
  );

  return variable?.defs[0]?.type === 'Parameter';
}
