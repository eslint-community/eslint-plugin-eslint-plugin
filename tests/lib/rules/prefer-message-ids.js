// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/prefer-message-ids.js';
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
    // `context.report` with no args.
    `
      module.exports = {
        meta: { messages },
        create(context) {
          context.report();
        }
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
      errors: [{ messageId: 'foundMessage', type: 'Property' }],
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
      errors: [{ messageId: 'foundMessage', type: 'Property' }],
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
      errors: [{ messageId: 'foundMessage', type: 'Property' }],
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
      errors: [{ messageId: 'foundMessage', type: 'Property' }],
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
      errors: [{ messageId: 'foundMessage', type: 'Property' }],
    },

    {
      // `meta.messages` missing
      code: `
        module.exports = {
          meta: { description: 'foo' },
          create(context) { }
        };
      `,
      errors: [{ messageId: 'messagesMissing', type: 'ObjectExpression' }],
    },
    {
      // `meta.messages` empty
      code: `
        module.exports = {
          meta: {
            description: 'foo',
            messages: {},
          },
          create(context) { }
        };
      `,
      errors: [{ messageId: 'messagesMissing', type: 'ObjectExpression' }],
    },
    {
      // `meta.messages` empty (in variable)
      code: `
        const messages = {};
        module.exports = {
          meta: {
            description: 'foo',
            messages,
          },
          create(context) { }
        };
      `,
      errors: [{ messageId: 'messagesMissing', type: 'Identifier' }],
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
        { messageId: 'messagesMissing', type: 'ObjectExpression' },
        { messageId: 'foundMessage', type: 'Property' },
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
      errors: [{ messageId: 'messagesMissing', type: 'FunctionExpression' }],
    },
    {
      // `meta` / `create` in variables, `messages` missing, using `message`.
      code: `
        const meta = {};
        const create = function (context) { context.report({ node, message: 'foo' }); }
        module.exports = { meta, create };
      `,
      errors: [
        { messageId: 'messagesMissing', type: 'ObjectExpression' },
        { messageId: 'foundMessage', type: 'Property' },
      ],
    },
  ],
});
