'use strict';

const rule = require('../../../lib/rules/require-meta-docs-recommended');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 9 } });
ruleTester.run('require-meta-docs-recommended', rule, {
  valid: [
    'foo()',
    'module.exports = {};',
    `
      module.exports = {
        meta: { docs: { recommended: true } },
        create(context) {}
      };
    `,
    {
      code: `
        export default {
          meta: { docs: { recommended: 'disallow unused variables' } },
          create(context) {}
        };
      `,
      parserOptions: { sourceType: 'module' },
    },
    `
      const RECOMMENDED = true;
      module.exports = {
        meta: { docs: { recommended: RECOMMENDED } },
        create(context) {}
      };
    `,

    `
      const meta = { docs: { recommended: 'enforce foo' } };
      module.exports = {
        meta,
        create(context) {}
      };
    `,
    `
      const extraDocs = { recommended: 123 };
      const extraMeta = { docs: { ...extraDocs } };
      module.exports = {
        meta: { ...extraMeta },
        create(context) {}
      };
    `,
  ],

  invalid: [
    {
      code: 'module.exports = { create(context) {} };',
      output: null,
      errors: [{ messageId: 'missing', type: 'FunctionExpression' }],
    },
    {
      code: `
        module.exports = {
          meta: {},
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
    {
      code: `
        const extraDocs = { };
        const extraMeta = { docs: { ...extraDocs } };
        module.exports = {
            meta: { ...extraMeta },
            create(context) {}
        };
    `,
      output: null,
      errors: [{ messageId: 'missing', type: 'Property' }],
    },
  ],
});

const ruleTesterTypeScript = new RuleTester({
  parserOptions: { sourceType: 'module' },
  parser: require.resolve('@typescript-eslint/parser'),
});
ruleTesterTypeScript.run('require-meta-docs-recommended (TypeScript)', rule, {
  valid: [
    `
      export default createESLintRule<Options, MessageIds>({
        meta: { docs: { recommended: true } },
        create(context) {}
      });
    `,
  ],
  invalid: [
    {
      code: `
        export default createESLintRule<Options, MessageIds>({
          meta: {},
          create(context) {}
        });
      `,
      output: null,
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
  ],
});
