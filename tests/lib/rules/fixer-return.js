/**
 * @fileoverview enforces fixer function always return a value
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/fixer-return');
const RuleTester = require('eslint').RuleTester;

const ERROR = { message: 'Expected fixer function to always return a value.' };

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('fixer-return', rule, {
  valid: [
    `
    module.exports = {
        create: function(context) {
            context.report( {
                fix: function(fixer) {
                    return fixer.foo();
                }
            });
        }
    };
    `,
    `
    module.exports = {
        create: function(context) {
            context.report({
                fix: fixer => fixer.foo()
            });
        }
    };
    `,
  ],

  invalid: [
    {
      code: `
      module.exports = {
          create: function(context) {
              context.report({
                  fix(fixer) {
                      fixer.foo();
                  }
              });
          }
      };
      `,
      errors: [ERROR],
    },
  ],
});
