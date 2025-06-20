import rule from '../../../lib/rules/require-meta-docs-recommended.js';
import { RuleTester } from '../../utils/eslint-rule-tester.js';
import parser from '@typescript-eslint/parser';

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
      errors: [
        { messageId: 'missing', type: 'FunctionExpression', suggestions: [] },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {},
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          suggestions: [],
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { docs: {} },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'Property',
          suggestions: [
            {
              messageId: 'setRecommendedTrue',
              output: `
        module.exports = {
          meta: { docs: { recommended: true } },
          create(context) {}
        };
      `,
            },
            {
              messageId: 'setRecommendedFalse',
              output: `
        module.exports = {
          meta: { docs: { recommended: false } },
          create(context) {}
        };
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { recommended: undefined } },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'incorrect',
          type: 'Identifier',
          suggestions: [
            {
              messageId: 'setRecommendedTrue',
              output: `
        module.exports = {
          meta: { docs: { recommended: true } },
          create(context) {}
        };
      `,
            },
            {
              messageId: 'setRecommendedFalse',
              output: `
        module.exports = {
          meta: { docs: { recommended: false } },
          create(context) {}
        };
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { recommended: 'strict' } },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'incorrect',
          type: 'Literal',
          suggestions: [
            {
              messageId: 'setRecommendedTrue',
              output: `
        module.exports = {
          meta: { docs: { recommended: true } },
          create(context) {}
        };
      `,
            },
            {
              messageId: 'setRecommendedFalse',
              output: `
        module.exports = {
          meta: { docs: { recommended: false } },
          create(context) {}
        };
      `,
            },
          ],
        },
      ],
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
      errors: [
        {
          messageId: 'missing',
          type: 'Property',
          suggestions: [
            {
              messageId: 'setRecommendedTrue',
              output: `
        const extraDocs = { };
        const extraMeta = { docs: { ...extraDocs, recommended: true } };
        module.exports = {
            meta: { ...extraMeta },
            create(context) {}
        };
    `,
            },
            {
              messageId: 'setRecommendedFalse',
              output: `
        const extraDocs = { };
        const extraMeta = { docs: { ...extraDocs, recommended: false } };
        module.exports = {
            meta: { ...extraMeta },
            create(context) {}
        };
    `,
            },
          ],
        },
      ],
    },
    {
      code: 'module.exports = { create(context) {} };',
      output: null,
      options: [{ allowNonBoolean: true }],
      errors: [
        { messageId: 'missing', type: 'FunctionExpression', suggestions: [] },
      ],
    },
  ],
});

const ruleTesterTypeScript = new RuleTester({
  languageOptions: {
    parser,
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
      errors: [
        { messageId: 'missing', type: 'ObjectExpression', suggestions: [] },
      ],
    },
  ],
});
