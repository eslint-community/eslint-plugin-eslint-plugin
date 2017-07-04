/**
 * @fileoverview disallow identical tests
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
const ERROR = { message: 'The properties of a test case should be placed in the given order: [code, output, options, parserOptions, errors].' };
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
      errors: [ERROR],
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
      errors: [ERROR],
    },
  ],
});
