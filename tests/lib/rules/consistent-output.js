/**
 * @fileoverview Enforce consistent use of `output` assertions in rule tests
 * @author Teddy Katz
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/consistent-output');
const RuleTester = require('eslint').RuleTester;

const ERROR = { message: 'This test case should have an output assertion.', type: 'ObjectExpression' };

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('consistent-output', rule, {
  valid: [
    `
      new RuleTester().run('foo', bar, {
        valid: [],
        invalid: [
          {
            code: 'foo',
            errors: ['bar']
          },
          {
            code: 'baz',
            errors: ['qux']
          }
        ]
      });
    `,
    `
      new RuleTester().run('foo', bar, {
        valid: [],
        invalid: [
          {
            code: 'foo',
            output: 'baz',
            errors: ['bar'],
          },
          {
            code: 'foo',
            output: 'qux',
            errors: ['bar']
          }
        ]
      });
    `,
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [],
          invalid: [
            {
              code: 'foo',
              output: 'baz',
              errors: ['bar']
            },
          ]
        });
      `,
      options: ['always'],
    },
  ],

  invalid: [
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [],
          invalid: [
            {
              code: 'foo',
              output: 'baz',
              errors: ['bar'],
            },
            {
              code: 'foo',
              errors: ['bar']
            },
            {
              code: 'foo bar',
              errors: ['bar']
            }
          ]
        });
      `,
      errors: [ERROR, ERROR],
    },
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [],
          invalid: [
            {
              code: 'foo',
              errors: ['bar'],
            },
          ]
        });
      `,
      options: ['always'],
      errors: [ERROR],
    },
  ],
});
