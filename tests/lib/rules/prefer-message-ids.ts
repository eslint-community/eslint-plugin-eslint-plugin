// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/prefer-message-ids.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('prefer-message-ids', rule, {
  valid: [
    `
      module.exports = {
        meta: { messages: { foo: 'hello world' } },
        create(context) {
          context.report({ node });
        }
      };
    `,
    `
      module.exports = {
        meta: { messages: { foo: 'hello world' } },
        create(context) {
          context.report({ node, messageId: 'foo' });
        }
      };
    `,
    // Suggestion
    `
      module.exports = {
        meta: { messages: { foo: 'hello world' } },
        create(context) {
          context.report({ node, suggest: [{messageId:'foo'}] });
        }
      };
    `,
    {
      // ESM
      code: `
        export default {
          meta: { messages: { foo: 'hello world' } },
          create(context) {
            context.report({ node, messageId: 'foo' });
          }
        };
      `,
      languageOptions: { sourceType: 'module' },
    },
    `
      module.exports = {
        meta: { messages: { foo: 'hello world' } },
        create(context) {
          foo.report({ node, message: 'foo' }); // unrelated function
        }
      };
    `,
    `
      module.exports = {
        meta: { messages: { foo: 'hello world' } },
        create(context) {
          context.foo({ node, message: 'foo' }); // unrelated function
        }
      };
    `,
    `
      context.report({ node, message: 'foo' }); // outside rule
      module.exports = {
        meta: { messages: { foo: 'hello world' } },
        create(context) {
        }
      };
    `,
    `
      // Tests are still allowed to use 'message' which is helpful for verifying that dynamically-constructed messages (i.e. from placeholders) look correct.
      new RuleTester().run('foo', bar, {
        invalid: [
          { code: 'foo', errors: [{message: 'foo'}] },
        ]
      });
    `,

    // `meta.messages` has a message
    `
      module.exports = {
        meta: { messages: { someMessageId: 'some message' } },
        create(context) {
          context.report({ node, messageId: 'someMessageId' });
        }
      };
    `,
    // `meta.messages` has a message (in variable)
    `
      const messages = { someMessageId: 'some message' };
      module.exports = {
        meta: { messages },
        create(context) {
          context.report({ node, messageId: 'someMessageId' });
        }
      };
    `,
    // `meta.messages` has no static value.
    `
      module.exports = {
        meta: { messages },
        create(context) {
          context.report({ node, messageId: FOO });
        }
      };
    `,
    // `meta.messages` may come from a spread that cannot be resolved statically.
    `
      const baseRule = require('./base-rule');
      module.exports = {
        meta: { ...baseRule.meta },
        create(context) {
          context.report({ node, messageId: 'foo' });
        }
      };
    `,
    // `meta.messages` may be inherited through a variable that itself spreads an unresolvable value.
    `
      const baseRule = require('./base-rule');
      const inheritedMeta = { ...baseRule.meta };
      module.exports = {
        meta: { ...inheritedMeta },
        create(context) {
          context.report({ node, messageId: 'foo' });
        }
      };
    `,
    // `context.report` with no args.
    `
      module.exports = {
        meta: { messages },
        create(context) {
          context.report();
        }
      };
    `,
    // Rules that never report do not need `meta.messages`.
    `
      module.exports = {
        meta: { description: 'foo' },
        create(context) { }
      };
    `,
    `
      module.exports = {
        meta: {
          description: 'foo',
          messages: {},
        },
        create(context) { }
      };
    `,
    `
      const messages = {};
      module.exports = {
        meta: {
          description: 'foo',
          messages,
        },
        create(context) { }
      };
    `,
    // Issue #292: rules that only mark variables as used.
    `
      module.exports = {
        create(context) {
          return {
            JSXIdentifier(node) {
              context.markVariableAsUsed(node.name);
            },
          };
        },
      };
    `,
    'module.exports = {};', // No rule.
  ],

  invalid: [
    {
      code: `
        module.exports = {
          meta: { messages: { foo: 'hello world' } },
          create(context) {
            context.report({ node, message: 'foo' });
          }
        };
      `,
      errors: [
        {
          messageId: 'foundMessage',
          type: 'Property',
          column: 36,
          endColumn: 50,
          endLine: 5,
          line: 5,
        },
      ],
    },
    {
      // Suggestion
      code: `
        module.exports = {
          meta: { messages: { foo: 'hello world' } },
          create(context) {
            context.report({ node, suggest: [{desc:'foo'}] });
          }
        };
      `,
      errors: [
        {
          messageId: 'foundMessage',
          type: 'Property',
          column: 47,
          endColumn: 57,
          endLine: 5,
          line: 5,
        },
      ],
    },
    {
      // ESM
      code: `
        export default {
          meta: { messages: { foo: 'hello world' } },
          create(context) {
            context.report({ node, message: 'foo' });
          }
        };
      `,
      languageOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'foundMessage',
          type: 'Property',
          column: 36,
          endColumn: 50,
          endLine: 5,
          line: 5,
        },
      ],
    },
    {
      // With message in variable.
      code: `
        const MESSAGE = \`\${foo} is bad.\`;
        module.exports = {
          meta: { messages: { foo: 'hello world' } },
          create(context) {
            context.report({
              node,
              message: MESSAGE
            });
          }
        };
      `,
      errors: [
        {
          messageId: 'foundMessage',
          type: 'Property',
          column: 15,
          endColumn: 31,
          endLine: 8,
          line: 8,
        },
      ],
    },
    {
      // With constructed message.
      code: `
        module.exports = {
          meta: { messages: { foo: 'hello world' } },
          create(context) {
            context.report({
              node,
              message: foo + ' is bad.'
            });
          }
        };
      `,
      errors: [
        {
          messageId: 'foundMessage',
          type: 'Property',
          column: 15,
          endColumn: 40,
          endLine: 7,
          line: 7,
        },
      ],
    },

    {
      // `meta.messages` empty but rule reports
      code: `
        module.exports = {
          meta: {
            messages: {},
          },
          create(context) {
            context.report({ node, messageId: 'foo' });
          }
        };
      `,
      errors: [
        {
          messageId: 'messagesMissing',
          type: 'ObjectExpression',
          column: 23,
          endColumn: 25,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      // `meta.messages` missing and using `message`
      code: `
        module.exports = {
          meta: {
            description: 'foo',
          },
          create(context) {
            context.report({ node, message: 'foo' });
          }
        };
      `,
      errors: [
        {
          messageId: 'messagesMissing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 12,
          endLine: 5,
          line: 3,
        },
        {
          messageId: 'foundMessage',
          type: 'Property',
          column: 36,
          endColumn: 50,
          endLine: 7,
          line: 7,
        },
      ],
    },
    {
      // `meta` missing.
      code: `
        module.exports = {
          create(context) {
            context.report({ node });
          }
        };
      `,
      errors: [
        {
          messageId: 'messagesMissing',
          type: 'FunctionExpression',
          column: 17,
          endColumn: 12,
          endLine: 5,
          line: 3,
        },
      ],
    },
    {
      // `meta` / `create` in variables, `messages` missing, using `message`.
      code: `
        const meta = {};
        const create = function (context) { context.report({ node, message: 'foo' }); }
        module.exports = { meta, create };
      `,
      errors: [
        {
          messageId: 'messagesMissing',
          type: 'ObjectExpression',
          column: 22,
          endColumn: 24,
          endLine: 2,
          line: 2,
        },
        {
          messageId: 'foundMessage',
          type: 'Property',
          column: 68,
          endColumn: 82,
          endLine: 3,
          line: 3,
        },
      ],
    },
  ],
});
