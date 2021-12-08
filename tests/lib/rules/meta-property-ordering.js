/**
 * @fileoverview Enforces the order of meta properties
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/meta-property-ordering');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('test-case-property-ordering', rule, {
  valid: [
    `
    module.exports = {
      meta: {type, docs, fixable, schema, messages},
      create() {},
    };`,

    {
      // ESM
      code: `
        export default {
          meta: {type, docs, fixable, schema, messages},
          create() {},
        };`,
      parserOptions: { sourceType: 'module' },
    },

    `
    module.exports = {
      meta: {docs, schema, messages},
      create() {},
    };`,

    `
    module.exports = {
      meta: {docs, messages, foo, bar},
      create() {},
    };`,

    `
    module.exports = {
      meta: {
        type: 'problem',
        docs: {},
        fixable: 'code',
        hasSuggestions: true,
        schema: [],
        messages: {}
      },
      create() {},
    };`,
    {
      code: `
        module.exports = {
          meta: {schema, docs, fixable},
          create() {},
        };`,
      options: [['schema', 'docs']],
    },
    `
    module.exports = {
      meta: {},
      create() {},
    };`,
    'module.exports = { create() {} };', // No `meta`.
  ],

  invalid: [
    {
      code: `
        module.exports = {
          meta: {
            docs,
            fixable,
            type: 'problem',
          },
          create() {},
        };`,

      output: `
        module.exports = {
          meta: {
            type: 'problem',
            docs,
            fixable,
          },
          create() {},
        };`,
      errors: [
        {
          messageId: 'inconsistentOrder',
          data: { order: ['type', 'docs', 'fixable'].join(', ') },
        },
      ],
    },
    {
      // ESM
      code: `
        export default {
          meta: {
            docs,
            fixable,
            type: 'problem',
          },
          create() {},
        };`,

      output: `
        export default {
          meta: {
            type: 'problem',
            docs,
            fixable,
          },
          create() {},
        };`,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'inconsistentOrder',
          data: { order: ['type', 'docs', 'fixable'].join(', ') },
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {schema, fixable, type, docs},
          create() {},
        };`,

      output: `
        module.exports = {
          meta: {type, docs, fixable, schema},
          create() {},
        };`,
      errors: [
        {
          messageId: 'inconsistentOrder',
          data: { order: ['type', 'docs', 'fixable', 'schema'].join(', ') },
        },
        {
          messageId: 'inconsistentOrder',
          data: { order: ['type', 'docs', 'fixable', 'schema'].join(', ') },
        },
      ],
    },

    {
      code: `
        module.exports = {
          meta: {fixable, fooooooooo, docs, type},
          create() {},
        };`,

      output: `
        module.exports = {
          meta: {type, docs, fixable, fooooooooo},
          create() {},
        };`,
      options: [['type', 'docs', 'fixable']],
      errors: [
        {
          messageId: 'inconsistentOrder',
          data: { order: ['type', 'docs', 'fixable'].join(', ') },
        },
        {
          messageId: 'inconsistentOrder',
          data: { order: ['type', 'docs', 'fixable'].join(', ') },
        },
      ],
    },
  ],
});
