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

const ERROR = { message: 'This test case is identical to another case.' };

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
          { code: 'bar' },
        ],
        invalid: []
      });
    `,
    `
      new RuleTester().run('foo', bar, {
        valid: [
          { code: 'foo' }
        ],
        invalid: []
      });
    `,
    `
      new RuleTester().run('foo', bar, {
        valid: [
          'foo',
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
            { code: 'foo' },
          ],
          invalid: []
        });
      `,
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: 'foo' },
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
            { code: 'foo' }
          ],
          invalid: []
        });
      `,
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: 'foo' },
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
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: 'foo' },
          ],
          invalid: [
            { code: 'foo', errors: ['bar'] },
          ]
        });
      `,
      errors: [ERROR, ERROR],
    },
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: 'foo', options: ['bar'] },
            { options: ['bar'], code: 'foo' },
          ],
          invalid: []
        });
      `,
      errors: [ERROR],
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: 'foo', options: ['bar'] },
          ],
          invalid: []
        });
      `,
    },
    {
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            'foo',
            'foo',
          ],
          invalid: []
        });
      `,
      errors: [ERROR],
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            'foo',
          ],
          invalid: []
        });
      `,
    },
  ],
});
