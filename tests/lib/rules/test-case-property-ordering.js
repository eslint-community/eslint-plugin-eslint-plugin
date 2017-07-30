/**
 * @fileoverview Requires the properties of a test case to be placed in a consistent order.
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
          { code: "foo", output: "bar", options: ["baz"], },
        ]
      });
    `,
    `
      new RuleTester().run('foo', bar, {
        valid: [
          { code: "foo",output: "bar",options: ["baz"],env: { es6: true }, },
        ]
      });
    `,
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: "foo", options: ["baz"], output: "bar", },
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
            { code: "foo", options: ["baz"], output: "bar", },
          ]
        });
      `,
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: "foo", output: "bar", options: ["baz"], },
          ]
        });
      `,
      errors: [{ message: 'The properties of a test case should be placed in a consistent order: [code, output, options].' }],
    },
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            { env: { es6: true }, code: "foo", output: "bar", options: ["baz"], },
          ]
        });
      `,
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: "foo", output: "bar", options: ["baz"], env: { es6: true }, },
          ]
        });
      `,
      errors: [{ message: 'The properties of a test case should be placed in a consistent order: [code, output, options, env].' }],
    },
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: "foo", env: { es6: true }, output: "bar", options: ["baz"], },
          ]
        });
      `,
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: "foo", output: "bar", options: ["baz"], env: { es6: true }, },
          ]
        });
      `,
      errors: [{ message: 'The properties of a test case should be placed in a consistent order: [code, output, options, env].' }],
    },
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: "foo", output: "bar", options: ["baz"], },
          ]
        });
      `,
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: "foo", options: ["baz"], output: "bar", },
          ]
        });
      `,
      options: [['code', 'errors', 'options', 'output', 'parserOptions']],
      errors: [{ message: 'The properties of a test case should be placed in a consistent order: [code, options, output].' }],
    },
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            { options: ["baz"], parserOptions: "", code: "foo", errors: ["foo"], output: "", },
          ]
        });
      `,
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: "foo", errors: ["foo"], output: "", options: ["baz"], parserOptions: "", },
          ]
        });
      `,
      options: [['code', 'errors', 'output']],
      errors: [{ message: 'The properties of a test case should be placed in a consistent order: [code, errors, output, options, parserOptions].' }],
    },
  ],
});
