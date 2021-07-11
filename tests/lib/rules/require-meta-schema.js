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
    `
      module.exports = {
        meta: { schema: { "enum": ["always", "never"] } },
        create(context) {}
      };
    `,
    // Schema with options and using `context.options`.
    `
      module.exports = {
        meta: { schema: { "enum": ["always", "never"] } },
        create(context) { const options = context.options; }
      };
    `,
    // Empty schema, using arbitrary property of `context`.
    `
      module.exports = {
        meta: { schema: [] },
        create(context) { const foo = context.foo; }
      };
    `,
    // Empty schema, using arbitrary `options` property.
    `
      module.exports = {
        meta: { schema: [] },
        create(context) { const options = foo.options; }
      };
    `,
    `
      const schema = [];
      module.exports = {
        meta: { schema },
        create(context) {}
      };
    `,
    `
      const foo = {};
      module.exports = {
        meta: { schema: foo },
        create(context) {}
      };
    `,
    `
      let schema;
      schema = foo ? [] : {};
      module.exports = {
        meta: { schema },
        create(context) {}
      };
    `,
    `
      const schema = [],
            created = (context) => {};
      module.exports = {
        meta: { schema },
        create
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
    {
      code: `
        module.exports = {
          meta: { schema: undefined },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'wrongType', type: 'Identifier' }],
    },
    {
      code: `
        const schema = null;
        module.exports = {
          meta: { schema },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'wrongType', type: 'Literal' }],
    },
    {
      // Empty schema (array), but using rule options.
      code: `
        module.exports = {
          meta: { schema: [] },
          create(context) { const options = context.options; }
        };
      `,
      output: null,
      errors: [{ messageId: 'foundOptionsUsage', type: 'Property' }],
    },
    {
      // Empty schema (object), but using rule options.
      code: `
        module.exports = {
          meta: { schema: {} },
          create(context) { const options = context.options; }
        };
      `,
      output: null,
      errors: [{ messageId: 'foundOptionsUsage', type: 'Property' }],
    },
  ],
});
