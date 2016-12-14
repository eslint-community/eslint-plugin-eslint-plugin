'use strict';

/**
* Determines whether a node is a 'normal' (i.e. non-async, non-generator) function expression.
* @param {ASTNode} node The node in question
* @returns {boolean} `true` if the node is a normal function expression
*/
function isNormalFunctionExpression (node) {
  return (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') && !node.generator && !node.async;
}

module.exports = {

  /**
  * Performs static analysis on an AST to try to determine the final value of `module.exports`.
  * @param {ASTNode} ast The `Program` AST node
  * @returns {Object} An object with keys `meta`, `create`, and `isNewStyle`. `meta` and `create` correspond to the AST nodes
  for the final values of `module.exports.meta` and `module.exports.create`. `isNewStyle` will be `true` if `module.exports`
  is an object, and `false` if module.exports is just the `create` function. If no valid ESLint rule info can be extracted
  from the file, the return value will be `null`.
  */
  getRuleInfo (ast) {
    const INTERESTING_KEYS = new Set(['create', 'meta']);
    let exportsVarOverridden = false;
    let exportsIsFunction = false;

    const exportNodes = ast.body
      .filter(statement => statement.type === 'ExpressionStatement')
      .map(statement => statement.expression)
      .filter(expression => expression.type === 'AssignmentExpression')
      .filter(expression => expression.left.type === 'MemberExpression')
      .reduce((currentExports, node) => {
        if (
          node.left.object.type === 'Identifier' && node.left.object.name === 'module' &&
          node.left.property.type === 'Identifier' && node.left.property.name === 'exports'
        ) {
          exportsVarOverridden = true;

          if (isNormalFunctionExpression(node.right)) {
            // Check `module.exports = function () {}`

            exportsIsFunction = true;
            return { create: node.right, meta: null };
          } else if (node.right.type === 'ObjectExpression') {
            // Check `module.exports = { create: function () {}, meta: {} }`

            exportsIsFunction = false;
            return node.right.properties.reduce((parsedProps, prop) => {
              const keyValue = module.exports.getKeyName(prop);
              if (INTERESTING_KEYS.has(keyValue)) {
                parsedProps[keyValue] = prop.value;
              }
              return parsedProps;
            }, {});
          }
          return {};
        } else if (
          !exportsIsFunction &&
          node.left.object.type === 'MemberExpression' &&
          node.left.object.object.type === 'Identifier' && node.left.object.object.name === 'module' &&
          node.left.object.property.type === 'Identifier' && node.left.object.property.name === 'exports' &&
          node.left.property.type === 'Identifier' && INTERESTING_KEYS.has(node.left.property.name)
        ) {
          // Check `module.exports.create = () => {}`

          currentExports[node.left.property.name] = node.right;
        } else if (
          !exportsVarOverridden &&
          node.left.object.type === 'Identifier' && node.left.object.name === 'exports' &&
          node.left.property.type === 'Identifier' && INTERESTING_KEYS.has(node.left.property.name)
        ) {
          // Check `exports.create = () => {}`

          currentExports[node.left.property.name] = node.right;
        }
        return currentExports;
      }, {});

    return Object.prototype.hasOwnProperty.call(exportNodes, 'create') && isNormalFunctionExpression(exportNodes.create)
      ? Object.assign({ isNewStyle: !exportsIsFunction, meta: null }, exportNodes)
      : null;
  },

  /**
  * Gets all the identifiers referring to the `context` variable in a rule source file. Note that this function will
  * only work correctly after traversing the AST has started (e.g. in the first `Program` node).
  * @param {RuleContext} context The `context` variable for the source file itself
  * @param {ASTNode} ast The `Program` node for the file
  * @returns {Set<ASTNode>} A Set of all `Identifier` nodes that are references to the `context` value for the file
  */
  getContextIdentifiers (context, ast) {
    const ruleInfo = module.exports.getRuleInfo(ast);

    if (!ruleInfo || !ruleInfo.create.params.length || ruleInfo.create.params[0].type !== 'Identifier') {
      return new Set();
    }

    return new Set(
      context.getDeclaredVariables(ruleInfo.create)
        .find(variable => variable.name === ruleInfo.create.params[0].name)
        .references
        .map(ref => ref.identifier)
    );
  },

  /**
  * Gets the key name of a Property, if it can be determined statically.
  * @param {ASTNode} node The `Property` node
  * @returns {string|null} The key name, or `null` if the name cannot be determined statically.
  */
  getKeyName (property) {
    if (!property.computed && property.key.type === 'Identifier') {
      return property.key.name;
    }
    if (property.key.type === 'Literal') {
      return '' + property.key.value;
    }
    if (property.key.type === 'TemplateLiteral' && property.key.quasis.length === 1) {
      return property.key.quasis[0].value.cooked;
    }
    return null;
  },
};
