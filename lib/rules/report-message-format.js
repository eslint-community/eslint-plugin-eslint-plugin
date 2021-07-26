/**
 * @fileoverview enforce a consistent format for rule report messages
 * @author Teddy Katz
 */

'use strict';

const { getStaticValue } = require('eslint-utils');
const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce a consistent format for rule report messages',
      category: 'Rules',
      recommended: false,
    },
    fixable: null,
    schema: [
      { type: 'string' },
    ],
    messages: {
      noMatch: "Report message does not match the pattern '{{pattern}}'.",
    },
  },

  create (context) {
    const pattern = new RegExp(context.options[0] || '');
    let contextIdentifiers;

    /**
     * Report a message node if it doesn't match the given formatting
     * @param {ASTNode} message The message AST node
     * @returns {void}
     */
    function processMessageNode (message) {
      const staticValue = getStaticValue(message, context.getScope());
      if (
        (message.type === 'Literal' && typeof message.value === 'string' && !pattern.test(message.value)) ||
        (message.type === 'TemplateLiteral' && message.quasis.length === 1 && !pattern.test(message.quasis[0].value.cooked)) ||
        (staticValue && !pattern.test(staticValue.value))
      ) {
        context.report({
          node: message,
          messageId: 'noMatch',
          data: { pattern: context.options[0] || '' },
        });
      }
    }

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      Program (node) {
        contextIdentifiers = utils.getContextIdentifiers(context, node);
        const ruleInfo = utils.getRuleInfo(context.getSourceCode());
        const messagesObject = ruleInfo &&
          ruleInfo.meta &&
          ruleInfo.meta.type === 'ObjectExpression' &&
          ruleInfo.meta.properties.find(prop => prop.type === 'Property' && utils.getKeyName(prop) === 'messages');

        if (!messagesObject || messagesObject.value.type !== 'ObjectExpression') {
          return;
        }

        messagesObject.value.properties
          .filter(prop => prop.type === 'Property')
          .map(prop => prop.value)
          .forEach(processMessageNode);
      },
      CallExpression (node) {
        if (
          node.callee.type === 'MemberExpression' &&
          contextIdentifiers.has(node.callee.object) &&
          node.callee.property.type === 'Identifier' && node.callee.property.name === 'report'
        ) {
          const reportInfo = utils.getReportInfo(node.arguments, context);
          const message = reportInfo && reportInfo.message;

          if (!message) {
            return;
          }

          processMessageNode(message);
        }
      },
    };
  },
};
