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
          'foo',
          RuleTester.only('foo'),
        ]
      });
    `,
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
    `
      new RuleTester().run('foo', bar, {
        valid: [
          { filename: '', code: '', output: '', options: '', parser: '', parserOptions: '', globals: '', env: '', errors: '' },
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
            {\ncode: "foo",\noutput: "",\nerrors: ["baz"],\nparserOptions: "",\n},
          ]
        });
      `,
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            {\ncode: "foo",\noutput: "",\nparserOptions: "",\nerrors: ["baz"],\n},
          ]
        });
      `,
      errors: [{ message: 'The properties of a test case should be placed in a consistent order: [code, output, parserOptions, errors].' }],
    },
  ],
});
