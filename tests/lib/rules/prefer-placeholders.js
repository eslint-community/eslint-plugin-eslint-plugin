/**
 * @fileoverview require using placeholders for dynamic report messages
 * @author Teddy Katz
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/prefer-placeholders');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('prefer-placeholders', rule, {
  valid: [
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            message: '{{foo}} is bad.',
            data: { foo },
          });
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            message: 'foo is bad.'
          });
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            message: foo
          });
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          context.report(node, 'foo is bad.');
        }
      };
    `,
    // With message in variable.
    `
      const MESSAGE = 'foo is bad.';
      module.exports = {
        create(context) {
          context.report(node, MESSAGE);
        }
      };
    `,
    // With message in variable but cannot statically determine its value.
    `
      const MESSAGE = getMessage();
      module.exports = {
        create(context) {
          context.report(node, MESSAGE);
        }
      };
    `,
    // Suggestion (message + data)
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            suggest: [
              {
                message: '{{foo}} is bad.',
                data: { foo },
              }
            ]
          });
        }
      };
    `,
    // Suggestion (message)
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            suggest: [ { message: 'hello world' }]
          });
        }
      };
    `,
    // Suggestion (messageId)
    `
      module.exports = {
        create(context) {
          context.report({
            node,
            suggest: [ { messageId: 'myMessageId' }]
          });
        }
      };
    `,
    `module.exports = {};`, // Not a rule.
  ],

  invalid: [
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              node,
              message: \`\${foo} is bad.\`
            });
          }
        };
      `,
      errors: [{ messageId: 'usePlaceholders', type: 'TemplateLiteral' }],
    },
    {
      // Suggestion
      code: `
        module.exports = {
          create(context) {
            context.report({
              node,
              suggest: [
                { desc: \`\${foo} is bad.\` }
              ]
            });
          }
        };
      `,
      errors: [{ messageId: 'usePlaceholders', type: 'TemplateLiteral' }],
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
      errors: [{ messageId: 'usePlaceholders', type: 'TemplateLiteral' }],
    },
    {
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
      errors: [{ messageId: 'usePlaceholders', type: 'BinaryExpression' }],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(node, \`\${foo} is bad.\`);
          }
        };
      `,
      errors: [{ messageId: 'usePlaceholders', type: 'TemplateLiteral' }],
    },
    {
      // `create` in variable.
      code: `
        function create(context) {
          context.report({
            node,
            message: \`\${foo} is bad.\`
          });
        }
        module.exports = { create };
      `,
      errors: [{ messageId: 'usePlaceholders', type: 'TemplateLiteral' }],
    },
  ],
});
