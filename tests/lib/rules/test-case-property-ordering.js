/**
 * @fileoverview Requires the properties of a test case to be placed in the given order.
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/test-case-property-ordering');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('test-case-property-ordering', rule, {
  valid: [
    `
      new RuleTester().run('foo', bar, {
        valid: [
          {
            code: "foo",
            output: "bar",
            options: ["baz"],
          },
        ]
      });
    `,
    `
      new RuleTester().run('foo', bar, {
        valid: [
          {
            code: "foo",
            output: "bar",
            options: ["baz"],
            env: { es6: true },
          },
        ]
      });
    `,
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            {
              code: "foo",
              options: ["baz"],
              output: "bar",
            },
          ]
        });
      `,
      options: [['code', 'errors', 'options', 'output', 'parserOptions']],
    },
  ],

  invalid: [
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            {
              code: "foo",
              options: ["baz"],
              output: "bar",
            },
          ]
        });
      `,
      errors: [{ message: 'The properties of a test case should be placed in the given order: [code, output, options].' }],
    },
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            {
              code: "foo",
              env: { es6: true },
              output: "bar",
              options: ["baz"],
            },
          ]
        });
      `,
      errors: [{ message: 'The properties of a test case should be placed in the given order: [code, output, options].' }],
    },
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            {
              code: "foo",
              output: "bar",
              options: ["baz"],
            },
          ]
        });
      `,
      options: [['code', 'errors', 'options', 'output', 'parserOptions']],
      errors: [{ message: 'The properties of a test case should be placed in the given order: [code, options, output].' }],
    },
  ],
});
