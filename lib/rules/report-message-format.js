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
          if (node.arguments.length === 1 && node.arguments[0].type !== 'ObjectExpression') {
            return;
          }

          const message = node.arguments.length === 1
            ? node.arguments[0].properties.find(prop =>
              (prop.key.type === 'Literal' && prop.key.value === 'message') ||
              (prop.key.type === 'Identifier' && prop.key.name === 'message')
            ).value
            : node.arguments[1];

          if (
            (message.type === 'Literal' && typeof message.value === 'string' && !pattern.test(message.value)) ||
            (message.type === 'TemplateLiteral' && message.quasis.length === 1 && !pattern.test(message.quasis[0].value.cooked))
          ) {
            context.report({
              node,
              message: "Report message does not match the pattern '{{pattern}}'.",
              data: { pattern: context.options[0] || '' },
            });
          }
        }
      },
    };
  },
};
