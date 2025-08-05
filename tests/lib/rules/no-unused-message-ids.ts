// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/no-unused-message-ids.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('no-unused-message-ids', rule, {
  valid: [
    // message
    `
      module.exports = {
        create(context) {
          context.report({ node, message: 'foo' });
        }
      };
    `,
    // messageId
    `
      module.exports = {
        meta: { messages: { someMessageId: 'some message' } },
        create(context) {
          context.report({ node, messageId: 'someMessageId' });
        }
      };
    `,
    // Suggestion with messageId
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
    // unrelated function 1
    `
      module.exports = {
        create(context) {
          foo.report({ node, messageId: 'foo' });
        }
      };
    `,
    // unrelated function 2
    `
      module.exports = {
        create(context) {
          context.foo({ node, message: 'foo' });
        }
      };
    `,
    // report outside rule
    `
      context.report({ node, messageId: 'foo' });
      module.exports = {
        create(context) {}
      };
    `,
    // test
    `
      new RuleTester().run('foo', bar, {
        invalid: [
          { code: 'foo', errors: [{messageId: 'foo'}] },
        ]
      });
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
          context.report({ node, messageId: 'foo' });
        }
      };
    `,
    // `messageId` is not a literal
    `
      module.exports = {
        meta: { messages: {} },
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
    // `meta.messages` empty
    `
      module.exports = {
        meta: { messages: {} },
        create(context) {
          context.report();
        }
      };
    `,
    // `meta.messages` missing
    `
      module.exports = {
        meta: { },
        create(context) {
          context.report();
        }
      };
    `,
    // `meta` missing
    `
      module.exports = {
        create(context) {
          context.report();
        }
      };
    `,
    // messageId variable with multiple possible values
    `
      module.exports = {
        meta: { messages: { foo: 'hello world' } },
        create(context) {
          let messageId;
          if (foo) { messageId = 'abc'; } else { messageId = getMessageId(); }
          context.report({ node, messageId });
        }
      };
    `,
    // helper function for report
    `
      module.exports = {
        meta: { messages: { foo: 'hello world' } },
        create(context) {
          function report({ node, messageId }) {
            context.report({ node, messageId });
          }
          report({ node, messageId: 'foo' });
        }
      };
    `,
    // helper function outside rule with dynamic messageId
    `
      function report({ node, messageId }) {
        context.report({ node, messageId });
      }
      module.exports = {
        meta: { messages: { foo: 'hello world' } },
        create(context) {
          report({ node, messageId: 'foo' });
        }
      };
    `,
    // helper function outside rule with literal messageId
    `
      function reportFoo(node) {
        context.report({ node, messageId: 'foo' });
      }
      module.exports = {
        meta: { messages: { foo: 'hello world' } },
        create(context) {
          reportFoo(node);
        }
      };
    `,
    // helper function outside rule with variable messageId
    `
      function reportFoo(node) {
        const messageId = 'foo';
        context.report({ node, messageId });
      }
      module.exports = {
        meta: { messages: { foo: 'hello world' } },
        create(context) {
          reportFoo(node);
        }
      };
    `,
    // with variable messageId key
    `
      const MESSAGE_ID = 'foo';
      const messages = {
        [MESSAGE_ID]: 'hello world',
      };
      module.exports = {
        meta: { messages },
        create(context) {
          context.report({node, messageId: MESSAGE_ID});
        }
      };
    `,
    // Ignore when we couldn't find any calls to `context.report()`, likely because an external helper function is in use.
    `
      module.exports = {
        meta: { messages: { foo: 'bar' } },
        create(context) {}
      };
    `,
    // Helper function messageId parameter, outside rule.
    `
      function reportFoo(node, messageId) {
        context.report({ node, messageId });
      }
      module.exports = {
        meta: { messages: { foo: 'hello', bar: 'world', baz: 'planet' } },
        create(context) {
          reportFoo(node, 'foo');
          reportFoo(node, 'bar');
          reportFoo(node, 'baz');
        }
      };
    `,
    // Helper function with messageId parameter, inside rule, parameter reassignment.
    `
      module.exports = {
        meta: { messages: { foo: 'hello', bar: 'world', baz: 'planet' } },
        create(context) {
          function reportFoo(node, messageId) {
            if (foo) {
              messageId = 'baz';
            }
            context.report({ node, messageId });
          }
          reportFoo(node, 'foo');
          reportFoo(node, 'bar');
        }
      };
    `,
    // Helper function with messageId parameter, outside rule, with an unused messageId.
    // TODO: this should be an invalid test case because a messageId is unused.
    // Eventually, we should be able to detect what values are passed to this function for its messageId parameter.
    `
      function reportFoo(node, messageId) {
        context.report({ node, messageId });
      }
      module.exports = {
        meta: { messages: { foo: 'hello', bar: 'world' } },
        create(context) {
          reportFoo(node, 'foo');
        }
      };
    `,
    'module.exports = {};', // No rule.
  ],

  invalid: [
    {
      // Unused message
      code: `
        module.exports = {
          meta: { messages: { foo: 'hello world '} },
          create(context) {
            context.report({ node, messageId: 'bar' });
          }
        };
      `,
      errors: [
        {
          messageId: 'unusedMessage',
          data: { messageId: 'foo' },
          type: 'Property',
        },
      ],
    },
    {
      // Unused message with spreads
      code: `
        const extraMessages = { foo: 'hello world' };
        const extraMeta = { messages: { ...extraMessages } };
        module.exports = {
          meta: { ...extraMeta },
          create(context) {
            context.report({ node, messageId: 'bar' });
          }
        };
      `,
      errors: [
        {
          messageId: 'unusedMessage',
          data: { messageId: 'foo' },
          type: 'Property',
        },
      ],
    },
    {
      // ESM
      code: `
        export default {
          meta: { messages: { foo: 'hello world' } },
          create(context) {
            context.report({ node, messageId: 'bar' });
          }
        };
      `,
      languageOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'unusedMessage',
          data: { messageId: 'foo' },
          type: 'Property',
        },
      ],
    },
    {
      // `meta` / `create` in variables
      code: `
        const meta = { messages: { foo: 'hello world' }};
        const create = function (context) { context.report({ node, messageId: 'bar' }); }
        module.exports = { meta, create };
      `,
      errors: [
        {
          messageId: 'unusedMessage',
          data: { messageId: 'foo' },
          type: 'Property',
        },
      ],
    },
    {
      // messageId unused with multiple messages
      code: `
        module.exports = {
          meta: { messages: { foo: 'hello world', bar: 'hello world 2' } },
          create(context) {
            context.report({ node, messageId: 'bar' });
          }
        };
      `,
      errors: [
        {
          messageId: 'unusedMessage',
          data: { messageId: 'foo' },
          type: 'Property',
        },
      ],
    },
    {
      // messageId unused with meta.messages in variable
      code: `
          const messages = { foo: 'hello world' };
          module.exports = {
            meta: { messages },
            create(context) { context.report({node, messageId: 'other'}); }
          };
        `,
      errors: [
        {
          messageId: 'unusedMessage',
          data: { messageId: 'foo' },
          type: 'Property',
        },
      ],
    },
    {
      // messageId unused with meta.messages in spreads
      code: `
          const extraMessages = { foo: 'hello world' };
          const extraMeta = { messages: { ...extraMessages } };
          module.exports = {
            meta: { ...extraMeta },
            create(context) { context.report({node, messageId: 'other'}); }
          };
        `,
      errors: [
        {
          messageId: 'unusedMessage',
          data: { messageId: 'foo' },
          type: 'Property',
        },
      ],
    },
    {
      // helper function outside rule with variable messageId
      code: `
        function reportFoo(node) {
          const messageId = 'bar';
          context.report({ node, messageId });
        }
        module.exports = {
          meta: { messages: { foo: 'hello world', bar: 'baz' } },
          create(context) {
            reportFoo(node);
          }
        };
      `,
      errors: [
        {
          messageId: 'unusedMessage',
          data: { messageId: 'foo' },
          type: 'Property',
        },
      ],
    },
  ],
});
