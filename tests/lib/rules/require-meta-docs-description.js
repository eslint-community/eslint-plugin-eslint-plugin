'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/require-meta-docs-description');
const RuleTester = require('../eslint-rule-tester').RuleTester;

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
    },
    {
      code: `
          module.exports = {
            meta: { docs: { description: 'random message' } },
            create(context) {}
          };
        `,
      options: [{ pattern: '.+' }], // any description allowed
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
          meta: { docs: { description: 'enforce something with trailing whitespace ' } },
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
            '`meta.docs.description` must match the regexp /^(enforce|require|disallow)/.',
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
            '`meta.docs.description` must match the regexp /^(enforce|require|disallow)/.',
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
    },
  ],
});

const ruleTesterTypeScript = new RuleTester({
  languageOptions: {
    sourceType: 'module',
    parser: require('@typescript-eslint/parser'),
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
  ],
});
