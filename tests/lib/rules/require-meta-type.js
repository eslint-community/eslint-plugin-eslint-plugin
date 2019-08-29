/**
 * @fileoverview require rules to implement a meta.type property
 * @author 唯然<weiran.zsd@outlook.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/require-meta-type');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('require-meta-type', rule, {
  valid: [
    `
      module.exports = {
        meta: { type: 'problem' },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { type: 'suggestion' },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { type: 'layout' },
        create(context) {}
      };
    `,
    `module.exports = {
      create(context) {}
    }`,
    {
      code: `
        const create = {};
        module.exports = {
          meta: {},
          create,
        };
      `,
      errors: [{ messageId: 'missing' }],
    },
  ],

  invalid: [
    {
      code: `
        module.exports = {
          meta: {},
          create(context) {}
        };
      `,
      errors: [{ messageId: 'missing' }],
    },
    {
      code: `
        function create(context) {}
        module.exports = {
          meta: {},
          create,
        };
      `,
      errors: [{ messageId: 'missing' }],
    },
    {
      code: `
        const create = function(context) {};
        module.exports = {
          meta: {},
          create,
        };
      `,
      errors: [{ messageId: 'missing' }],
    },
    {
      code: `
        const create = (context) => {};
        module.exports = {
          meta: {},
          create,
        };
      `,
      errors: [{ messageId: 'missing' }],
    },
    {
      code: `
        module.exports = {
          meta: { type: 'invalid-type' },
          create(context) {}
        };
      `,
      errors: [{ messageId: 'unexpected' }],
    },
  ],
});
