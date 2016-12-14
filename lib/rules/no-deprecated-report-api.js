/**
 * @fileoverview disallow use of the deprecated context.report() API
 * @author Teddy Katz
 */

'use strict';

const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'disallow use of the deprecated context.report() API',
      category: 'Rules',
      recommended: true,
    },
    fixable: 'code',  // or "code" or "whitespace"
    schema: [],
  },

  create (context) {
    const sourceCode = context.getSourceCode();
    let contextIdentifiers;

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      Program (node) {
        contextIdentifiers = utils.getContextIdentifiers(context, node);
      },
      CallExpression (node) {
        if (
          node.callee.type === 'MemberExpression' &&
          contextIdentifiers.has(node.callee.object) &&
          node.callee.property.type === 'Identifier' && node.callee.property.name === 'report' &&
          node.arguments.length > 1
        ) {
          context.report({
            node: node.callee.property,
            message: 'Use the new-style context.report() API.',
            fix (fixer) {
              const openingParen = sourceCode.getTokenBefore(node.arguments[0]);
              const closingParen = sourceCode.getLastToken(node);

              // If there is exactly one argument, the API expects an object.
              // Otherwise, if the second argument is a string, the arguments are interpreted as
              // ['node', 'message', 'data', 'fix'].
              // Otherwise, the arguments are interpreted as ['node', 'loc', 'message', 'data', 'fix'].

              let keys;
              if (
                (node.arguments[1].type === 'Literal' && typeof node.arguments[1].value === 'string') ||
                node.arguments[1].type === 'TemplateLiteral'
              ) {
                keys = ['node', 'message', 'data', 'fix'];
              } else if (
                node.arguments[1].type === 'ObjectExpression' ||
                node.arguments[1].type === 'ArrayExpression' ||
                (node.arguments[1].type === 'Literal' && typeof node.arguments[1].value !== 'string')
              ) {
                keys = ['node', 'loc', 'message', 'data', 'fix'];
              } else {
                // Otherwise, we can't statically determine what argument means what, so no safe fix is possible.
                return null;
              }

              return fixer.replaceTextRange(
                [openingParen.range[1], closingParen.range[0]],
                `{${node.arguments.slice(0, 5).map((arg, index) => `${keys[index]}: ${sourceCode.getText(arg)}`).join(', ')}}`
              );
            },
          });
        }
      },
    };
  },
};
