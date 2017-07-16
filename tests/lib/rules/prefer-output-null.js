/**
 * @fileoverview disallows invalid RuleTester test cases with the output the same as the code.
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/prefer-output-null');
const RuleTester = require('eslint').RuleTester;

const ERROR = { message: 'Prefer `output: null` to assert that a test case is not autofixed.' };

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('prefer-output-null', rule, {
  valid: [
    `
      new RuleTester().run('foo', bar, {
        valid: [],
        invalid: [
          {code: 'foo', output: 'bar', errors: ['bar']},
        ]
      });
    `,
    `
      new RuleTester().run('foo', bar, {
        valid: [],
        invalid: [
          {code: 'foo', output: null, errors: ['bar']},
        ]
      });
    `,
  ],

  invalid: [
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [],
          invalid: [
            {code: 'foo', output: 'foo', errors: ['bar']},
          ]
        });
      `,
      errors: [ERROR],
    },
  ],
});
