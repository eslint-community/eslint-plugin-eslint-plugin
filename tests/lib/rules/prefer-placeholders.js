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

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
const ERROR = { message: 'Use report message placeholders instead of string concatenation.' };


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
      errors: [ERROR],
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
      errors: [ERROR],
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
      errors: [ERROR],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(node, \`\${foo} is bad.\`);
          }
        };
      `,
      errors: [ERROR],
    },
  ],
});
