/**
 * @fileoverview Disallow unused placeholders in rule report messages
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/no-unused-placeholders.ts';
import { RuleTester } from 'eslint';

/**
 * Create an error for the given key
 * @param unusedKey The placeholder that is unused
 * @returns An expected error
 */
function error(
  unusedKey: string,
  extra?: Partial<RuleTester.TestCaseError>,
): RuleTester.TestCaseError {
  return {
    type: 'Property', // The property in the report's `data` object for the unused placeholder.
    message: `The placeholder {{${unusedKey}}} is unused (does not exist in the actual message).`,
    ...extra,
  };
}

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
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
        context.report(node, 'foo {{bar}}', { bar: 'baz' }); return {};
      };
    `,
    // With message as variable.
    `
      const MESSAGE = 'foo {{bar}}';
      module.exports = context => {
        context.report(node, MESSAGE, { bar: 'baz' }); return {};
      };
    `,
    // With message as variable but cannot statically determine its type.
    `
      const MESSAGE = getMessage();
      module.exports = context => {
        context.report(node, MESSAGE, { bar: 'baz' }); return {};
      };
    `,
    `
      module.exports = context => {
        context.report(node, { line: 1, column: 3 }, 'foo {{bar}}', { bar: 'baz' }); return {};
      };
    `,
    // Suggestion
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            suggest: [
              {
                desc: 'foo {{bar}}',
                data: { 'bar': 'baz' }
              }
            ]
          });
        }
      };
    `,
    // Suggestion with messageId
    `
      module.exports = {
        meta: { messages: { myMessageId: 'foo {{bar}}' } },
        create(context) {
          context.report({
            node,
            suggest: [
              {
                messageId: 'myMessageId',
                data: { 'bar': 'baz' }
              }
            ]
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
    // messageId but the message property doesn't exist yet.
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
        meta: {},
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
    'module.exports = {};', // No rule.
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
      errors: [
        error(
          'bar',
          // report on property in data object
          {
            line: 7,
            endLine: 7,
            column: 23,
            endColumn: 26,
          },
        ),
      ],
    },
    {
      // With `create` as variable.
      code: `
        function create(context) {
          context.report({
            node,
            message: 'foo',
            data: { bar }
          });
        }
        module.exports = { create };
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
      errors: [error('bar')],
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
    {
      // messageId.
      code: `
        module.exports = {
          meta: { messages: { myMessageId: 'foo' } },
          create(context) {
            context.report({
              node,
              messageId: 'myMessageId',
              data: { bar }
            });
          }
        };
      `,
      errors: [error('bar')],
    },
    {
      // Suggestion
      code: `
        module.exports = {
          create(context) {
            context.report({
              node,
              suggest: [
                {
                  desc: 'foo',
                  data: { bar }
                }
              ]
            });
          }
        };
      `,
      errors: [error('bar')],
    },
    {
      // Suggestion and messageId
      code: `
        module.exports = {
          meta: { messages: { myMessageId: 'foo' } },
          create(context) {
            context.report({
              node,
              suggest: [
                {
                  messageId: 'myMessageId',
                  data: { bar }
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
