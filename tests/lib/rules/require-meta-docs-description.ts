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
      const baseRule = require('./base-rule.js');
      module.exports = {
        meta: { docs: baseRule.meta.docs },
        create(context) {}
      };
    `,
    `
      const baseRule = require('./base-rule.js');
      module.exports = {
        meta: { docs: { ...baseRule.meta.docs } },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { docs: getDocs() },
        create(context) {}
      };
    `,
    `
      const docs = { description: 'disallow foo' };
      module.exports = {
        meta: { docs },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { docs: { description: 'disallow unused variables' } },
        create(context) {}
      };
    `,
    {
      // ESM
      code: `
        export default {
          meta: { docs: { description: 'disallow unused variables' } },
          create(context) {}
        };
      `,
      languageOptions: { sourceType: 'module' },
    },
    `
      module.exports = {
        meta: { docs: { description: 'enforce a maximum line length' } },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { docs: { description: 'require or disallow newline at the end of files' } },
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
        meta: { docs: { description: \`enforce with template literal\` } },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { docs: { description: "enforce" + " " + "something" } },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { docs: { description: "enforce " + generateSomething() } },
        create(context) {}
      };
    `,
    `
      const DESCRIPTION = 'require foo';
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
      const meta = { docs: { description: 'enforce foo' } };
      module.exports = {
        meta,
        create(context) {}
      };
    `,
    // Spread.
    `
      const extraDocs = { description: 'enforce foo' };
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
      // No `meta`. Violation on `create`.
      code: 'module.exports = { create(context) {} };',
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'FunctionExpression',
          column: 26,
          endColumn: 38,
          endLine: 1,
          line: 1,
        },
      ],
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
      errors: [
        {
          messageId: 'mismatch',
          type: 'Literal',
          column: 45,
          endColumn: 50,
          endLine: 2,
          line: 2,
        },
      ],
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
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { docs: undefined },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'Property',
          column: 19,
          endColumn: 34,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        const docs = {};
        module.exports = {
          meta: { docs },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'Property',
          column: 19,
          endColumn: 23,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: [] } },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'ArrayExpression',
          column: 40,
          endColumn: 42,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: '' } },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'Literal',
          column: 40,
          endColumn: 42,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: null } },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'Literal',
          column: 40,
          endColumn: 44,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: undefined } },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'Identifier',
          column: 40,
          endColumn: 49,
          endLine: 3,
          line: 3,
        },
      ],
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
      errors: [
        {
          messageId: 'wrongType',
          type: 'Identifier',
          column: 40,
          endColumn: 51,
          endLine: 4,
          line: 4,
        },
      ],
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
      errors: [
        {
          messageId: 'wrongType',
          type: 'Identifier',
          column: 40,
          endColumn: 51,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: 'enforce something with trailing whitespace ' } },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'extraWhitespace',
          type: 'Literal',
          column: 40,
          endColumn: 85,
          endLine: 3,
          line: 3,
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
      errors: [
        {
          message:
            '`meta.docs.description` must match the regexp /^(enforce|require|disallow)/.',
          type: 'Literal',
          column: 40,
          endColumn: 60,
          endLine: 3,
          line: 3,
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
            '`meta.docs.description` must match the regexp /^(enforce|require|disallow)/.',
          type: 'BinaryExpression',
          column: 40,
          endColumn: 59,
          endLine: 3,
          line: 3,
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
          column: 40,
          endColumn: 60,
          endLine: 3,
          line: 3,
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
        meta: { docs: { description: 'disallow unused variables' } },
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
        },
      ],
    },
  ],
});
