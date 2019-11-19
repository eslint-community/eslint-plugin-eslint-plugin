'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/require-meta-schema');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('require-meta-schema', rule, {
  valid: [
    `
      module.exports = {
        meta: { schema: [] },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { schema: [ { "enum": ["always", "never"] } ] },
        create(context) {}
      };
    `,
  ],

  invalid: [
    {
      code: `
        module.exports = {
          meta: {},
          create(context) {}
        };
      `,
      output: `
        module.exports = {
          meta: {
schema: []
},
          create(context) {}
        };
      `,
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
    {
      code: `
        module.exports = {
          meta: { type: 'problem' },
          create(context) {}
        };
      `,
      output: `
        module.exports = {
          meta: { type: 'problem',
schema: [] },
          create(context) {}
        };
      `,
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
    {
      code: `
        module.exports = {
          meta: { schema: null },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'wrongType', type: 'Literal' }],
    },
  ],
});
