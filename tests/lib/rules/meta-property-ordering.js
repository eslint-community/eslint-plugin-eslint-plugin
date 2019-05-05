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

/**
 * @param {string[]} order
 * @returns {string}
 */
function getMessage (order) {
  return `The meta properties should be placed in a consistent order: [${order.join(', ')}].`;
}

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('test-case-property-ordering', rule, {
  valid: [
    `
    module.exports = {
      meta: {type, docs, fixable, schema, messages},
      create() {},
    };`,

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
      errors: [{ message: getMessage(['type', 'docs', 'fixable']) }],
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
        { message: getMessage(['type', 'docs', 'fixable', 'schema']) },
        { message: getMessage(['type', 'docs', 'fixable', 'schema']) },
      ],
    },

    {
      code: `
        module.exports = {
          meta: {fixable, fooooooooo, doc, type},
          create() {},
        };`,

      output: `
        module.exports = {
          meta: {type, doc, fixable, fooooooooo},
          create() {},
        };`,
      options: [['type', 'doc', 'fixable']],
      errors: [
        { message: getMessage(['type', 'doc', 'fixable']) },
        { message: getMessage(['type', 'doc', 'fixable']) },
      ],
    },
  ],
});
