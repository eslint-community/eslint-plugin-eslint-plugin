'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/require-test-output');
const RuleTester = require('eslint').RuleTester;

const ERROR = { messageId: 'missingOutput', type: 'ObjectExpression' };

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('require-test-output', rule, {
  valid: [
    {
      // Explicit option of `consistent` (no output in any tests).
      code: `
        new RuleTester().run('foo', bar, {
          valid: [],
          invalid: [
            { code: 'foo', errors: ['bar'] },
            { code: 'baz', errors: ['qux'] }
          ]
        });
      `,
      options: [{ consistent: true }],
    },
    {
      // Explicit option of `consistent` (output in all tests).
      code: `
        new RuleTester().run('foo', bar, {
          valid: [],
          invalid: [
            { code: 'foo', output: 'baz', errors: ['bar'] },
            { code: 'foo', output: 'qux', errors: ['bar'] },
          ]
        });
      `,
      options: [{ consistent: true }],
    },
    {
      // Explicitly turning off the `consistent` option (results in "always" behavior).
      code: `
        new RuleTester().run('foo', bar, {
          valid: [],
          invalid: [
            { code: 'foo', output: 'baz', errors: ['bar'] },
            { code: 'foo', output: 'qux', errors: ['bar'] },
            { code: 'foo', output: null, errors: ['bar'] },
          ]
        });
      `,
      options: [{ consistent: false }],
    },
    // When defaulting to the "always" behavior.
    `
      new RuleTester().run('foo', bar, {
        valid: [],
        invalid: [
          { code: 'foo', output: 'baz', errors: ['bar'] },
        ]
      });
    `,
  ],

  invalid: [
    {
      // Explicit option of `consistent`.
      code: `
        new RuleTester().run('foo', bar, {
          valid: [],
          invalid: [
            { code: 'foo', output: 'baz', errors: ['bar'] },
            { code: 'foo', errors: ['bar'] },
            { code: 'foo bar', errors: ['bar'] },
          ]
        });
      `,
      output: null,
      options: [{ consistent: true }],
      errors: [ERROR, ERROR],
    },
    {
      // Explicitly turning off the `consistent` option (results in "always" behavior).
      code: `
        new RuleTester().run('foo', bar, {
          valid: [],
          invalid: [
            { code: 'foo', errors: ['bar'] },
          ]
        });
      `,
      output: null,
      options: [{ consistent: false }],
      errors: [ERROR],
    },
    {
      // When defaulting to the "always" behavior.
      code: `
        new RuleTester().run('foo', bar, {
          valid: [],
          invalid: [
            { code: 'foo', errors: ['bar'] },
          ]
        });
      `,
      output: null,
      errors: [ERROR],
    },
  ],
});
