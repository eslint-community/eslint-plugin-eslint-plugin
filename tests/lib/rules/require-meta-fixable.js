/**
 * @fileoverview require rules to implement a meta.fixable property
 * @author Teddy Katz
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/require-meta-fixable');
const RuleTester = require('eslint').RuleTester;

const MISSING_ERROR = [{ message: 'Fixable rules must export a `meta.fixable` property.', type: 'FunctionExpression' }];
const INVALID_ERROR = [{ message: '`meta.fixable` must be either `code`, `whitespace` or `null`.', type: 'Property' }];

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
    `
      module.exports = {
        meta: { fixable: 'code' },
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
        meta: { fixable: 'code' },
        create(context) {
          context.report({node, message});
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
    {
      code: `
        module.exports = {
          meta: {},
          create(context) { context.report(node, loc, message); }
        };
      `,
      errors: [MISSING_ERROR],
    },
    `
      module.exports = {
        meta: {},
        create(context) { context.report(node, message, data, fix); }
      };
    `,
  ],

  invalid: [
    {
      code: `
        module.exports = {
          meta: {},
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [MISSING_ERROR],
    },
    {
      code: `
        module.exports = {
          meta: {},
          create(context) { context.report(node, loc, message, data, fix); }
        };
      `,
      errors: [MISSING_ERROR],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: 'invalid' },
          create(context) { context.report({node, message}); }
        };
      `,
      errors: [INVALID_ERROR],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: 'invalid' },
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [INVALID_ERROR],
    },
    {
      code: `
        module.exports = {
          meta: { fixable: foo },
          create(context) { context.report({node, message, fix: foo}); }
        };
      `,
      errors: [INVALID_ERROR],
    },
  ],
});
