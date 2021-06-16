/**
 * @fileoverview enforce a consistent format for rule report messages
 * @author Teddy Katz
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/report-message-format');
const RuleTester = require('eslint').RuleTester;


// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('report-message-format', rule, {

  valid: [
    // with no configuration, everything is allowed
    'module.exports = context => context.report(node, "foo");',
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
  ].map(invalidCase => {
    return Object.assign({
      errors: [{ message: `Report message does not match the pattern '${invalidCase.options[0]}'.` }],
    }, invalidCase);
  }),
});
