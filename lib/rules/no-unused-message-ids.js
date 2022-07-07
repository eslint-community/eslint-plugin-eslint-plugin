'use strict';

const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow unused `messageId`s in `meta.messages`',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-unused-message-ids.md',
    },
    fixable: null,
    schema: [],
    messages: {
      unusedMessage: 'The messageId "{{messageId}}" is never used.',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const { scopeManager } = sourceCode;
    const info = utils.getRuleInfo(sourceCode);

    const messageIdsUsed = new Set();
    let contextIdentifiers;
    let shouldPerformUnusedCheck = true;

    const messageIdNodes = utils.getMessageIdNodes(info, scopeManager);
    if (!messageIdNodes) {
      // If we can't find `meta.messages`, disable the rule.
      return {};
    }

    return {
      Program(ast) {
        contextIdentifiers = utils.getContextIdentifiers(scopeManager, ast);
      },

      'Program:exit'() {
        if (shouldPerformUnusedCheck) {
          const messageIdNodesUnused = messageIdNodes.filter(
            (node) =>
              !messageIdsUsed.has(utils.getKeyName(node, context.getScope()))
          );

          // Report any messageIds that were never used.
          for (const messageIdNode of messageIdNodesUnused) {
            context.report({
              node: messageIdNode,
              messageId: 'unusedMessage',
              data: {
                messageId: utils.getKeyName(messageIdNode, context.getScope()),
              },
            });
          }
        }
      },

      CallExpression(node) {
        // Check for messageId properties used in known calls to context.report();
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
          for (const { messageId } of reportMessagesAndDataArray.filter(
            (obj) => obj.messageId
          )) {
            const values =
              messageId.type === 'Literal'
                ? [messageId]
                : utils.findPossibleVariableValues(messageId, scopeManager);
            if (
              values.length === 0 ||
              values.some((val) => val.type !== 'Literal')
            ) {
              // When a dynamic messageId is used and we can't detect its value, disable the rule to avoid false positives.
              shouldPerformUnusedCheck = false;
            }
            values.forEach((val) => messageIdsUsed.add(val.value));
          }
        }
      },

      Property(node) {
        // In order to reduce false positives, we will also check for messageId properties anywhere in the file.
        // This is helpful especially in the event that helper functions are used for reporting violations.
        if (node.key.type === 'Identifier' && node.key.name === 'messageId') {
          const values =
            node.value.type === 'Literal'
              ? [node.value]
              : utils.findPossibleVariableValues(node.value, scopeManager);
          if (
            values.length === 0 ||
            values.some((val) => val.type !== 'Literal')
          ) {
            // When a dynamic messageId is used and we can't detect its value, disable the rule to avoid false positives.
            shouldPerformUnusedCheck = false;
          }
          values.forEach((val) => messageIdsUsed.add(val.value));
        }
      },
    };
  },
};
