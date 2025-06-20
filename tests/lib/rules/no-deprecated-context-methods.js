/**
 * @fileoverview Disallows usage of deprecated methods on rule context objects
 * @author Teddy Katz
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/no-deprecated-context-methods.js';
import { RuleTester } from '../../utils/eslint-rule-tester.js';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
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
      return {};
    }
    `,
    `module.exports = {};`, // Not a rule.
  ],

  invalid: [
    {
      code: `
        module.exports = {
          create(context) {
            return {
              Program(ast) {
                context.getSource(ast);
              }
            }
          }
        }
      `,
      output: `
        module.exports = {
          create(context) {
            return {
              Program(ast) {
                context.getSourceCode().getText(ast);
              }
            }
          }
        }
      `,
      errors: [
        {
          message:
            'Use `context.getSourceCode().getText` instead of `context.getSource`.',
          type: 'MemberExpression',
        },
      ],
    },
    {
      code: `
        module.exports = myRuleContext => {
          myRuleContext.getFirstToken; return {};
        }
      `,
      output: `
        module.exports = myRuleContext => {
          myRuleContext.getSourceCode().getFirstToken; return {};
        }
      `,
      errors: [
        {
          message:
            'Use `myRuleContext.getSourceCode().getFirstToken` instead of `myRuleContext.getFirstToken`.',
          type: 'MemberExpression',
        },
      ],
    },
    {
      // `create` in variable.
      code: `
        const create = function(context) { return { Program(ast) { context.getSource(ast); } } };
        module.exports = { create };
      `,
      output: `
        const create = function(context) { return { Program(ast) { context.getSourceCode().getText(ast); } } };
        module.exports = { create };
      `,
      errors: [
        {
          message:
            'Use `context.getSourceCode().getText` instead of `context.getSource`.',
          type: 'MemberExpression',
        },
      ],
    },
  ],
});
