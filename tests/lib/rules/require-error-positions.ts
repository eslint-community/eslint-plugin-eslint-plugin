// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/require-error-positions.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('require-error-positions', rule, {
  valid: [
    `
      new RuleTester().run('foo', bar, {
        valid: [],
        invalid: [
          {code: 'foo', output: 'bar', errors: [{line: 1, column: 2, endColumn: 3, endLine: 4}]},
        ]
      });
    `,
    `
      new RuleTester().run('foo', bar, {
        valid: [],
        invalid: [
          {code: 'foo', output: 'bar', errors: []},
        ]
      });
    `,
    `
      new RuleTester().run('foo', bar, {
        valid: [],
        invalid: [
          {code: 'foo', output: 'bar'},
        ]
      });
    `,
  ],
  invalid: [
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [],
          invalid: [
            {code: 'foo', output: 'bar', errors: [{messageId: 'bizz'}]},
          ]
        });
      `,
      errors: [
        {
          messageId: 'locationsMissing',
          line: 5,
          column: 51,
          endColumn: 70,
          endLine: 5,
        },
      ],
    },
  ],
});
