/**
 * @fileoverview Disallow unused placeholders in rule report messages
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/**
* Gets report info for a context.report() call
* TODO: Combine this with logic from no-deprecated-report-api
* @param {ASTNode[]} reportArgs The arguments to the context.report() call
* @returns {object}
*/
function getReportInfo (reportArgs) {
  if (reportArgs.length === 1) {
    if (reportArgs[0].type === 'ObjectExpression') {
      const messageProp = reportArgs[0].properties.find(prop => utils.getKeyName(prop) === 'message');
      const dataProp = reportArgs[0].properties.find(prop => utils.getKeyName(prop) === 'data');

      return {
        message: messageProp && messageProp.value,
        data: dataProp && dataProp.value,
      };
    }
  } else if (reportArgs.length) {
    if (reportArgs[1].type === 'Literal' && typeof reportArgs[1].value === 'string') {
      return {
        message: reportArgs[1],
        data: reportArgs[2],
      };
    } else if (
      reportArgs[1].type === 'ObjectExpression' ||
            reportArgs[1].type === 'ArrayExpression' ||
            (reportArgs[1].type === 'Literal' && typeof reportArgs[1].value !== 'string')
    ) {
      return {
        message: reportArgs[2],
        data: reportArgs[3],
      };
    }
  }
  return null;
}

module.exports = {
  meta: {
    docs: {
      description: 'Disallow unused placeholders in rule report messages',
      category: 'Rules',
      recommended: false,
    },
    fixable: null,
    schema: [],
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
          const reportInfo = getReportInfo(node.arguments);

          if (
            reportInfo &&
                reportInfo.message &&
                reportInfo.message.type === 'Literal' &&
                typeof reportInfo.message.value === 'string' &&
              reportInfo.data && reportInfo.data.type === 'ObjectExpression'
          ) {
            const message = reportInfo.message.value;
            reportInfo.data.properties.forEach(prop => {
              const key = utils.getKeyName(prop);
              const reg = new RegExp(`{{ *${key} *}}`);

              // if no {{key}} found, report an error.
              if (!reg.test(message)) {
                context.report({
                  node: reportInfo.message,
                  message: 'The placeholder {{{{unusedKey}}}} is unused.',
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
