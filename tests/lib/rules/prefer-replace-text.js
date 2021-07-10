/**
 * @fileoverview prefer using `replaceText()` instead of `replaceTextRange()`
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
const ERROR = { message: 'Use replaceText instead of replaceTextRange.' };


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
    `
      module.exports = {
        create(context) {
          context.report({
            fix(fixer) {
              return fixer.replaceTextRange([node1[0], node2[1]], '');
            }
          });
        }
      };
    `,
    `
      module.exports = {
        create(context) {}
      };
    `,
    `
      fixer.replaceTextRange([node.range[0], node.range[1]], '');
    `,
  ],

  invalid: [
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
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              fix: function(fixer) {
                return fixer.replaceTextRange([node.range[0], node.range[1]], '');
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
              fix: function(fixer) {
                if (foo) {return fixer.replaceTextRange([node.range[0], node.range[1]], '')}
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
              fix: fixer => fixer.replaceTextRange([node.range[0], node.range[1]], '')
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
                return fixer.replaceTextRange([node.start, node.end], '');
              }
            });
          }
        };
    `,
      errors: [ERROR],
    },
  ],
});
