'use strict';

const utils = require('../utils');
const { getStaticValue } = require('eslint-utils');

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
      messagesMissing: '`meta.messages` must contain at least one violation message.',
      foundMessage: 'Use `messageId` instead of `message`.',
    },
  },

  create (context) {
    const sourceCode = context.getSourceCode();
    const info = utils.getRuleInfo(sourceCode);

    let contextIdentifiers;

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      Program (ast) {
        contextIdentifiers = utils.getContextIdentifiers(context, ast);

        if (info === null || info.meta === null) {
          return;
        }

        const metaNode = info.meta;
        const messagesNode =
          metaNode &&
          metaNode.properties &&
          metaNode.properties.find(p => p.type === 'Property' && utils.getKeyName(p) === 'messages');

        if (!messagesNode) {
          context.report({ node: metaNode, messageId: 'messagesMissing' });
          return;
        }

        const staticValue = getStaticValue(messagesNode.value, context.getScope());
        if (!staticValue) {
          return;
        }

        if (typeof staticValue.value === 'object' && staticValue.value.constructor === Object && Object.keys(staticValue.value).length === 0) {
          context.report({ node: messagesNode.value, messageId: 'messagesMissing' });
        }
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
