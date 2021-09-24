/**
 * @fileoverview require rules to implement a `meta.fixable` property
 * @author Teddy Katz
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/require-meta-fixable');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('require-meta-fixable', rule, {
  valid: [
    `
      module.exports = {
        meta: {},
        create(context) {}
      };
    `,
    'module.exports = context => {};',
    `
      module.exports = {
        meta: { fixable: 'code' },
        create(context) {
          context.report({node, message, fix: foo});
        }
      };
    `,
    // Value in variable.
    `
      const fixable = 'code';
      module.exports = {
        meta: { fixable },
        create(context) {
          context.report({node, message, fix: foo});
        }
      };
    `,
    `
      module.exports = {
        meta: { fixable: 'whitespace' },
        create(context) {
          context.report({node, message, fix: foo});
        }
      };
    `,
    `
      module.exports = {
        meta: { 'fixable': 'code' },
        create(context) {
          context.report({node, message, fix: foo});
        }
      };
    `,
    `
      module.exports = {
        meta: { ['fixable']: 'code' },
        create(context) {
          context.report({node, message, fix: foo});
        }
      };
    `,
    `
      module.exports = {
        meta: { [\`fixable\`]: 'code' },
        create(context) {
          context.report({node, message, fix: foo});
        }
      };
    `,
    `
      module.exports = {
        meta: { fixable: null },
        create(context) {
          context.report({node, message});
        }
      };
    `,
    `
      module.exports = {
        meta: { fixable: undefined },
        create(context) {
          context.report({node, message});
        }
      };
    `,
    // `fixable` uses variable but no static value available.
    `
      module.exports = {
        meta: { fixable: foo },
        create(context) { context.report({node, message, fix: foo}); }
      };
    `,
    `
      module.exports = {
        meta: {},
        create(context) { context.report(node, loc, message); }
      };
    `,
    `
      module.exports = {
        meta: {},
        create(context) { context.report(node, message, data, fix); }
      };
    `,
    {
      code: `
        const meta = {};
        module.exports = {
          ...meta,
          meta: {},
          create(context) { context.report(node, message, data, fix); }
        };
      `,
      parserOptions: {
        ecmaVersion: 9,
      },
    },

    // catchNoFixerButFixableProperty = false (implicitly)
    `
      module.exports = {
        meta: { fixable: 'code' },
        create(context) { context.report({node, message}); }
      };
    `,
    `
      module.exports = {
        meta: { fixable: 'whitespace' },
        create(context) { context.report({node, message}); }
      };
    `,
    // catchNoFixerButFixableProperty = false (explicitly)
    {
      code: `
        module.exports = {
          meta: { fixable: 'code' },
          create(context) { context.report({node, message}); }
        };
      `,
      options: [{ catchNoFixerButFixableProperty: false }],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: 'whitespace' },
          create(context) { context.report({node, message}); }
        };
      `,
      options: [{ catchNoFixerButFixableProperty: false }],
    },
    // catchNoFixerButFixableProperty = true
    {
      code: `
        module.exports = {
          meta: { fixable: 'code' },
          create(context) {
            foo
              ? context.report({ node, message })
              : context.report({ node, message, fix });
          }
        };
      `,
      options: [{ catchNoFixerButFixableProperty: true }],
    },
  ],

  invalid: [
    {
      code: `
        module.exports = {
          meta: {},
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
    {
      code: `
        module.exports = {
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [{ messageId: 'missing', type: 'FunctionExpression' }],
    },
    {
      code: `
        module.exports = {
          meta: {},
          create(context) { context.report(node, loc, message, data, fix); }
        };
      `,
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: 'invalid' },
          create(context) { context.report({node, message}); }
        };
      `,
      errors: [{ messageId: 'invalid', type: 'Literal' }],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: 'invalid' },
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [{ messageId: 'invalid', type: 'Literal' }],
    },
    {
      code: `
        const fixable = 'invalid';
        module.exports = {
          meta: { fixable },
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [{ messageId: 'invalid', type: 'Identifier' }],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: null },
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [{ messageId: 'missing', type: 'Literal' }],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: undefined },
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [{ messageId: 'missing', type: 'Identifier' }],
    },

    // catchNoFixerButFixableProperty = true
    {
      code: `
        module.exports = {
          meta: { fixable: 'code' },
          create(context) { context.report({node, message}); }
        };
      `,
      options: [{ catchNoFixerButFixableProperty: true }],
      errors: [{ messageId: 'noFixerButFixableValue', type: 'Literal' }],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: 'whitespace' },
          create(context) { context.report({node, message}); }
        };
      `,
      options: [{ catchNoFixerButFixableProperty: true }],
      errors: [{ messageId: 'noFixerButFixableValue', type: 'Literal' }],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: null },
          create(context) { context.report({node, message, fix}); }
        };
      `,
      options: [{ catchNoFixerButFixableProperty: true }],
      errors: [{ messageId: 'missing', type: 'Literal' }],
    },
  ],
});
