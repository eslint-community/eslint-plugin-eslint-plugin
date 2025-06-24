/**
 * @fileoverview Disallow missing placeholders in rule report messages
 * @author Teddy Katz
 */
import { getStaticValue } from '@eslint-community/eslint-utils';
import type { Rule } from 'eslint';

import {
  collectReportViolationAndSuggestionData,
  getContextIdentifiers,
  getKeyName,
  getMessageIdNodeById,
  getMessagesNode,
  getReportInfo,
  getRuleInfo,
} from '../utils';
import type { Node } from 'estree';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow missing placeholders in rule report messages',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-missing-placeholders.md',
    },
    fixable: undefined,
    schema: [],
    messages: {
      placeholderDoesNotExist:
        "The placeholder {{{{missingKey}}}} is missing (must provide it in the report's `data` object).",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const { scopeManager } = sourceCode;

    let contextIdentifiers: Set<Node>;

    const ruleInfo = getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    const messagesNode = getMessagesNode(ruleInfo, scopeManager);

    return {
      Program(ast) {
        contextIdentifiers = getContextIdentifiers(scopeManager, ast);
      },
      CallExpression(node) {
        const scope = sourceCode.getScope(node);
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

          if (messagesNode) {
            // Check for any potential instances where we can use the messageId to fill in the message for convenience.
            reportMessagesAndDataArray.forEach((obj) => {
              if (
                !obj.message &&
                obj.messageId &&
                obj.messageId.type === 'Literal' &&
                typeof obj.messageId.value === 'string'
              ) {
                const correspondingMessage = getMessageIdNodeById(
                  obj.messageId.value,
                  ruleInfo,
                  scopeManager,
                  scope,
                );
                if (correspondingMessage) {
                  obj.message = correspondingMessage.value;
                }
              }
            });
          }

          for (const {
            message,
            messageId,
            data,
          } of reportMessagesAndDataArray.filter((obj) => obj.message)) {
            const messageStaticValue = getStaticValue(message!, scope);
            if (
              ((message?.type === 'Literal' &&
                typeof message.value === 'string') ||
                (messageStaticValue &&
                  typeof messageStaticValue.value === 'string')) &&
              (!data || data.type === 'ObjectExpression')
            ) {
              // Same regex as the one ESLint uses
              // https://github.com/eslint/eslint/blob/e5446449d93668ccbdb79d78cc69f165ce4fde07/lib/eslint.js#L990
              const PLACEHOLDER_MATCHER = /{{\s*([^{}]+?)\s*}}/g;
              let match: RegExpExecArray | null;

              const messageText: string =
                // @ts-expect-error
                message.value || messageStaticValue.value;
              while ((match = PLACEHOLDER_MATCHER.exec(messageText))) {
                const matchingProperty =
                  data &&
                  data.properties.find(
                    (prop) => getKeyName(prop) === match![1],
                  );

                if (!matchingProperty) {
                  context.report({
                    node: (data || messageId || message) as Node,
                    messageId: 'placeholderDoesNotExist',
                    data: { missingKey: match[1] },
                  });
                }
              }
            }
          }
        }
      },
    };
  },
};

export default rule;
