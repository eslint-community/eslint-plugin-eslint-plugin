// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/require-meta-docs-description.ts';
import { RuleTester } from 'eslint';
import parser from '@typescript-eslint/parser';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('require-meta-docs-description', rule, {
  valid: [
    'foo()', // No rule.
    'module.exports = {};', // No rule.
    `
      module.exports = {
        meta: { docs: { description: 'Disallow unused variables' } },
        create(context) {}
      };
    `,
    {
      // ESM
      code: `
        export default {
          meta: { docs: { description: 'Disallow unused variables' } },
          create(context) {}
        };
      `,
      languageOptions: { sourceType: 'module' },
    },
    `
      module.exports = {
        meta: { docs: { description: 'Enforce a maximum line length' } },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { docs: { description: 'Require or disallow newline at the end of files' } },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { docs: { description: generateRestOfDescription() } },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { docs: { description: \`Enforce with template literal\` } },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { docs: { description: "Enforce" + " " + "something" } },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { docs: { description: "Enforce " + generateSomething() } },
        create(context) {}
      };
    `,
    `
      const DESCRIPTION = 'Require foo';
      module.exports = {
        meta: { docs: { description: DESCRIPTION } },
        create(context) {}
      };
    `,
    `
      const DESCRIPTION = generateDescription();
      module.exports = {
        meta: { docs: { description: DESCRIPTION } },
        create(context) {}
      };
    `,
    {
      code: `
          module.exports = {
            meta: { docs: { description: 'myPrefix foo bar' } },
            create(context) {}
          };
        `,
      options: [{ pattern: '^myPrefix' }],
      name: "custom pattern (pattern: '^myPrefix')",
    },
    {
      code: `
          module.exports = {
            meta: { docs: { description: 'random message' } },
            create(context) {}
          };
        `,
      options: [{ pattern: '.+' }], // any description allowed
      name: "custom pattern (pattern: '.+')",
    },
    // `meta` in variable, `description` present.
    `
      const meta = { docs: { description: 'Enforce foo' } };
      module.exports = {
        meta,
        create(context) {}
      };
    `,
    // Spread.
    `
      const extraDocs = { description: 'Enforce foo' };
      const extraMeta = { docs: { ...extraDocs } };
      module.exports = {
        meta: { ...extraMeta },
        create(context) {}
      };
    `,
  ],

  invalid: [
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
      // No `meta`. Violation on `create`.
      code: 'module.exports = { create(context) {} };',
      output: null,
      errors: [{ messageId: 'missing', type: 'FunctionExpression' }],
    },
    {
      // `meta` in variable, `description` mismatch.
      code: `
        const meta = { docs: { description: 'foo' } };
        module.exports = {
          meta,
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'mismatch', type: 'Literal' }],
    },
    {
      // ESM
      code: `
        export default {
          meta: {},
          create(context) {}
        };
      `,
      output: null,
      languageOptions: { sourceType: 'module' },
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
          meta: { docs: { description: [] } },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'wrongType', type: 'ArrayExpression' }],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: '' } },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'wrongType', type: 'Literal' }],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: null } },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'wrongType', type: 'Literal' }],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: undefined } },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'wrongType', type: 'Identifier' }],
    },
    {
      code: `
        const DESCRIPTION = true;
        module.exports = {
          meta: { docs: { description: DESCRIPTION } },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'wrongType', type: 'Identifier' }],
    },
    {
      code: `
        const DESCRIPTION = 123;
        module.exports = {
          meta: { docs: { description: DESCRIPTION } },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'wrongType', type: 'Identifier' }],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: 'Enforce something with trailing whitespace ' } },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'extraWhitespace', type: 'Literal' }],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: 'this rule does ...' } },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          message:
            '`meta.docs.description` must match the regexp /^(Enforce|Require|Disallow)/.',
          type: 'Literal',
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: 'foo' + ' ' + 'bar' } },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          message:
            '`meta.docs.description` must match the regexp /^(Enforce|Require|Disallow)/.',
          type: 'BinaryExpression',
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: 'this rule does ...' } },
          create(context) {}
        };
      `,
      output: null,
      options: [{ pattern: '^myPrefix' }],
      errors: [
        {
          message: '`meta.docs.description` must match the regexp /^myPrefix/.',
          type: 'Literal',
        },
      ],
      name: "custom pattern (pattern: '^myPrefix')",
    },
  ],
});

const ruleTesterTypeScript = new RuleTester({
  languageOptions: {
    sourceType: 'module',
    parser,
  },
});
ruleTesterTypeScript.run('require-meta-docs-description (TypeScript)', rule, {
  valid: [
    `
      export default createESLintRule<Options, MessageIds>({
        meta: { docs: { description: 'Disallow unused variables' } },
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
