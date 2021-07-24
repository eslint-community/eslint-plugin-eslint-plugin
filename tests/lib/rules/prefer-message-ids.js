'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/prefer-message-ids');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });

ruleTester.run('prefer-message-ids', rule, {
  valid: [
    `
      module.exports = {
        create(context) {
          context.report({ node });
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          context.report({ node, messageId: 'foo' });
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          foo.report({ node, message: 'foo' }); // unrelated function
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          context.foo({ node, message: 'foo' }); // unrelated function
        }
      };
    `,
    `
      context.report({ node, message: 'foo' }); // outside rule
      module.exports = {
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
  ],

  invalid: [
    {
      code: `
        module.exports = {
          create(context) {
            context.report({ node, message: 'foo' });
          }
        };
      `,
      errors: [{ messageId: 'foundMessage', type: 'Property' }],
    },
    {
      // With message in variable.
      code: `
        const MESSAGE = \`\${foo} is bad.\`;
        module.exports = {
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
  ],
});
