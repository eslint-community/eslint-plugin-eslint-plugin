/**
 * @fileoverview require rules to implement a `meta.fixable` property
 * @author Teddy Katz
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/require-meta-fixable.js';
import { RuleTester } from '../../utils/eslint-rule-tester.js';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('require-meta-fixable', rule, {
  valid: [
    // No `meta`.
    `
      module.exports = {
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: {},
        create(context) {}
      };
    `,
    'module.exports = context => { return {}; };',
    `
      module.exports = {
        meta: { fixable: 'code' },
        create(context) {
          context.report({node, message, fix: foo});
        }
      };
    `,
    {
      // ESM
      code: `
        export default {
          meta: { fixable: 'code' },
          create(context) {
            context.report({node, message, fix: foo});
          }
        };
      `,
      languageOptions: { sourceType: 'module' },
    },
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
        const extra = {};
        module.exports = {
          ...extra,
          meta: {},
          create(context) { context.report(node, message, data, fix); }
        };
      `,
      languageOptions: {
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
    // Spread in meta.
    `
      const extra = { 'fixable': 'code' };
      module.exports = {
        meta: { ...extra },
        create(context) {
          context.report({node, message, fix: foo});
        }
      };
    `,
    // Spread in report.
    {
      code: `
      module.exports = {
        meta: { fixable: 'code' },
        create(context) {
          const extra = { fix: foo };
          context.report({node, message, ...extra});
        }
      };
    `,
      options: [{ catchNoFixerButFixableProperty: true }],
    },
    // No rule present.
    `const foo = { fix: [{}]}; context.report({node,message,fix});`,
  ],

  invalid: [
    {
      // No `meta`. Violation on `create`.
      code: `
        module.exports = {
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [{ messageId: 'missing', type: 'FunctionExpression' }],
    },
    {
      // `create` as variable.
      code: `
        const create = function(context) { context.report({node, message, fix: foo}); }
        module.exports = { create };
      `,
      errors: [{ messageId: 'missing', type: 'FunctionExpression' }],
    },
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
      // ESM
      code: `
        export default {
          meta: {},
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      languageOptions: { sourceType: 'module' },
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
