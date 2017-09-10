/**
 * @fileoverview Disallows usage of deprecated methods on rule context objects
 * @author Teddy Katz
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-deprecated-context-methods');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('no-deprecated-context-methods', rule, {

  valid: [
    `
      module.exports = {
        create(context) {
          context.getSourceCode();
        }
      }
    `,
    `
    module.exports = context => {
      const sourceCode = context.getSourceCode();

      sourceCode.getFirstToken();
    }
  `,
  ],

  invalid: [
    {
      code: `
        module.exports = {
          create(context) {
            return {
              Program(node) {
                context.getSource(node);
              }
            }
          }
        }
      `,
      output: `
        module.exports = {
          create(context) {
            return {
              Program(node) {
                context.getSourceCode().getText(node);
              }
            }
          }
        }
      `,
      errors: [
        {
          message: 'Use `context.getSourceCode().getText` instead of `context.getSource`.',
          type: 'MemberExpression',
        },
      ],
    },
    {
      code: `
        module.exports = myRuleContext => {
          myRuleContext.getFirstToken;
        }
      `,
      output: `
        module.exports = myRuleContext => {
          myRuleContext.getSourceCode().getFirstToken;
        }
      `,
      errors: [
        {
          message: 'Use `myRuleContext.getSourceCode().getFirstToken` instead of `myRuleContext.getFirstToken`.',
          type: 'MemberExpression',
        },
      ],
    },
  ],
});
