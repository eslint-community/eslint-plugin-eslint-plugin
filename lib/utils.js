'use strict';

const { getStaticValue, findVariable } = require('eslint-utils');
const estraverse = require('estraverse');

/**
 * Determines whether a node is a 'normal' (i.e. non-async, non-generator) function expression.
 * @param {ASTNode} node The node in question
 * @returns {boolean} `true` if the node is a normal function expression
 */
function isNormalFunctionExpression(node) {
  const functionTypes = [
    'FunctionExpression',
    'ArrowFunctionExpression',
    'FunctionDeclaration',
  ];
  return functionTypes.includes(node.type) && !node.generator && !node.async;
}

/**
 * Determines whether a node is constructing a RuleTester instance
 * @param {ASTNode} node The node in question
 * @returns {boolean} `true` if the node is probably constructing a RuleTester instance
 */
function isRuleTesterConstruction(node) {
  return (
    node.type === 'NewExpression' &&
    ((node.callee.type === 'Identifier' && node.callee.name === 'RuleTester') ||
      (node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'RuleTester'))
  );
}

const INTERESTING_RULE_KEYS = new Set(['create', 'meta']);

/**
 * Collect properties from an object that have interesting key names into a new object
 * @param {Node[]} properties
 * @param {Set<String>} interestingKeys
 * @returns Object
 */
function collectInterestingProperties(properties, interestingKeys) {
  // eslint-disable-next-line unicorn/prefer-object-from-entries
  return properties.reduce((parsedProps, prop) => {
    const keyValue = module.exports.getKeyName(prop);
    if (interestingKeys.has(keyValue)) {
      // In TypeScript, unwrap any usage of `{} as const`.
      parsedProps[keyValue] =
        prop.value.type === 'TSAsExpression'
          ? prop.value.expression
          : prop.value;
    }
    return parsedProps;
  }, {});
}

/**
 * Check if there is a return statement that returns an object somewhere inside the given node.
 * @param {Node} node
 * @returns {boolean}
 */
function hasObjectReturn(node) {
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
 * @param {*} node
 * @returns {boolean}
 */
function isFunctionRule(node) {
  return (
    isNormalFunctionExpression(node) && // Is a function definition.
    node.params.length === 1 && // The function has a single `context` argument.
    hasObjectReturn(node) // Returns an object containing the visitor functions.
  );
}

/**
 * Check if the given node is a function call representing a known TypeScript rule creator format.
 * @param {Node} node
 * @returns {boolean}
 */
function isTypeScriptRuleHelper(node) {
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
function getRuleExportsESM(ast, scopeManager) {
  return (
    ast.body
      .filter((statement) => statement.type === 'ExportDefaultDeclaration')
      .map((statement) => statement.declaration)
      // eslint-disable-next-line unicorn/prefer-object-from-entries
      .reduce((currentExports, node) => {
        if (node.type === 'ObjectExpression') {
          // Check `export default { create() {}, meta: {} }`
          return collectInterestingProperties(
            node.properties,
            INTERESTING_RULE_KEYS
          );
        } else if (isFunctionRule(node)) {
          // Check `export default function(context) { return { ... }; }`
          return { create: node, meta: null, isNewStyle: false };
        } else if (isTypeScriptRuleHelper(node)) {
          // Check `export default someTypeScriptHelper({ create() {}, meta: {} });
          return collectInterestingProperties(
            node.arguments[0].properties,
            INTERESTING_RULE_KEYS
          );
        } else if (node.type === 'Identifier') {
          // Rule could be stored in a variable before being exported.
          const possibleRule = findVariableValue(node, scopeManager);
          if (possibleRule) {
            if (possibleRule.type === 'ObjectExpression') {
              // Check `const possibleRule = { ... }; export default possibleRule;
              return collectInterestingProperties(
                possibleRule.properties,
                INTERESTING_RULE_KEYS
              );
            } else if (isFunctionRule(possibleRule)) {
              // Check `const possibleRule = function(context) { return { ... } }; export default possibleRule;`
              return { create: possibleRule, meta: null, isNewStyle: false };
            } else if (isTypeScriptRuleHelper(possibleRule)) {
              // Check `const possibleRule = someTypeScriptHelper({ ... }); export default possibleRule;
              return collectInterestingProperties(
                possibleRule.arguments[0].properties,
                INTERESTING_RULE_KEYS
              );
            }
          }
        }
        return currentExports;
      }, {})
  );
}

/**
 * Helper for `getRuleInfo`. Handles CJS rules.
 */
function getRuleExportsCJS(ast, scopeManager) {
  let exportsVarOverridden = false;
  let exportsIsFunction = false;
  return (
    ast.body
      .filter((statement) => statement.type === 'ExpressionStatement')
      .map((statement) => statement.expression)
      .filter((expression) => expression.type === 'AssignmentExpression')
      .filter((expression) => expression.left.type === 'MemberExpression')
      // eslint-disable-next-line unicorn/prefer-object-from-entries
      .reduce((currentExports, node) => {
        if (
          node.left.object.type === 'Identifier' &&
          node.left.object.name === 'module' &&
          node.left.property.type === 'Identifier' &&
          node.left.property.name === 'exports'
        ) {
          exportsVarOverridden = true;
          if (isFunctionRule(node.right)) {
            // Check `module.exports = function (context) { return { ... }; }`

            exportsIsFunction = true;
            return { create: node.right, meta: null, isNewStyle: false };
          } else if (node.right.type === 'ObjectExpression') {
            // Check `module.exports = { create: function () {}, meta: {} }`

            return collectInterestingProperties(
              node.right.properties,
              INTERESTING_RULE_KEYS
            );
          } else if (node.right.type === 'Identifier') {
            // Rule could be stored in a variable before being exported.
            const possibleRule = findVariableValue(node.right, scopeManager);
            if (possibleRule) {
              if (possibleRule.type === 'ObjectExpression') {
                // Check `const possibleRule = { ... }; module.exports = possibleRule;
                return collectInterestingProperties(
                  possibleRule.properties,
                  INTERESTING_RULE_KEYS
                );
              } else if (isFunctionRule(possibleRule)) {
                // Check `const possibleRule = function(context) { return { ... } }; module.exports = possibleRule;`
                return { create: possibleRule, meta: null, isNewStyle: false };
              }
            }
          }
          return {};
        } else if (
          !exportsIsFunction &&
          node.left.object.type === 'MemberExpression' &&
          node.left.object.object.type === 'Identifier' &&
          node.left.object.object.name === 'module' &&
          node.left.object.property.type === 'Identifier' &&
          node.left.object.property.name === 'exports' &&
          node.left.property.type === 'Identifier' &&
          INTERESTING_RULE_KEYS.has(node.left.property.name)
        ) {
          // Check `module.exports.create = () => {}`

          currentExports[node.left.property.name] = node.right;
        } else if (
          !exportsVarOverridden &&
          node.left.object.type === 'Identifier' &&
          node.left.object.name === 'exports' &&
          node.left.property.type === 'Identifier' &&
          INTERESTING_RULE_KEYS.has(node.left.property.name)
        ) {
          // Check `exports.create = () => {}`

          currentExports[node.left.property.name] = node.right;
        }
        return currentExports;
      }, {})
  );
}

/**
 * Find the value of a property in an object by its property key name.
 * @param {Object} obj
 * @param {String} keyName
 * @returns property value
 */
function findObjectPropertyValueByKeyName(obj, keyName) {
  const property = obj.properties.find(
    (prop) => prop.key.type === 'Identifier' && prop.key.name === keyName
  );
  return property ? property.value : undefined;
}

/**
 * Get the first value (or function) that a variable is initialized to.
 * @param {Node} node - the Identifier node for the variable.
 * @param {ScopeManager} scopeManager
 * @returns the first value (or function) that the given variable is initialized to.
 */
function findVariableValue(node, scopeManager) {
  const variable = findVariable(
    scopeManager.acquire(node) || scopeManager.globalScope,
    node
  );
  if (variable && variable.defs && variable.defs[0] && variable.defs[0].node) {
    if (
      variable.defs[0].node.type === 'VariableDeclarator' &&
      variable.defs[0].node.init
    ) {
      // Given node `x`, get `123` from `const x = 123;`.
      return variable.defs[0].node.init;
    } else if (variable.defs[0].node.type === 'FunctionDeclaration') {
      // Given node `foo`, get `function foo() {}` from `function foo() {}`.
      return variable.defs[0].node;
    }
  }
}

module.exports = {
  /**
  * Performs static analysis on an AST to try to determine the final value of `module.exports`.
  * @param {{ast: ASTNode, scopeManager?: ScopeManager}} sourceCode The object contains `Program` AST node, and optional `scopeManager`
  * @returns {Object} An object with keys `meta`, `create`, and `isNewStyle`. `meta` and `create` correspond to the AST nodes
  for the final values of `module.exports.meta` and `module.exports.create`. `isNewStyle` will be `true` if `module.exports`
  is an object, and `false` if module.exports is just the `create` function. If no valid ESLint rule info can be extracted
  from the file, the return value will be `null`.
  */
  getRuleInfo({ ast, scopeManager }) {
    const exportNodes =
      ast.sourceType === 'module'
        ? getRuleExportsESM(ast, scopeManager)
        : getRuleExportsCJS(ast, scopeManager);

    const createExists = Object.prototype.hasOwnProperty.call(
      exportNodes,
      'create'
    );
    if (!createExists) {
      return null;
    }

    // If create/meta are defined in variables, get their values.
    for (const key of Object.keys(exportNodes)) {
      if (exportNodes[key] && exportNodes[key].type === 'Identifier') {
        const value = findVariableValue(exportNodes[key], scopeManager);
        if (value) {
          exportNodes[key] = value;
        }
      }
    }

    const createIsFunction = isNormalFunctionExpression(exportNodes.create);
    if (!createIsFunction) {
      return null;
    }

    return Object.assign({ isNewStyle: true, meta: null }, exportNodes);
  },

  /**
   * Gets all the identifiers referring to the `context` variable in a rule source file. Note that this function will
   * only work correctly after traversing the AST has started (e.g. in the first `Program` node).
   * @param {RuleContext} scopeManager
   * @param {ASTNode} ast The `Program` node for the file
   * @returns {Set<ASTNode>} A Set of all `Identifier` nodes that are references to the `context` value for the file
   */
  getContextIdentifiers(scopeManager, ast) {
    const ruleInfo = module.exports.getRuleInfo({ ast, scopeManager });

    if (
      !ruleInfo ||
      ruleInfo.create.params.length === 0 ||
      ruleInfo.create.params[0].type !== 'Identifier'
    ) {
      return new Set();
    }

    return new Set(
      scopeManager
        .getDeclaredVariables(ruleInfo.create)
        .find((variable) => variable.name === ruleInfo.create.params[0].name)
        .references.map((ref) => ref.identifier)
    );
  },

  /**
   * Gets the key name of a Property, if it can be determined statically.
   * @param {ASTNode} node The `Property` node
   * @returns {string|null} The key name, or `null` if the name cannot be determined statically.
   */
  getKeyName(property) {
    if (!property.key) {
      // likely a SpreadElement or another non-standard node
      return null;
    }
    if (!property.computed && property.key.type === 'Identifier') {
      return property.key.name;
    }
    if (property.key.type === 'Literal') {
      return '' + property.key.value;
    }
    if (
      property.key.type === 'TemplateLiteral' &&
      property.key.quasis.length === 1
    ) {
      return property.key.quasis[0].value.cooked;
    }
    return null;
  },

  /**
   * Performs static analysis on an AST to try to find test cases
   * @param {RuleContext} context The `context` variable for the source file itself
   * @param {ASTNode} ast The `Program` node for the file.
   * @returns {object} An object with `valid` and `invalid` keys containing a list of AST nodes corresponding to tests
   */
  getTestInfo(context, ast) {
    const runCalls = [];
    const variableIdentifiers = new Set();

    ast.body.forEach((statement) => {
      if (statement.type === 'VariableDeclaration') {
        statement.declarations.forEach((declarator) => {
          if (
            declarator.init &&
            isRuleTesterConstruction(declarator.init) &&
            declarator.id.type === 'Identifier'
          ) {
            context.getDeclaredVariables(declarator).forEach((variable) => {
              variable.references
                .filter((ref) => ref.isRead())
                .forEach((ref) => variableIdentifiers.add(ref.identifier));
            });
          }
        });
      }

      if (
        statement.type === 'ExpressionStatement' &&
        statement.expression.type === 'CallExpression' &&
        statement.expression.callee.type === 'MemberExpression' &&
        (isRuleTesterConstruction(statement.expression.callee.object) ||
          variableIdentifiers.has(statement.expression.callee.object)) &&
        statement.expression.callee.property.type === 'Identifier' &&
        statement.expression.callee.property.name === 'run'
      ) {
        runCalls.push(statement.expression);
      }
    });

    return runCalls
      .filter(
        (call) =>
          call.arguments.length >= 3 &&
          call.arguments[2].type === 'ObjectExpression'
      )
      .map((call) => call.arguments[2])
      .map((run) => {
        const validProperty = run.properties.find(
          (prop) => module.exports.getKeyName(prop) === 'valid'
        );
        const invalidProperty = run.properties.find(
          (prop) => module.exports.getKeyName(prop) === 'invalid'
        );

        return {
          valid:
            validProperty && validProperty.value.type === 'ArrayExpression'
              ? validProperty.value.elements.filter(Boolean)
              : [],
          invalid:
            invalidProperty && invalidProperty.value.type === 'ArrayExpression'
              ? invalidProperty.value.elements.filter(Boolean)
              : [],
        };
      });
  },

  /**
   * Gets information on a report, given the arguments passed to context.report().
   * @param {ASTNode[]} reportArgs The arguments passed to context.report()
   * @param {Context} context
   */
  getReportInfo(reportArgs, context) {
    // If there is exactly one argument, the API expects an object.
    // Otherwise, if the second argument is a string, the arguments are interpreted as
    // ['node', 'message', 'data', 'fix'].
    // Otherwise, the arguments are interpreted as ['node', 'loc', 'message', 'data', 'fix'].

    if (reportArgs.length === 0) {
      return null;
    }

    if (reportArgs.length === 1) {
      if (reportArgs[0].type === 'ObjectExpression') {
        // eslint-disable-next-line unicorn/prefer-object-from-entries
        return reportArgs[0].properties.reduce((reportInfo, property) => {
          const propName = module.exports.getKeyName(property);

          if (propName !== null) {
            return Object.assign(reportInfo, { [propName]: property.value });
          }
          return reportInfo;
        }, {});
      }
      return null;
    }

    let keys;

    const secondArgStaticValue = getStaticValue(
      reportArgs[1],
      context.getScope()
    );
    if (
      (secondArgStaticValue &&
        typeof secondArgStaticValue.value === 'string') ||
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
        .map((key, index) => [key, reportArgs[index]])
    );
  },

  /**
   * Gets a set of all `sourceCode` identifiers.
   * @param {ScopeManager} scopeManager
   * @param {ASTNode} ast The AST of the file. This must have `parent` properties.
   * @returns {Set<ASTNode>} A set of all identifiers referring to the `SourceCode` object.
   */
  getSourceCodeIdentifiers(scopeManager, ast) {
    return new Set(
      [...module.exports.getContextIdentifiers(scopeManager, ast)]
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
            identifier.parent.parent.parent.id.type === 'Identifier'
        )
        .flatMap((identifier) =>
          scopeManager.getDeclaredVariables(identifier.parent.parent.parent)
        )
        .flatMap((variable) => variable.references)
        .map((ref) => ref.identifier)
    );
  },

  /**
   * Insert a given property into a given object literal.
   * @param {SourceCodeFixer} fixer The fixer.
   * @param {Node} node The ObjectExpression node to insert a property.
   * @param {string} propertyText The property code to insert.
   * @returns {void}
   */
  insertProperty(fixer, node, propertyText, sourceCode) {
    if (node.properties.length === 0) {
      return fixer.replaceText(node, `{\n${propertyText}\n}`);
    }
    return fixer.insertTextAfter(
      sourceCode.getLastToken(node.properties[node.properties.length - 1]),
      `,\n${propertyText}`
    );
  },

  /**
   * Collect all context.report({...}) violation/suggestion-related nodes into a standardized array for convenience.
   * @param {Object} reportInfo - Result of getReportInfo().
   * @returns {messageId?: String, message?: String, data?: Object, fix?: Function}[]
   */
  collectReportViolationAndSuggestionData(reportInfo) {
    return [
      // Violation message
      {
        messageId: reportInfo.messageId,
        message: reportInfo.message,
        data: reportInfo.data,
        fix: reportInfo.fix,
      },
      // Suggestion messages
      ...((reportInfo.suggest && reportInfo.suggest.elements) || [])
        .map((suggestObjNode) => {
          if (suggestObjNode.type !== 'ObjectExpression') {
            // Ignore non-objects (like variables or function calls).
            return null;
          }
          return {
            messageId: findObjectPropertyValueByKeyName(
              suggestObjNode,
              'messageId'
            ),
            message: findObjectPropertyValueByKeyName(suggestObjNode, 'desc'), // Note: suggestion message named `desc`
            data: findObjectPropertyValueByKeyName(suggestObjNode, 'data'),
            fix: findObjectPropertyValueByKeyName(suggestObjNode, 'fix'),
          };
        })
        .filter((item) => item !== null),
    ];
  },

  /**
   * Whether the provided node represents an autofixer function.
   * @param {Node} node
   * @param {Node[]} contextIdentifiers
   * @returns {boolean}
   */
  isAutoFixerFunction(node, contextIdentifiers) {
    const parent = node.parent;
    return (
      ['FunctionExpression', 'ArrowFunctionExpression'].includes(node.type) &&
      parent.parent.type === 'ObjectExpression' &&
      parent.parent.parent.type === 'CallExpression' &&
      contextIdentifiers.has(parent.parent.parent.callee.object) &&
      parent.parent.parent.callee.property.name === 'report' &&
      module.exports.getReportInfo(parent.parent.parent.arguments).fix === node
    );
  },

  /**
   * Whether the provided node represents a suggestion fixer function.
   * @param {Node} node
   * @param {Node[]} contextIdentifiers
   * @returns {boolean}
   */
  isSuggestionFixerFunction(node, contextIdentifiers) {
    const parent = node.parent;
    return (
      (node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression') &&
      parent.type === 'Property' &&
      parent.key.type === 'Identifier' &&
      parent.key.name === 'fix' &&
      parent.parent.type === 'ObjectExpression' &&
      parent.parent.parent.type === 'ArrayExpression' &&
      parent.parent.parent.parent.type === 'Property' &&
      parent.parent.parent.parent.key.type === 'Identifier' &&
      parent.parent.parent.parent.key.name === 'suggest' &&
      parent.parent.parent.parent.parent.type === 'ObjectExpression' &&
      parent.parent.parent.parent.parent.parent.type === 'CallExpression' &&
      contextIdentifiers.has(
        parent.parent.parent.parent.parent.parent.callee.object
      ) &&
      parent.parent.parent.parent.parent.parent.callee.property.name ===
        'report' &&
      module.exports.getReportInfo(
        parent.parent.parent.parent.parent.parent.arguments
      ).suggest === parent.parent.parent
    );
  },
};
