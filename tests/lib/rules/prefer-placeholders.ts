/**
 * @fileoverview require using placeholders for dynamic report messages
 * @author Teddy Katz
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/prefer-placeholders.ts';
import { RuleTester } from 'eslint';

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
      errors: [
        {
          messageId: 'usePlaceholders',
          type: 'TemplateLiteral',
          column: 24,
          endColumn: 40,
          endLine: 6,
          line: 6,
        },
      ],
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
      errors: [
        {
          messageId: 'usePlaceholders',
          type: 'TemplateLiteral',
          column: 25,
          endColumn: 41,
          endLine: 7,
          line: 7,
        },
      ],
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
      errors: [
        {
          messageId: 'usePlaceholders',
          type: 'TemplateLiteral',
          column: 25,
          endColumn: 41,
          endLine: 2,
          line: 2,
        },
      ],
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
      errors: [
        {
          messageId: 'usePlaceholders',
          type: 'BinaryExpression',
          column: 24,
          endColumn: 40,
          endLine: 6,
          line: 6,
        },
      ],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(node, \`\${foo} is bad.\`);
          }
        };
      `,
      errors: [
        {
          messageId: 'usePlaceholders',
          type: 'TemplateLiteral',
          column: 34,
          endColumn: 50,
          endLine: 4,
          line: 4,
        },
      ],
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
      errors: [
        {
          messageId: 'usePlaceholders',
          type: 'TemplateLiteral',
          column: 22,
          endColumn: 38,
          endLine: 5,
          line: 5,
        },
      ],
    },
  ],
});
