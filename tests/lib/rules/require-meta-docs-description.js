'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/require-meta-docs-description');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('require-meta-docs-description', rule, {
  valid: [
    `
      module.exports = {
        meta: { docs: { description: 'disallow unused variables' } },
        create(context) {}
      };
    `,
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
    {
      code:
        `
          module.exports = {
            meta: { docs: { description: 'myPrefix foo bar' } },
            create(context) {}
          };
        `,
      options: [{ pattern: '^myPrefix' }],
    },
    {
      code:
        `
          module.exports = {
            meta: { docs: { description: 'random message' } },
            create(context) {}
          };
        `,
      options: [{ pattern: '.+' }], // any description allowed
    },
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
          meta: { docs: { description: \`enforce with template literal\` } },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'wrongType', type: 'TemplateLiteral' }],
    },
    {
      code: `
        module.exports = {
          meta: { docs: { description: SOME_DESCRIPTION } },
          create(context) {}
        };
      `,
      output: null,
      errors: [{ messageId: 'wrongType', type: 'Identifier' }],
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
      errors: [{ message: '`meta.docs.description` must match the regexp /^(enforce|require|disallow)/.', type: 'Literal' }],
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
      errors: [{ message: '`meta.docs.description` must match the regexp /^myPrefix/.', type: 'Literal' }],
    },
  ],
});
