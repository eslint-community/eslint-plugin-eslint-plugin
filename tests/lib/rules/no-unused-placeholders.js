/**
 * @fileoverview Disallow unused placeholders in rule report messages
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-unused-placeholders');
const RuleTester = require('eslint').RuleTester;

/**
* Create an error for the given key
* @param {string} unusedKey The placeholder that is unused
* @returns {object} An expected error
*/
function error (unusedKey, type = 'Literal') {
  return { type, message: `The placeholder {{${unusedKey}}} is unused.` };
}

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('no-unused-placeholders', rule, {

  valid: [
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
      module.exports = context => {
        context.report(node, 'foo {{bar}}', { bar: 'baz' });
      };
    `,
    // With message as variable.
    `
      const MESSAGE = 'foo {{bar}}';
      module.exports = context => {
        context.report(node, MESSAGE, { bar: 'baz' });
      };
    `,
    // With message as variable but cannot statically determine its type.
    `
      const MESSAGE = getMessage();
      module.exports = context => {
        context.report(node, MESSAGE, { bar: 'baz' });
      };
    `,
    `
      module.exports = context => {
        context.report(node, { line: 1, column: 3 }, 'foo {{bar}}', { bar: 'baz' });
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
              message: 'foo',
              data: { bar }
            });
          }
        };
      `,
      errors: [error('bar')],
    },
    {
      // With message as variable.
      code: `
        const MESSAGE = 'foo';
        module.exports = {
          create(context) {
            context.report({
              node,
              message: MESSAGE,
              data: { bar }
            });
          }
        };
      `,
      errors: [error('bar', 'Identifier')],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              node,
              message: 'foo',
              data: { bar: '' }
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
              data: { baz: '' }
            });
          }
        };
      `,
      errors: [error('baz')],
    },
  ],
});
