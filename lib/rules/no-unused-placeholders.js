/**
 * @fileoverview Disallow unused placeholders in rule report messages
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

import { getStaticValue } from '@eslint-community/eslint-utils';

import {
  collectReportViolationAndSuggestionData,
  getContextIdentifiers,
  getKeyName,
  getMessageIdNodeById,
  getMessagesNode,
  getReportInfo,
  getRuleInfo,
} from '../utils.js';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow unused placeholders in rule report messages',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-unused-placeholders.md',
    },
    fixable: null,
    schema: [],
    messages: {
      placeholderUnused:
        'The placeholder {{{{unusedKey}}}} is unused (does not exist in the actual message).',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const { scopeManager } = sourceCode;

    let contextIdentifiers;

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

          for (const { message, data } of reportMessagesAndDataArray.filter(
            (obj) => obj.message,
          )) {
            const messageStaticValue = getStaticValue(message, scope);
            if (
              ((message.type === 'Literal' &&
                typeof message.value === 'string') ||
                (messageStaticValue &&
                  typeof messageStaticValue.value === 'string')) &&
              data &&
              data.type === 'ObjectExpression'
            ) {
              const messageValue = message.value || messageStaticValue.value;
              // https://github.com/eslint/eslint/blob/2874d75ed8decf363006db25aac2d5f8991bd969/lib/linter.js#L986
              const PLACEHOLDER_MATCHER = /{{\s*([^{}]+?)\s*}}/g;
              const placeholdersInMessage = new Set();

              messageValue.replaceAll(
                PLACEHOLDER_MATCHER,
                (fullMatch, term) => {
                  placeholdersInMessage.add(term);
                },
              );

              data.properties.forEach((prop) => {
                const key = getKeyName(prop);
                if (!placeholdersInMessage.has(key)) {
                  context.report({
                    node: prop,
                    messageId: 'placeholderUnused',
                    data: { unusedKey: key },
                  });
                }
              });
            }
          }
        }
      },
    };
  },
};

export default rule;
