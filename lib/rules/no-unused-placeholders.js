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

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow unused placeholders in rule report messages',
      category: 'Rules',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      placeholderUnused: 'The placeholder {{{{unusedKey}}}} is unused.',
    },
  },

  create (context) {
    let contextIdentifiers;

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      Program (ast) {
        contextIdentifiers = utils.getContextIdentifiers(context, ast);
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

          const messageStaticValue = getStaticValue(reportInfo.message, context.getScope());
          if (
            (
              (reportInfo.message.type === 'Literal' && typeof reportInfo.message.value === 'string') ||
              (messageStaticValue && typeof messageStaticValue.value === 'string')
            ) &&
            reportInfo.data &&
            reportInfo.data.type === 'ObjectExpression'
          ) {
            const message = reportInfo.message.value || messageStaticValue.value;
            // https://github.com/eslint/eslint/blob/2874d75ed8decf363006db25aac2d5f8991bd969/lib/linter.js#L986
            const PLACEHOLDER_MATCHER = /{{\s*([^{}]+?)\s*}}/g;
            const placeholdersInMessage = new Set();

            message.replace(PLACEHOLDER_MATCHER, (fullMatch, term) => {
              placeholdersInMessage.add(term);
            });

            reportInfo.data.properties.forEach(prop => {
              const key = utils.getKeyName(prop);
              if (!placeholdersInMessage.has(key)) {
                context.report({
                  node: reportInfo.message,
                  messageId: 'placeholderUnused',
                  data: { unusedKey: key },
                });
              }
            });
          }
        }
      },
    };
  },
};
