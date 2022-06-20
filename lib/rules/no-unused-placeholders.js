/**
 * @fileoverview Disallow unused placeholders in rule report messages
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

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
      description: 'disallow unused placeholders in rule report messages',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-unused-placeholders.md',
    },
    fixable: null,
    schema: [],
    messages: {
      placeholderUnused: 'The placeholder {{{{unusedKey}}}} is unused.',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();
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

          const info = utils.getRuleInfo(sourceCode);
          const metaNode = info.meta;
          const messagesNode =
            metaNode &&
            metaNode.properties &&
            metaNode.properties.find(
              (p) => p.type === 'Property' && utils.getKeyName(p) === 'messages'
            );

          const reportMessagesAndDataArray =
            utils.collectReportViolationAndSuggestionData(reportInfo);

          // Check for any potential instances where we can use the messageId to fill in the message for convenience.
          reportMessagesAndDataArray.forEach((obj) => {
            if (
              !obj.message &&
              obj.messageId &&
              obj.messageId.type === 'Literal'
            ) {
              const correspondingMessage =
                messagesNode &&
                messagesNode.value.properties &&
                messagesNode.value.properties.find(
                  (p) =>
                    p.type === 'Property' &&
                    utils.getKeyName(p) === obj.messageId.value
                );
              if (correspondingMessage) {
                obj.message = correspondingMessage.value;
              }
            }
          });

          for (const { message, data } of reportMessagesAndDataArray.filter(
            (obj) => obj.message
          )) {
            const messageStaticValue = getStaticValue(
              message,
              context.getScope()
            );
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

              messageValue.replace(PLACEHOLDER_MATCHER, (fullMatch, term) => {
                placeholdersInMessage.add(term);
              });

              data.properties.forEach((prop) => {
                const key = utils.getKeyName(prop);
                if (!placeholdersInMessage.has(key)) {
                  context.report({
                    node: message,
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
