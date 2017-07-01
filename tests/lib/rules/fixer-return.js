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

const ERROR = { message: 'fixer function is expected to return a value.' };

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('fixer-return', rule, {
  valid: [
    `
    module.exports = {
        create: function(context) {
            context.report( {
                node,
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
                node,
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
                  node,
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
