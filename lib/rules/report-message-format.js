/**
 * @fileoverview enforce a consistent format for rule report messages
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
      description: 'enforce a consistent format for rule report messages',
      category: 'Rules',
      recommended: false,
    },
    fixable: null,
    schema: [
      { type: 'string' },
    ],
  },

  create (context) {
    const pattern = new RegExp(context.options[0] || '');
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
          node.callee.property.type === 'Identifier' && node.callee.property.name === 'report'
        ) {
          const reportInfo = utils.getReportInfo(node.arguments);
          const message = reportInfo && reportInfo.message;

          if (!message) {
            return;
          }

          if (
            (message.type === 'Literal' && typeof message.value === 'string' && !pattern.test(message.value)) ||
            (message.type === 'TemplateLiteral' && message.quasis.length === 1 && !pattern.test(message.quasis[0].value.cooked))
          ) {
            context.report({
              node: message,
              message: "Report message does not match the pattern '{{pattern}}'.",
              data: { pattern: context.options[0] || '' },
            });
          }
        }
      },
    };
  },
};
