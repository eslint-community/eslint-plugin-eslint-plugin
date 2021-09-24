/**
 * @fileoverview require rules to implement a `meta.type` property
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
    `
      const type = 'problem';
      module.exports = {
        meta: { type },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { type: getType() },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { type: FOO },
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
    {
      code: `
        function create(context) {}
        module.exports = {
          meta: {},
          create,
        };
      `,
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
    {
      code: `
        const create = function(context) {};
        module.exports = {
          meta: {},
          create,
        };
      `,
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
    {
      code: `
        const create = (context) => {};
        module.exports = {
          meta: {},
          create,
        };
      `,
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
    {
      code: `
        module.exports = {
          meta: { type: 'invalid-type' },
          create(context) {}
        };
      `,
      errors: [{ messageId: 'unexpected', type: 'Literal' }],
    },
    {
      code: `
        const type = 'invalid-type';
        module.exports = {
          meta: { type },
          create(context) {}
        };
      `,
      errors: [{ messageId: 'unexpected', type: 'Identifier' }],
    },
    {
      code: `
        module.exports = {
          meta: { type: null },
          create(context) {}
        };
      `,
      errors: [{ messageId: 'unexpected', type: 'Literal' }],
    },
    {
      code: `
        module.exports = {
          meta: { type: undefined },
          create(context) {}
        };
      `,
      errors: [{ messageId: 'unexpected', type: 'Identifier' }],
    },
  ],
});
