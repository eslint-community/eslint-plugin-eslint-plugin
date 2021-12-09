/**
 * @fileoverview Disallow missing placeholders in rule report messages
 * @author Teddy Katz
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
      description: 'disallow missing placeholders in rule report messages',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-missing-placeholders.md',
    },
    fixable: null,
    schema: [],
    messages: {
      placeholderDoesNotExist:
        'The placeholder {{{{missingKey}}}} does not exist.',
    },
  },

  create(context) {
    let contextIdentifiers;

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      Program(ast) {
        const sourceCode = context.getSourceCode();
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

          const reportMessagesAndDataArray = utils
            .collectReportViolationAndSuggestionData(reportInfo)
            .filter((obj) => obj.message);
          for (const { message, data } of reportMessagesAndDataArray) {
            const messageStaticValue = getStaticValue(
              message,
              context.getScope()
            );
            if (
              ((message.type === 'Literal' &&
                typeof message.value === 'string') ||
                (messageStaticValue &&
                  typeof messageStaticValue.value === 'string')) &&
              (!data || data.type === 'ObjectExpression')
            ) {
              // Same regex as the one ESLint uses
              // https://github.com/eslint/eslint/blob/e5446449d93668ccbdb79d78cc69f165ce4fde07/lib/eslint.js#L990
              const PLACEHOLDER_MATCHER = /{{\s*([^{}]+?)\s*}}/g;
              let match;

              while (
                (match = PLACEHOLDER_MATCHER.exec(
                  message.value || messageStaticValue.value
                ))
              ) {
                const matchingProperty =
                  data &&
                  data.properties.find(
                    (prop) => utils.getKeyName(prop) === match[1]
                  );

                if (!matchingProperty) {
                  context.report({
                    node: message,
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
