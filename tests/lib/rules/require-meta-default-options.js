'use strict';

const rule = require('../../../lib/rules/require-meta-default-options');
const RuleTester = require('../eslint-rule-tester').RuleTester;

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('require-meta-default-options', rule, {
  valid: [
    'foo()',
    'module.exports = {};',
    `
      module.exports = {
        meta: {},
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { schema: [] },
        create(context) {}
      };
    `,
    {
      code: `
        export default {
          meta: { schema: [] },
          create(context) {}
        };
      `,
      languageOptions: { sourceType: 'module' },
    },
    `
      const mySchema = [];
      module.exports = {
        meta: { docs: { schema: mySchema } },
        create(context) {}
      };
    `,
    `
      const meta = { schema: [] };
      module.exports = {
        meta,
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { schema: [{}], defaultOptions: [1] },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { schema: [{}, {}], defaultOptions: [1] },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { schema: {}, defaultOptions: [1] },
        create(context) {}
      };
    `,
  ],

  invalid: [
    {
      code: `
        module.exports = {
          meta: { schema: [], defaultOptions: [1] },
          create(context) {}
        };
      `,
      output: `
        module.exports = {
          meta: { schema: [],  },
          create(context) {}
        };
      `,
      errors: [{ messageId: 'unnecessaryDefaultOptions', type: 'Property' }],
    },
    {
      code: `
        module.exports = {
          meta: { schema: [{}] },
          create(context) {}
        };
      `,
      output: `
        module.exports = {
          meta: { schema: [{}], defaultOptions: [] },
          create(context) {}
        };
      `,
      errors: [
        { messageId: 'missingDefaultOptions', type: 'ObjectExpression' },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { schema: [{}], defaultOptions: {} },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        { messageId: 'defaultOptionsMustBeArray', type: 'ObjectExpression' },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { schema: [{}], defaultOptions: undefined },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'defaultOptionsMustBeArray', type: 'Identifier' }],
    },
    {
      code: `
        module.exports = {
          meta: { schema: [{}], defaultOptions: [] },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        { messageId: 'defaultOptionsMustNotBeEmpty', type: 'ArrayExpression' },
      ],
    },
  ],
});

const ruleTesterTypeScript = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: { sourceType: 'module' },
  },
});

ruleTesterTypeScript.run('require-meta-default-options (TypeScript)', rule, {
  valid: [
    `
      export default createESLintRule<Options, MessageIds>({
        meta: { schema: [] },
        create(context) {}
      });
    `,
  ],
  invalid: [
    {
      code: `
        export default createESLintRule<Options, MessageIds>({
          meta: { schema: [{}] },
          create(context) {}
        });
      `,
      output: `
        export default createESLintRule<Options, MessageIds>({
          meta: { schema: [{}], defaultOptions: [] },
          create(context) {}
        });
      `,
      errors: [
        { messageId: 'missingDefaultOptions', type: 'ObjectExpression' },
      ],
    },
  ],
});
