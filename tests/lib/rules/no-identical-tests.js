/**
 * @fileoverview disallow identical tests
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-identical-tests');
const RuleTester = require('eslint').RuleTester;

const ERROR = { message: 'This test case should not be identical to someone else.' };

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('no-identical-tests', rule, {
  valid: [
    `
      new RuleTester().run('foo', bar, {
        valid: [
          { code: 'foo' },
          { code: 'bar' }
        ],
        invalid: []
      });
    `,
  ],

  invalid: [
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: 'foo' },
            { code: 'foo' }
          ],
          invalid: []
        });
      `,
      errors: [ERROR],
    },
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: 'foo' },
            { code: 'foo' },
          ],
          invalid: [
            { code: 'foo', errors: ['bar'] },
            { code: 'foo', errors: ['bar'] },
          ]
        });
      `,
      errors: [ERROR, ERROR],
    },
  ],
});
