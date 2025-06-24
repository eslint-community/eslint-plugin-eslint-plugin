import type { Rule } from 'eslint';
import type { Identifier, Node } from 'estree';

import {
  collectReportViolationAndSuggestionData,
  findPossibleVariableValues,
  getContextIdentifiers,
  getMessageIdNodeById,
  getMessagesNode,
  getReportInfo,
  getRuleInfo,
} from '../utils';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'disallow `messageId`s that are missing from `meta.messages`',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-missing-message-ids.md',
    },
    fixable: undefined,
    schema: [],
    messages: {
      missingMessage:
        '`meta.messages` is missing the messageId "{{messageId}}".',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const { scopeManager } = sourceCode;
    const ruleInfo = getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    const messagesNode = getMessagesNode(ruleInfo, scopeManager);

    let contextIdentifiers: Set<Node>;

    if (!messagesNode || messagesNode.type !== 'ObjectExpression') {
      // If we can't find `meta.messages`, disable the rule.
      return {};
    }

    return {
      Program(ast) {
        contextIdentifiers = getContextIdentifiers(scopeManager, ast);
      },

      CallExpression(node) {
        const scope = context.sourceCode.getScope(node);
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

            // Look for any possible string values we found for this messageId.
            values.forEach((val) => {
              if (
                val.type === 'Literal' &&
                typeof val.value === 'string' &&
                val.value !== '' &&
                !getMessageIdNodeById(val.value, ruleInfo, scopeManager, scope)
              )
                // Couldn't find this messageId in `meta.messages`.
                context.report({
                  node: val,
                  messageId: 'missingMessage',
                  data: {
                    messageId: val.value,
                  },
                });
            });
          }
        }
      },
    };
  },
};

export default rule;
