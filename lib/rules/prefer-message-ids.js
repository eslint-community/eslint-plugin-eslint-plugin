'use strict';

const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require using `messageId` instead of `message` to report rule violations',
      category: 'Rules',
      recommended: false,
    },
    fixable: null,
    schema: [],
    messages: {
      foundMessage: 'Use `messageId` instead of `message`.',
    },
  },

  create (context) {
    let contextIdentifiers;

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      Program (ast) {
        contextIdentifiers = utils.getContextIdentifiers(context, ast);
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

          context.report({
            node: reportInfo.message.parent,
            messageId: 'foundMessage',
          });
        }
      },
    };
  },
};
