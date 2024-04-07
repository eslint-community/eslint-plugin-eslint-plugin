/**
 * @fileoverview disallows invalid RuleTester test cases where the `output` matches the `code`
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/prefer-output-null');
const RuleTester = require('../eslint-rule-tester').RuleTester;

const ERROR = { messageId: 'useOutputNull', type: 'Property' };

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('prefer-output-null', rule, {
  valid: [
    `
      new RuleTester().run('foo', bar, {
        valid: [],
        invalid: [
          { ...otherOptions },
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
    // Dynamic cases.
    `
      new RuleTester().run('foo', bar, {
        valid: [
          FOO_CASE
        ],
        invalid: [
          FOO_CASE,
        ]
      });
    `,
    `
    new NotRuleTester().run('foo', bar, {
      valid: [],
      invalid: [{ code: 'foo', output: 'foo' },]
    });`, // Not RuleTester.
    `
    new RuleTester().notRun('foo', bar, {
      valid: [],
      invalid: [{ code: 'foo', output: 'foo' },]
    });`, // Not run() from RuleTester.
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
