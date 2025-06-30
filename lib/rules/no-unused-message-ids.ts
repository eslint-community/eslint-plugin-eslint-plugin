import type { Rule } from 'eslint';

import {
  collectReportViolationAndSuggestionData,
  findPossibleVariableValues,
  getContextIdentifiers,
  getKeyName,
  getMessageIdNodes,
  getReportInfo,
  getRuleInfo,
  isVariableFromParameter,
} from '../utils';
import type { Identifier, Node } from 'estree';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow unused `messageId`s in `meta.messages`',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-unused-message-ids.md',
    },
    fixable: undefined,
    schema: [],
    messages: {
      unusedMessage: 'The messageId "{{messageId}}" is never used.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const { scopeManager } = sourceCode;
    const ruleInfo = getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    const messageIdsUsed = new Set<string | null>();
    let contextIdentifiers: Set<Node>;
    let hasSeenUnknownMessageId = false;
    let hasSeenViolationReport = false;

    const messageIdNodes = getMessageIdNodes(ruleInfo, scopeManager);
    if (!messageIdNodes) {
      // If we can't find `meta.messages`, disable the rule.
      return {};
    }

    return {
      Program(ast) {
        contextIdentifiers = getContextIdentifiers(scopeManager, ast);
      },

      'Program:exit'(ast) {
        if (hasSeenUnknownMessageId || !hasSeenViolationReport) {
          /*
          Bail out when the rule is likely to have false positives.
          - If we saw a dynamic/unknown messageId
          - If we couldn't find any violation reporting code, likely because a helper function from an external file is handling this
          */
          return;
        }

        const scope = sourceCode.getScope(sourceCode.ast);

        const messageIdNodesUnused = messageIdNodes.filter(
          (node) => !messageIdsUsed.has(getKeyName(node, scope)),
        );

        // Report any messageIds that were never used.
        for (const messageIdNode of messageIdNodesUnused) {
          context.report({
            node: messageIdNode,
            messageId: 'unusedMessage',
            data: {
              messageId: getKeyName(messageIdNode, scope)!,
            },
          });
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
          const reportInfo = getReportInfo(node, context);
          if (!reportInfo) {
            return;
          }

          hasSeenViolationReport = true;

          const reportMessagesAndDataArray =
            collectReportViolationAndSuggestionData(reportInfo);
          for (const messageId of reportMessagesAndDataArray
            .map((obj) => obj.messageId)
            .filter((messageId) => !!messageId)) {
            const values =
              messageId.type === 'Literal'
                ? [messageId]
                : findPossibleVariableValues(
                    messageId as Identifier,
                    scopeManager,
                  );
            if (
              values.length === 0 ||
              values.some((val) => val.type !== 'Literal')
            ) {
              // When a dynamic messageId is used and we can't detect its value, disable the rule to avoid false positives.
              hasSeenUnknownMessageId = true;
            }
            values.forEach(
              (val) =>
                'value' in val && messageIdsUsed.add(val.value as string),
            );
          }
        }
      },

      Property(node) {
        // In order to reduce false positives, we will also check for messageId properties anywhere in the file.
        // This is helpful especially in the event that helper functions are used for reporting violations.
        if (node.key.type === 'Identifier' && node.key.name === 'messageId') {
          hasSeenViolationReport = true;

          const values =
            node.value.type === 'Literal'
              ? [node.value]
              : findPossibleVariableValues(
                  node.value as Identifier,
                  scopeManager,
                );

          if (
            values.length === 0 ||
            values.some((val) => val.type !== 'Literal') ||
            isVariableFromParameter(node.value as Identifier, scopeManager)
          ) {
            // When a dynamic messageId is used and we can't detect its value, disable the rule to avoid false positives.
            hasSeenUnknownMessageId = true;
          }

          values.forEach(
            (val) => 'value' in val && messageIdsUsed.add(val.value as string),
          );
        }
      },
    };
  },
};

export default rule;
