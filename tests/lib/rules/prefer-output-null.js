/**
 * @fileoverview disallows invalid RuleTester test cases where the `output` matches the `code`
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/prefer-output-null');
const RuleTester = require('eslint').RuleTester;

const ERROR = { message: 'Use `output: null` to assert that a test case is not autofixed.' };

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
    `
      new RuleTester().run('foo', bar, {
        valid: [
          'foo'
        ],
        invalid: []
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
      output: `
        new RuleTester().run('foo', bar, {
          valid: [],
          invalid: [
            {code: 'foo', output: null, errors: ['bar']},
          ]
        });
      `,
      errors: [ERROR],
    },
  ],
});
