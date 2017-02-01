/**
 * @fileoverview disallow template literals as report messages
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
