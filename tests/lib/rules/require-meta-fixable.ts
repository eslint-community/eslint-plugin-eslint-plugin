/**
 * @fileoverview require rules to implement a `meta.fixable` property
 * @author Teddy Katz
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/require-meta-fixable.ts';
import { RuleTester } from 'eslint';

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
    // Unresolved spread may contain `fixable`.
    `
      const baseRule = require('./base-rule');
      module.exports = {
        meta: { ...baseRule.meta },
        create(context) {
          context.report({ node, message, fix(fixer) { return fixer.remove(node); } });
        }
      };
    `,
    // `fixable` may be inherited through a variable that itself spreads an unresolvable value.
    `
      const baseRule = require('./base-rule');
      const inheritedMeta = { ...baseRule.meta };
      module.exports = {
        meta: { ...inheritedMeta },
        create(context) {
          context.report({ node, message, fix(fixer) { return fixer.remove(node); } });
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
      name: 'fixable code (catchNoFixerButFixableProperty: false)',
    },
    {
      code: `
        module.exports = {
          meta: { fixable: 'whitespace' },
          create(context) { context.report({node, message}); }
        };
      `,
      options: [{ catchNoFixerButFixableProperty: false }],
      name: 'fixable whitespace (catchNoFixerButFixableProperty: false)',
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
      name: 'fixable code (catchNoFixerButFixableProperty: true)',
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
      name: 'spread in report (catchNoFixerButFixableProperty: true)',
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
      errors: [
        {
          messageId: 'missing',
          type: 'FunctionExpression',
          column: 17,
          endColumn: 73,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      // `create` as variable.
      code: `
        const create = function(context) { context.report({node, message, fix: foo}); }
        module.exports = { create };
      `,
      errors: [
        {
          messageId: 'missing',
          type: 'FunctionExpression',
          column: 24,
          endColumn: 88,
          endLine: 2,
          line: 2,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {},
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
        },
      ],
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
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {},
          create(context) { context.report(node, loc, message, data, fix); }
        };
      `,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: 'invalid' },
          create(context) { context.report({node, message}); }
        };
      `,
      errors: [
        {
          messageId: 'invalid',
          type: 'Literal',
          column: 28,
          endColumn: 37,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: 'invalid' },
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [
        {
          messageId: 'invalid',
          type: 'Literal',
          column: 28,
          endColumn: 37,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        const fixable = 'invalid';
        module.exports = {
          meta: { fixable },
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [
        {
          messageId: 'invalid',
          type: 'Identifier',
          column: 19,
          endColumn: 26,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: null },
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [
        {
          messageId: 'missing',
          type: 'Literal',
          column: 28,
          endColumn: 32,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: undefined },
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [
        {
          messageId: 'missing',
          type: 'Identifier',
          column: 28,
          endColumn: 37,
          endLine: 3,
          line: 3,
        },
      ],
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
      errors: [
        {
          messageId: 'noFixerButFixableValue',
          type: 'Literal',
          column: 28,
          endColumn: 34,
          endLine: 3,
          line: 3,
        },
      ],
      name: 'fixable code (catchNoFixerButFixableProperty: true)',
    },
    {
      code: `
        module.exports = {
          meta: { fixable: 'whitespace' },
          create(context) { context.report({node, message}); }
        };
      `,
      options: [{ catchNoFixerButFixableProperty: true }],
      errors: [
        {
          messageId: 'noFixerButFixableValue',
          type: 'Literal',
          column: 28,
          endColumn: 40,
          endLine: 3,
          line: 3,
        },
      ],
      name: 'fixable whitespace (catchNoFixerButFixableProperty: true)',
    },
    {
      code: `
        module.exports = {
          meta: { fixable: null },
          create(context) { context.report({node, message, fix}); }
        };
      `,
      options: [{ catchNoFixerButFixableProperty: true }],
      errors: [
        {
          messageId: 'missing',
          type: 'Literal',
          column: 28,
          endColumn: 32,
          endLine: 3,
          line: 3,
        },
      ],
      name: 'fixable null (catchNoFixerButFixableProperty: true)',
    },
  ],
});
