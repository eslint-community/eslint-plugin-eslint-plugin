/**
 * @author Brad Zacher <https://github.com/bradzacher>
 */

'use strict';

const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'disallow rule exports where the export is a function.',
      category: 'Rules',
      recommended: false,
    },
    messages: {
      preferObject: 'Rules should be declared using the object style.',
    },
    type: 'suggestion',
    fixable: 'code',
    schema: [],
  },

  create (context) {
    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    const sourceCode = context.getSourceCode();
    const ruleInfo = utils.getRuleInfo(sourceCode.ast);

    return {
      Program () {
        if (!ruleInfo || ruleInfo.isNewStyle) {
          return;
        }

        context.report({
          node: ruleInfo.create,
          messageId: 'preferObject',
          *fix (fixer) {
            // note - we intentionally don't worry about formatting here, as otherwise we have
            //        to indent the function correctly

            if (ruleInfo.create.type === 'FunctionExpression') {
              const openParenToken = sourceCode.getFirstToken(
                ruleInfo.create,
                token => token.type === 'Punctuator' && token.value === '('
              );

              if (!openParenToken) {
                // this shouldn't happen, but guarding against crashes just in case
                return null;
              }

              yield fixer.replaceTextRange(
                [ruleInfo.create.range[0], openParenToken.range[0]],
                '{create'
              );
              yield fixer.insertTextAfter(ruleInfo.create, '}');
            } else if (ruleInfo.create.type === 'ArrowFunctionExpression') {
              yield fixer.insertTextBefore(ruleInfo.create, '{create: ');
              yield fixer.insertTextAfter(ruleInfo.create, '}');
            }
          },
        });
      },
    };
  },
};
