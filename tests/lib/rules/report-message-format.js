/**
 * @fileoverview enforce a consistent format for rule report messages
 * @author Teddy Katz
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/report-message-format.js';
import { RuleTester } from '../../utils/eslint-rule-tester.js';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('report-message-format', rule, {
  valid: [
    // with no configuration, everything is allowed
    'module.exports = context => { context.report(node, "foo"); return {}; }',
    {
      code: `
        module.exports = {
          create(context) {
            context.report(node, 'foo');
          }
        };
      `,
      options: ['foo'],
    },
    {
      // ESM
      code: `
        export default {
          create(context) {
            context.report(node, 'foo');
          }
        };
      `,
      options: ['foo'],
      languageOptions: { sourceType: 'module' },
    },
    {
      // With message as variable.
      code: `
        const MESSAGE = 'foo';
        module.exports = {
          create(context) {
            context.report(node, MESSAGE);
          }
        };
      `,
      options: ['foo'],
    },
    {
      // With message as variable but cannot statically determine its type.
      code: `
        const MESSAGE = getMessage();
        module.exports = {
          create(context) {
            context.report(node, MESSAGE);
          }
        };
      `,
      options: ['foo'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(node, 'foo');
          }
        };
      `,
      options: ['f'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(node, message);
          }
        };
      `,
      options: ['foo'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(node, 'not foo' + message);
          }
        };
      `,
      options: ['^foo$'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({node, message: 'foo'});
          }
        };
      `,
      options: ['^foo$'],
    },
    {
      // Suggestion function
      code: `
        module.exports = {
          create(context) {
            context.report({node, suggest: [getSuggestion(node)]});
          }
        };
      `,
      options: ['^foo$'],
    },
    {
      // Suggestion message
      code: `
        module.exports = {
          create(context) {
            context.report({node, suggest: [{message: 'foo'}]});
          }
        };
      `,
      options: ['^foo$'],
    },
    {
      // Suggestion message with ternary expression
      code: `
        module.exports = {
          create(context) {
            context.report({node, suggest: foo ? []: [{}]});
          }
        };
      `,
      options: ['^foo$'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({node, message: 'foobarbaz'});
          }
        };
      `,
      options: ['bar'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({node, message: \`foobarbaz\`});
          }
        };
      `,
      options: ['bar'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report();
          }
        };
      `,
      options: ['bar'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({});
          }
        };
      `,
      options: ['foo'],
    },
    {
      code: `
        module.exports = {
          meta: {
            messages: {
              message1: 'foo bar',
              message2: 'bar foobar'
            }
          },
          create: context => ({})
        }
      `,
      options: ['foo'],
    },
    'module.exports = {};', // No rule.
  ],

  invalid: [
    {
      code: `
        module.exports = {
          create(context) {
            context.report(node, 'bar');
          }
        };
      `,
      options: ['foo'],
    },
    {
      // ESM
      code: `
        export default {
          create(context) {
            context.report(node, 'bar');
          }
        };
      `,
      options: ['foo'],
      languageOptions: { sourceType: 'module' },
    },
    {
      // With message as variable.
      code: `
        const MESSAGE = 'bar';
        module.exports = {
          create(context) {
            context.report(node, MESSAGE);
          }
        };
      `,
      options: ['foo'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(node, 'foobar');
          }
        };
      `,
      options: ['^foo$'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(node, 'FOO');
          }
        };
      `,
      options: ['foo'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report(node, \`FOO\`);
          }
        };
      `,
      options: ['foo'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({node, message: 'FOO'});
          }
        };
      `,
      options: ['foo'],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({node, message: \`FOO\`});
          }
        };
      `,
      options: ['foo'],
    },
    {
      // Suggestion message
      code: `
        module.exports = {
          create(context) {
            context.report({node, suggest: [{message: 'FOO'}]});
          }
        };
      `,
      options: ['foo'],
    },
    {
      code: `
        module.exports = {
          meta: {
            messages: {
              message1: 'bar'
            }
          },
          create: context => ({})
        };
      `,
      options: ['foo'],
    },
    {
      // `create` in variable.
      code: `
        function create(context) {
          context.report(node, 'bar');
        }
        module.exports = { create };
      `,
      options: ['foo'],
    },
  ].map((invalidCase) => {
    return Object.assign(
      {
        errors: [
          {
            message: `Report message does not match the pattern '${invalidCase.options[0]}'.`,
          },
        ],
      },
      invalidCase,
    );
  }),
});
