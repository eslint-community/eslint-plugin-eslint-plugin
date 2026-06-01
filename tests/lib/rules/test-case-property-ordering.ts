/**
 * @fileoverview Requires the properties of a test case to be placed in a consistent order.
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/test-case-property-ordering.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
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
      name: 'custom order (options: code, errors, options, output, parserOptions)',
    },
    `
    new NotRuleTester().run('foo', bar, {
      valid: [{ code: "foo", options: ["baz"], output: "bar", }],
      invalid: []
    });`, // Not RuleTester.
    `
    new RuleTester().notRun('foo', bar, {
      valid: [{ code: "foo", options: ["baz"], output: "bar", }],
      invalid: []
    });`, // Not run() from RuleTester.
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
      errors: [
        {
          message:
            'The properties of a test case should be placed in a consistent order: [code, output, options].',
          column: 46,
          endColumn: 59,
          endLine: 4,
          line: 4,
        },
      ],
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
      errors: [
        {
          message:
            'The properties of a test case should be placed in a consistent order: [code, output, options, env].',
          column: 35,
          endColumn: 46,
          endLine: 4,
          line: 4,
        },
      ],
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
      errors: [
        {
          message:
            'The properties of a test case should be placed in a consistent order: [code, output, options, env].',
          column: 48,
          endColumn: 61,
          endLine: 4,
          line: 4,
        },
      ],
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
      errors: [
        {
          message:
            'The properties of a test case should be placed in a consistent order: [code, options, output].',
          column: 43,
          endColumn: 59,
          endLine: 4,
          line: 4,
        },
      ],
      name: 'custom order (options: code, errors, options, output, parserOptions)',
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
      errors: [
        {
          message:
            'The properties of a test case should be placed in a consistent order: [code, output, parserOptions, errors].',
          column: 1,
          endColumn: 18,
          endLine: 8,
          line: 8,
        },
      ],
    },
    {
      code: `
        var tester = new RuleTester();

        describe('my tests', function() {
          tester.run('foo', bar, {
            valid: [
              {\ncode: "foo",\noutput: "",\nerrors: ["baz"],\nparserOptions: "",\n},
            ]
          });
        });
      `,
      output: `
        var tester = new RuleTester();

        describe('my tests', function() {
          tester.run('foo', bar, {
            valid: [
              {\ncode: "foo",\noutput: "",\nparserOptions: "",\nerrors: ["baz"],\n},
            ]
          });
        });
      `,
      errors: [
        {
          message:
            'The properties of a test case should be placed in a consistent order: [code, output, parserOptions, errors].',
          column: 1,
          endColumn: 18,
          endLine: 11,
          line: 11,
        },
      ],
    },
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            {\ncode: "foo",\noutput: "",\nerrors: ["baz"],\nlanguageOptions: "",\n},
          ]
        });
      `,
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            {\ncode: "foo",\noutput: "",\nlanguageOptions: "",\nerrors: ["baz"],\n},
          ]
        });
      `,
      errors: [
        {
          message:
            'The properties of a test case should be placed in a consistent order: [code, output, languageOptions, errors].',
          column: 1,
          endColumn: 20,
          endLine: 8,
          line: 8,
        },
      ],
    },
  ],
});
