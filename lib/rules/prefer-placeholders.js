/**
 * @fileoverview require using placeholders for dynamic report messages
 * @author Teddy Katz
 */

'use strict';

const utils = require('../utils');
const { findVariable } = require('eslint-utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require using placeholders for dynamic report messages',
      category: 'Rules',
      recommended: false,
    },
    fixable: null,
    schema: [],
    messages: {
      usePlaceholders: 'Use report message placeholders instead of string concatenation.',
    },
  },

  create (context) {
    let contextIdentifiers;

    const sourceCode = context.getSourceCode();
    const { scopeManager } = sourceCode;

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
          node.callee.property.type === 'Identifier' && node.callee.property.name === 'report'
        ) {
          const reportInfo = utils.getReportInfo(node.arguments, context);

          if (!reportInfo || !reportInfo.message) {
            return;
          }

          let messageNode = reportInfo.message;

          if (messageNode.type === 'Identifier') {
            // See if we can find the variable declaration.

            const variable = findVariable(
              scopeManager.acquire(messageNode) || scopeManager.globalScope,
              messageNode
            );

            if (
              !variable ||
              !variable.defs ||
              !variable.defs[0] ||
              !variable.defs[0].node ||
              variable.defs[0].node.type !== 'VariableDeclarator' ||
              !variable.defs[0].node.init
            ) {
              return;
            }

            messageNode = variable.defs[0].node.init;
          }

          if (
            (messageNode.type === 'TemplateLiteral' && messageNode.expressions.length > 0) ||
            (messageNode.type === 'BinaryExpression' && messageNode.operator === '+')
          ) {
            context.report({
              node: messageNode,
              messageId: 'usePlaceholders',
            });
          }
        }
      },
    };
  },
};
