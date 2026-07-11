import rule from '../../../lib/rules/require-meta-docs-recommended.ts';
import { RuleTester } from 'eslint';
import parser from '@typescript-eslint/parser';

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('require-meta-docs-recommended', rule, {
  valid: [
    'foo()',
    'module.exports = {};',
    `
      const docs = require('./rule.docs.js');
      module.exports = {
        meta: { docs },
        create(context) {}
      };
    `,
    `
      const docs = require('./rule.docs.js');
      module.exports = {
        meta: { docs: { ...docs } },
        create(context) {}
      };
    `,
    {
      code: `
        import docs from './rule.docs.js';
        export default {
          meta: { docs },
          create(context) {}
        };
      `,
      languageOptions: { sourceType: 'module' },
    },
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
      name: 'undefined recommended (allowNonBoolean: true)',
    },
    {
      code: `
        module.exports = {
          meta: { docs: { recommended: 'strict' } },
          create(context) {}
        };
      `,
      options: [{ allowNonBoolean: true }],
      name: 'string recommended (allowNonBoolean: true)',
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
      name: 'multiple spreads with string recommended (allowNonBoolean: true)',
    },
  ],

  invalid: [
    {
      code: 'module.exports = { create(context) {} };',
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'FunctionExpression',
          suggestions: [],
          column: 26,
          endColumn: 38,
          endLine: 1,
          line: 1,
        },
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
          meta: { docs: {} },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'Property',
          column: 19,
          endColumn: 27,
          endLine: 3,
          line: 3,
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
          column: 40,
          endColumn: 49,
          endLine: 3,
          line: 3,
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
          column: 40,
          endColumn: 48,
          endLine: 3,
          line: 3,
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
          column: 29,
          endColumn: 51,
          endLine: 3,
          line: 3,
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
        {
          messageId: 'missing',
          type: 'FunctionExpression',
          column: 26,
          endColumn: 38,
          endLine: 1,
          line: 1,
          suggestions: [],
        },
      ],
      name: 'missing recommended (allowNonBoolean: true)',
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
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
          suggestions: [],
        },
      ],
    },
  ],
});
