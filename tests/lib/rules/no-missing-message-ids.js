'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-missing-message-ids');
const RuleTester = require('../eslint-rule-tester').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('no-missing-message-ids', rule, {
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
    // messageId
    `
      module.exports = {
        meta: { messages: { someMessageId: 'some message' } },
        create(context) {
          let messageId = null;
          messageId = undefined;
          messageId = "";
          messageId = 'someMessageId';
          context.report({ node, messageId });
        }
      };
    `,
    // messageId variable with multiple possible values and unexpected operator
    `
      module.exports = {
        meta: { messages: { foo: 'hello world' } },
        create(context) {
          let messageId = 'foo';
          messageId += 'bar'; // ignored since not = operator
          context.report({ node, messageId });
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
        meta: { messages: {} },
        create(context) {
          foo.report({ node, messageId: 'foo' });
        }
      };
    `,
    // unrelated function 2
    `
      module.exports = {
        meta: { messages: {} },
        create(context) {
          context.foo({ node, messageId: 'foo' });
        }
      };
    `,
    // not the right context function
    `
      module.exports = {
        meta: { messages: {} },
        create() {
          context.foo({ node, messageId: 'foo' });
        }
      };
    `,
    // report outside rule
    `
      context.report({ node, messageId: 'foo' });
      module.exports = {
        meta: { messages: {} },
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
          context.report({ node, messageId: 'foo' });
        }
      };
    `,
    // `meta` missing
    `
      module.exports = {
        create(context) {
          context.report({ node, messageId: 'foo' });
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
    // Helper function with messageId parameter, outside rule.
    `
      function report(node, messageId) {
        context.report({node, messageId});
      }
      module.exports = {
        meta: { messages: { foo: 'hello' } },
        create(context) {
          report(node, 'foo');
        }
      };
    `,
    // Helper function with messageId parameter, inside rule, with parameter reassignment.
    `
      module.exports = {
        meta: { messages: { foo: 'hello', bar: 'world' } },
        create(context) {
          function report(node, messageId) {
            if (foo) {
              messageId = 'bar';
            }
            context.report({node, messageId});
          }
          report(node, 'foo');
        }
      };
    `,
    // Helper function with messageId parameter, inside rule, with missing messageId.
    // TODO: this should be an invalid test case because a non-existent `messageId` is used.
    // Eventually, we should be able to detect what values are passed to this function for its `messageId` parameter.
    `
      module.exports = {
        meta: { messages: { foo: 'hello' } },
        create(context) {
          function report(node, messageId) {
            context.report({node, messageId});
          }
          report(node, 'foo');
          report(node, 'bar');
        }
      };
    `,
    'module.exports = {};', // No rule.
  ],

  invalid: [
    {
      // Missing message
      code: `
        module.exports = {
          meta: { messages: { } },
          create(context) {
            context.report({ node, messageId: 'foo' });
          }
        };
      `,
      errors: [
        {
          messageId: 'missingMessage',
          data: { messageId: 'foo' },
          type: 'Literal',
        },
      ],
    },
    {
      // Missing messages with multiple possible values
      code: `
        module.exports = {
          meta: { messages: { foo: 'hello world' } },
          create(context) {
            let messageId = 'abc';
            messageId = 'def';
            if (foo) { messageId = 'foo'; } else { messageId = 'bar'; }
            context.report({ node, messageId });
          }
        };
      `,
      errors: [
        {
          messageId: 'missingMessage',
          data: { messageId: 'abc' },
          type: 'Literal',
        },
        {
          messageId: 'missingMessage',
          data: { messageId: 'def' },
          type: 'Literal',
        },
        {
          messageId: 'missingMessage',
          data: { messageId: 'bar' },
          type: 'Literal',
        },
      ],
    },
    {
      // Missing message with spreads
      code: `
        const extraMessages = { };
        const extraMeta = { messages: { ...extraMessages } };
        module.exports = {
          meta: { ...extraMeta },
          create(context) {
            context.report({ node, messageId: 'foo' });
          }
        };
      `,
      errors: [
        {
          messageId: 'missingMessage',
          data: { messageId: 'foo' },
          type: 'Literal',
        },
      ],
    },
    {
      // ESM
      code: `
        export default {
          meta: { messages: { } },
          create(context) {
            context.report({ node, messageId: 'foo' });
          }
        };
      `,
      errors: [
        {
          messageId: 'missingMessage',
          data: { messageId: 'foo' },
          type: 'Literal',
        },
      ],
      languageOptions: { sourceType: 'module' },
    },
    {
      // Helper function with messageId parameter, inside rule, with missing messageId due to parameter reassignment.
      code: `
        module.exports = {
          meta: { messages: { foo: 'hello' } },
          create(context) {
            function report(node, messageId) {
              if (foo) {
                messageId = 'bar';
              }
              context.report({node, messageId});
            }
            report(node, 'foo');
          }
        };
      `,
      errors: [
        {
          messageId: 'missingMessage',
          data: { messageId: 'bar' },
          type: 'Literal',
        },
      ],
    },
  ],
});
