'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-only-tests');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('no-only-tests', rule, {
  valid: [
    // No test cases with `only`
    `
      const { RuleTester } = require('eslint');
      const ruleTester = new RuleTester();
      ruleTester.run('foo', bar, {
        valid: [
          'foo',
          { code: 'foo', foo: true },
          RuleTester.somethingElse(),
          notRuleTester.only()
        ],
        invalid: [
          { code: 'bar', foo: true },
        ]
      });
    `,
    // `only` set to `false`
    `
      const { RuleTester } = require('eslint');
      const ruleTester = new RuleTester();
      ruleTester.run('foo', bar, {
        valid: [
          { code: 'foo', only: false },
        ],
        invalid: [
          { code: 'bar', only: false },
        ]
      });
    `,
  ],

  invalid: [
    {
      // Valid test case with `only`
      code: `
        const { RuleTester } = require('eslint');
        const ruleTester = new RuleTester();
        ruleTester.run('foo', bar, {
          valid: [
            { code: 'foo', only: true },
          ],
          invalid: []
        });`,
      output: null,
      errors: [
        {
          messageId: 'foundOnly',
          type: 'Property',
          line: 6,
          endLine: 6,
          column: 28,
          endColumn: 38,
          suggestions: [
            {
              messageId: 'removeOnly',
              output: `
        const { RuleTester } = require('eslint');
        const ruleTester = new RuleTester();
        ruleTester.run('foo', bar, {
          valid: [
            { code: 'foo'  },
          ],
          invalid: []
        });`,
            },
          ],
        },
      ],
    },
    {
      // Invalid test case with `only` (property at end of object, no trailing comma)
      code: `
        const { RuleTester } = require('eslint');
        const ruleTester = new RuleTester();
        ruleTester.run('foo', bar, {
          valid: [],
          invalid: [
            { code: 'foo', only: true },
          ]
        });`,
      output: null,
      errors: [
        {
          messageId: 'foundOnly',
          type: 'Property',
          line: 7,
          endLine: 7,
          column: 28,
          endColumn: 38,
          suggestions: [
            {
              messageId: 'removeOnly',
              output: `
        const { RuleTester } = require('eslint');
        const ruleTester = new RuleTester();
        ruleTester.run('foo', bar, {
          valid: [],
          invalid: [
            { code: 'foo'  },
          ]
        });`,
            },
          ],
        },
      ],
    },
    {
      // Invalid test case with `only` (property at end of object, with trailing comma)
      code: `
        const { RuleTester } = require('eslint');
        const ruleTester = new RuleTester();
        ruleTester.run('foo', bar, {
          valid: [],
          invalid: [
            { code: 'foo', only: true, },
          ]
        });`,
      output: null,
      errors: [
        {
          messageId: 'foundOnly',
          type: 'Property',
          line: 7,
          endLine: 7,
          column: 28,
          endColumn: 38,
          suggestions: [
            {
              messageId: 'removeOnly',
              output: `
        const { RuleTester } = require('eslint');
        const ruleTester = new RuleTester();
        ruleTester.run('foo', bar, {
          valid: [],
          invalid: [
            { code: 'foo',  },
          ]
        });`,
            },
          ],
        },
      ],
    },
    {
      // Invalid test case with `only` (property in middle of object)
      code: `
        const { RuleTester } = require('eslint');
        const ruleTester = new RuleTester();
        ruleTester.run('foo', bar, {
          valid: [],
          invalid: [
            { code: 'foo', only: true, bar: true },
          ]
        });`,
      output: null,
      errors: [
        {
          messageId: 'foundOnly',
          type: 'Property',
          line: 7,
          endLine: 7,
          column: 28,
          endColumn: 38,
          suggestions: [
            {
              messageId: 'removeOnly',
              output: `
        const { RuleTester } = require('eslint');
        const ruleTester = new RuleTester();
        ruleTester.run('foo', bar, {
          valid: [],
          invalid: [
            { code: 'foo',  bar: true },
          ]
        });`,
            },
          ],
        },
      ],
    },
    {
      // Invalid test case with `only` (property at beginning of object)
      code: `
        const { RuleTester } = require('eslint');
        const ruleTester = new RuleTester();
        ruleTester.run('foo', bar, {
          valid: [],
          invalid: [
            { only: true, code: 'foo' },
          ]
        });`,
      output: null,
      errors: [
        {
          messageId: 'foundOnly',
          type: 'Property',
          line: 7,
          endLine: 7,
          column: 15,
          endColumn: 25,
          suggestions: [
            {
              messageId: 'removeOnly',
              output: `
        const { RuleTester } = require('eslint');
        const ruleTester = new RuleTester();
        ruleTester.run('foo', bar, {
          valid: [],
          invalid: [
            {  code: 'foo' },
          ]
        });`,
            },
          ],
        },
      ],
    },

    {
      // Valid test case using `RuleTester.only`
      code: `
        const { RuleTester } = require('eslint');
        const ruleTester = new RuleTester();
        new RuleTester().run('foo', bar, {
          valid: [
            RuleTester.only('foo'),
          ],
          invalid: []
        });
      `,
      output: null,
      errors: [{ messageId: 'foundOnly', type: 'MemberExpression', line: 6, endLine: 6, column: 13, endColumn: 28, suggestions: [] }],
    },
  ],
});
