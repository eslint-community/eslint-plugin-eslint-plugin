/**
 * @fileoverview Disallow missing placeholders in rule report messages
 * @author Teddy Katz
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-missing-placeholders');
const RuleTester = require('eslint').RuleTester;

/**
* Create an error for the given key
* @param {string} missingKey The placeholder that is missing
* @returns {object} An expected error
*/
function error (missingKey, type = 'Literal') {
  return { type, message: `The placeholder {{${missingKey}}} does not exist.` };
}

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('no-missing-placeholders', rule, {

  valid: [
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            message: 'foo bar'
          });
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            message: 'foo {{bar}}',
            data: { bar: 'baz' }
          });
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            message: 'foo {{bar}}',
            data: { 'bar': 'baz' }
          });
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            message: 'foo {{bar}}',
            data: { bar }
          });
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            message: 'foo{{bar}}' + baz
          });
        }
      };
    `,
    `
      module.exports = context => {
        context.report(node, 'foo {{bar}}', { bar: 'baz' }); return {};
      };
    `,
    `
      module.exports = context => {
        context.report(node, { line: 1, column: 3 }, 'foo {{bar}}', { bar: 'baz' }); return {};
      };
    `,
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            message: 'foo{{ bar }}',
            data: { bar: 'baz' }
          });
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            message: 'foo{{ bar }}',
            data: baz
          });
        }
      };
    `,
    // Message in variable.
    `
      const MESSAGE = 'foo {{bar}}';
      module.exports = context => {
        context.report(node, MESSAGE, { bar: 'baz' }); return {};
      };
    `,
    // Message in variable but cannot statically determine its type.
    `
      const MESSAGE = getMessage();
      module.exports = context => {
        context.report(node, MESSAGE, { baz: 'qux' }); return {};
      };
    `,
    // Suggestion with placeholder
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            suggest: [
              {
                desc: 'Remove {{functionName}}',
                data: {
                  functionName: 'foo'
                }
              }
            ]
          });
        }
      };
    `,
  ],

  invalid: [
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              node,
              message: 'foo {{bar}}'
            });
          }
        };
      `,
      errors: [error('bar')],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              node,
              message: 'foo {{bar}}',
              data: { baz: 'qux' }
            });
          }
        };
      `,
      errors: [error('bar')],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              node,
              message: 'foo {{hasOwnProperty}}',
              data: {}
            });
          }
        };
      `,
      errors: [error('hasOwnProperty')],
    },
    {
      code: `
        module.exports = context => {
          context.report(node, 'foo {{bar}}', { baz: 'qux' }); return {};
        };
      `,
      errors: [error('bar')],
    },
    {
      // Message in variable.
      code: `
        const MESSAGE = 'foo {{bar}}';
        module.exports = context => {
          context.report(node, MESSAGE, { baz: 'qux' }); return {};
        };
      `,
      errors: [error('bar', 'Identifier')],
    },
    {
      code: `
        module.exports = context => {
          context.report(node, { line: 1, column: 3 }, 'foo {{bar}}', { baz: 'baz' }); return {};
        };
      `,
      errors: [error('bar')],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              node,
              message: 'foo{{ bar }}',
              data: { ' bar ': 'baz' }
            });
          }
        };
      `,
      errors: [error('bar')],
    },

    {
      // Suggestion (no `data`)
      code: `
        module.exports = {
          create(context) {
            context.report({
              node,
              suggest: [
                {
                  desc: 'Remove {{bar}}'
                }
              ]
            });
          }
        };
      `,
      errors: [error('bar')],
    },
    {
      // Suggestion (`data` but missing placeholder)
      code: `
        module.exports = {
          create(context) {
            context.report({
              node,
              suggest: [
                {
                  desc: 'Remove {{bar}}',
                  data: {
                    notBar: 'abc'
                  }
                }
              ]
            });
          }
        };
      `,
      errors: [error('bar')],
    },
  ],
});
