'use strict';

const rule = require('../../../lib/rules/require-meta-docs-recommended');
const RuleTester = require('../eslint-rule-tester').RuleTester;

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

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
          meta: { docs: { recommended: true } },
          create(context) {}
        };
      `,
      languageOptions: { sourceType: 'module' },
    },
    `
      const RECOMMENDED = true;
      module.exports = {
        meta: { docs: { recommended: RECOMMENDED } },
        create(context) {}
      };
    `,

    `
      const meta = { docs: { recommended: true } };
      module.exports = {
        meta,
        create(context) {}
      };
    `,
    `
      const extraDocs = { recommended: true };
      const extraMeta = { docs: { ...extraDocs } };
      module.exports = {
        meta: { ...extraMeta },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { docs: { recommended: RECOMMENDED } },
        create(context) {}
      };
    `,
    {
      code: `
        module.exports = {
          meta: { docs: { recommended: undefined } },
          create(context) {}
        };
      `,
      options: [{ allowNonBoolean: true }],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { recommended: 'strict' } },
          create(context) {}
        };
      `,
      options: [{ allowNonBoolean: true }],
    },
    {
      code: `
        const extraDocs = { recommended: 'strict' };
        const extraMeta = { docs: { ...extraDocs } };
        module.exports = {
          meta: { ...extraMeta },
          create(context) {}
        };
      `,
      options: [{ allowNonBoolean: true }],
    },
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
        module.exports = {
          meta: { docs: {} },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'missing', type: 'Property' }],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { recommended: undefined } },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'incorrect', type: 'Identifier' }],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { recommended: 'strict' } },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'incorrect', type: 'Literal' }],
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
    {
      code: 'module.exports = { create(context) {} };',
      output: null,
      options: [{ allowNonBoolean: true }],
      errors: [{ messageId: 'missing', type: 'FunctionExpression' }],
    },
  ],
});

const ruleTesterTypeScript = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: { sourceType: 'module' },
  },
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
