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
function error(missingKey, type, extra) {
  return {
    type,
    message: `The placeholder {{${missingKey}}} is missing (must provide it in the report's \`data\` object).`,
    ...extra,
  };
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
    // messageId but no placeholder.
    `
      module.exports = {
        meta: {
          messages: { myMessageId: 'foo' }
        },
        create(context) {
          context.report({ node, messageId: 'myMessageId' });
        }
      };
    `,
    // messageId but the message doesn't exist in `meta.messages`.
    `
      module.exports = {
        meta: {
          messages: { }
        },
        create(context) {
          context.report({ node, messageId: 'myMessageId' });
        }
      };
    `,
    // messageId but no `meta.messages`.
    `
      module.exports = {
        meta: { },
        create(context) {
          context.report({ node, messageId: 'myMessageId' });
        }
      };
    `,
    // messageId but no `meta`.
    `
      module.exports = {
        create(context) {
          context.report({ node, messageId: 'myMessageId' });
        }
      };
    `,
    // messageId with correctly-used placeholder.
    `
      module.exports = {
        meta: {
          messages: { myMessageId: 'foo {{bar}}' }
        },
        create(context) {
          context.report({
            node,
            messageId: 'myMessageId',
            data: { bar: 'baz' }
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
    // Suggestion with messageId
    `
      module.exports = {
        meta: { messages: { myMessageId: 'Remove {{functionName}}' } },
        create(context) {
          context.report({
            node,
            suggest: [
              {
                messageId: 'myMessageId',
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
      errors: [
        error(
          'bar',
          'Literal',
          // report on `message`
          {
            line: 6,
            endLine: 6,
            column: 24,
            endColumn: 37,
          }
        ),
      ],
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
      errors: [error('bar', 'ObjectExpression')],
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
      errors: [error('hasOwnProperty', 'ObjectExpression')],
    },
    {
      code: `
        module.exports = context => {
          context.report(node, 'foo {{bar}}', { baz: 'qux' }); return {};
        };
      `,
      errors: [error('bar', 'ObjectExpression')],
    },
    {
      // Message in variable.
      code: `
        const MESSAGE = 'foo {{bar}}';
        module.exports = context => {
          context.report(node, MESSAGE, { baz: 'qux' }); return {};
        };
      `,
      errors: [error('bar', 'ObjectExpression')],
    },
    {
      code: `
        module.exports = context => {
          context.report(node, { line: 1, column: 3 }, 'foo {{bar}}', { baz: 'baz' }); return {};
        };
      `,
      errors: [error('bar', 'ObjectExpression')],
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
      errors: [
        error(
          'bar',
          'ObjectExpression',
          // report on data
          {
            line: 7,
            endLine: 7,
            column: 21,
            endColumn: 39,
          }
        ),
      ],
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
      errors: [error('bar', 'ObjectExpression')],
    },
    {
      // Suggestion and messageId
      code: `
        module.exports = {
          meta: { messages: { myMessageId: 'foo {{bar}}' } },
          create(context) {
            context.report({
              node,
              suggest: [
                {
                  messageId: 'myMessageId',
                }
              ]
            });
          }
        };
      `,
      errors: [error('bar', 'Literal')],
    },
    {
      // `create` in variable.
      code: `
        function create(context) {
          context.report({
            node,
            message: 'foo {{hasOwnProperty}}',
            data: {}
          });
        }
        module.exports = { create };
      `,
      errors: [error('hasOwnProperty', 'ObjectExpression')],
    },
    {
      // messageId.
      code: `
        module.exports = {
          meta: { messages: { myMessageId: 'foo {{bar}}' } },
          create(context) {
            context.report({
              node,
              messageId: 'myMessageId'
            });
          }
        };
      `,
      errors: [
        error(
          'bar',
          'Literal',
          // report on the messageId
          {
            line: 7,
            endLine: 7,
            column: 26,
            endColumn: 39,
          }
        ),
      ],
    },
  ],
});
