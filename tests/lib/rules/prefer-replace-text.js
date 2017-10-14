/**
 * @fileoverview prefer using replaceText instead of replaceTextRange
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/prefer-replace-text');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
const ERROR = { message: 'prefer using replaceText instead of replaceTextRange.' };


ruleTester.run('prefer-placeholders', rule, {
  valid: [
    `
      module.exports = {
        create(context) {
          context.report({
            fix(fixer) {
              return fixer.replaceTextRange([start, end], '');
            }
          });
        }
      };
    `,
  ],

  invalid: [
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              fix(fixer) {
                return fixer.replaceTextRange(node.range, '');
              }
            });
          }
        };
    `,
      errors: [ERROR],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              fix(fixer) {
                return fixer.replaceTextRange([node.range[0], node.range[1]], '');
              }
            });
          }
        };
    `,
      errors: [ERROR],
    },
  ],
});
