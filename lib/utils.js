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
    const INTERESTING_KEYS = ['create', 'meta'];
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
              const keyValue = prop.key.type === 'Literal'
                ? prop.key.value
                : prop.key.type === 'Identifier'
                  ? prop.key.name
                  : null;

              if (INTERESTING_KEYS.indexOf(keyValue) !== -1) {
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
          node.left.property.type === 'Identifier' && INTERESTING_KEYS.indexOf(node.left.property.name) !== -1
        ) {
          // Check `module.exports.create = () => {}`

          currentExports[node.left.property.name] = node.right;
        } else if (
          !exportsVarOverridden &&
          node.left.object.type === 'Identifier' && node.left.object.name === 'exports' &&
          node.left.property.type === 'Identifier' && INTERESTING_KEYS.indexOf(node.left.property.name) !== -1
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
};
