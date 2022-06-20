'use strict';

const utils = require('../utils');
const { getStaticValue } = require('eslint-utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'require using `messageId` instead of `message` to report rule violations',
      category: 'Rules',
      recommended: false,
      url: 'https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/prefer-message-ids.md',
    },
    fixable: null,
    schema: [],
    messages: {
      foundMessage: 'Use `messageId` instead of `message`.',
      messagesMissing:
        '`meta.messages` must contain at least one violation message.',
      missingMessage: '`meta.messages` is missing this messageId.',
      unusedMessage: 'This messageId was never used.',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const info = utils.getRuleInfo(sourceCode);

    const messageIdsUsed = new Set();
    let contextIdentifiers;

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      Program(ast) {
        contextIdentifiers = utils.getContextIdentifiers(
          sourceCode.scopeManager,
          ast
        );

        if (info === null) {
          return;
        }

        const metaNode = info.meta;
        const messagesNode =
          metaNode &&
          metaNode.properties &&
          metaNode.properties.find(
            (p) => p.type === 'Property' && utils.getKeyName(p) === 'messages'
          );

        if (!messagesNode) {
          context.report({
            node: metaNode || info.create,
            messageId: 'messagesMissing',
          });
          return;
        }

        const staticValue = getStaticValue(
          messagesNode.value,
          context.getScope()
        );
        if (!staticValue) {
          return;
        }

        if (
          typeof staticValue.value === 'object' &&
          staticValue.value.constructor === Object &&
          Object.keys(staticValue.value).length === 0
        ) {
          context.report({
            node: messagesNode.value,
            messageId: 'messagesMissing',
          });
        }
      },

      'Program:exit'() {
        for (const messageIdNode of utils
          .getMessageIdNodes(info)
          .filter((node) => !messageIdsUsed.has(node.key.name))) {
          context.report({
            node: messageIdNode,
            messageId: 'unusedMessage',
          });
        }
      },

      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          contextIdentifiers.has(node.callee.object) &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'report'
        ) {
          const reportInfo = utils.getReportInfo(node.arguments, context);
          if (!reportInfo) {
            return;
          }

          const reportMessagesAndDataArray =
            utils.collectReportViolationAndSuggestionData(reportInfo);

          for (const { message } of reportMessagesAndDataArray.filter(
            (obj) => obj.message
          )) {
            context.report({
              node: message.parent,
              messageId: 'foundMessage',
            });
          }

          for (const { messageId } of reportMessagesAndDataArray.filter(
            (obj) => obj.messageId && obj.messageId.type === 'Literal'
          )) {
            messageIdsUsed.add(messageId.value);
            if (!utils.getMessageById(info, messageId.value))
              context.report({
                node: messageId,
                messageId: 'missingMessage',
              });
          }
        }
      },
    };
  },
};
