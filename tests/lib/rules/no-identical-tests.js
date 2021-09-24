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

const ERROR_OBJECT_TEST = { messageId: 'identical', type: 'ObjectExpression' };
const ERROR_STRING_TEST = { messageId: 'identical', type: 'Literal' };

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
    // Object and string test.
    `
      new RuleTester().run('foo', bar, {
        valid: [
          { code: 'foo' },
          'foo',
        ],
        invalid: []
      });
    `,
    // One test object with more properties than the other.
    `
      new RuleTester().run('foo', bar, {
        valid: [
          { code: 'foo' },
          { code: 'foo', options: [{}] },
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
      errors: [ERROR_OBJECT_TEST],
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
      errors: [ERROR_OBJECT_TEST],
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
      errors: [ERROR_OBJECT_TEST, ERROR_OBJECT_TEST],
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
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            { code: 'foo', options: ['bar'] },
          ],
          invalid: []
        });
      `,
      errors: [ERROR_OBJECT_TEST],
    },
    {
      // Empty objects.
      code: `
        new RuleTester().run('foo', bar, {
          valid: [
            {},
            {},
          ],
          invalid: []
        });
      `,
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            {},
          ],
          invalid: []
        });
      `,
      errors: [ERROR_OBJECT_TEST],
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
      output: `
        new RuleTester().run('foo', bar, {
          valid: [
            'foo',
          ],
          invalid: []
        });
      `,
      errors: [ERROR_STRING_TEST],
    },
  ],
});
