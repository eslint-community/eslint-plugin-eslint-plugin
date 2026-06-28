// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/require-meta-schema.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('require-meta-schema', rule, {
  valid: [
    `
      module.exports = {
        meta: { schema: [] },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { schema: [ { "enum": ["always", "never"] } ] },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { schema: { "enum": ["always", "never"] } },
        create(context) {}
      };
    `,
    // Schema with options and using `context.options`.
    `
      module.exports = {
        meta: { schema: { "enum": ["always", "never"] } },
        create(context) { const options = context.options; }
      };
    `,
    // Empty schema, using arbitrary property of `context`.
    `
      module.exports = {
        meta: { schema: [] },
        create(context) { const foo = context.foo; }
      };
    `,
    // Empty schema, using arbitrary `options` property.
    `
      module.exports = {
        meta: { schema: [] },
        create(context) { const options = foo.options; }
      };
    `,
    {
      // ESM
      code: `
        export default {
          meta: { schema: { "enum": ["always", "never"] } },
          create(context) { const options = context.options; }
        };
      `,
      languageOptions: { sourceType: 'module' },
    },
    // Variable schema with array value.
    `
      const schema = [];
      module.exports = {
        meta: { schema },
        create(context) {}
      };
    `,
    // Variable schema with object value.
    `
      const foo = {};
      module.exports = {
        meta: { schema: foo },
        create(context) {}
      };
    `,
    // Variable schema with no static value.
    `
      module.exports = {
        meta: { schema },
        create(context) {}
      };
    `,
    // Variable schema pointing to unknown variable chain.
    `
      module.exports = {
        meta: { schema: baseRule.meta.schema },
        create(context) {}
      };
    `,
    // Schema with function call as value.
    `
      module.exports = {
        meta: { schema: getSchema() },
        create(context) {}
      };
    `,
    // Schema with ternary (conditional) expression.
    `
      module.exports = {
        meta: { schema: foo ? [] : {} },
        create(context) {}
      };
    `,
    // Schema with logical expression.
    `
      module.exports = {
        meta: { schema: foo || {} },
        create(context) {}
      };
    `,
    `
      let schema;
      schema = foo ? [] : {};
      module.exports = {
        meta: { schema },
        create(context) {}
      };
    `,
    `
      const schema = [],
            created = (context) => {};
      module.exports = {
        meta: { schema },
        create
      };
    `,

    {
      // requireSchemaPropertyWhenOptionless = false
      code: `
        module.exports = {
          meta: {},
          create(context) {}
        };
      `,
      options: [{ requireSchemaPropertyWhenOptionless: false }],
      name: 'no schema (requireSchemaPropertyWhenOptionless: false)',
    },
    {
      // requireSchemaPropertyWhenOptionless = false, no `meta`.
      code: 'module.exports = { create(context) {} };',
      options: [{ requireSchemaPropertyWhenOptionless: false }],
      name: 'no meta (requireSchemaPropertyWhenOptionless: false)',
    },
    // Spread.
    `
      const extra = { schema: [] };
      module.exports = {
        meta: { ...extra },
        create(context) {}
      };
    `,
    // Unresolved spread may contain `schema`.
    `
      const baseRule = require('./base-rule');
      module.exports = {
        meta: { ...baseRule.meta },
        create(context) {}
      };
    `,
    'module.exports = {};', // No rule.
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
          suggestions: [
            {
              messageId: 'addEmptySchema',
              output: `
        module.exports = {
          meta: {
schema: []
},
          create(context) {}
        };
      `,
            },
          ],
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
          suggestions: [],
          column: 26,
          endColumn: 38,
          endLine: 1,
          line: 1,
        },
      ],
    },
    {
      // No `meta`, uses `context.options`. Two violations on `create`.
      code: 'module.exports = { create(context) { const options = context.options; } };',
      output: null,
      errors: [
        {
          messageId: 'foundOptionsUsage',
          type: 'FunctionExpression',
          suggestions: [],
          column: 26,
          endColumn: 72,
          endLine: 1,
          line: 1,
        },
        {
          messageId: 'missing',
          type: 'FunctionExpression',
          suggestions: [],
          column: 26,
          endColumn: 72,
          endLine: 1,
          line: 1,
        },
      ],
    },
    {
      // requireSchemaPropertyWhenOptionless = true.
      code: `
        module.exports = {
          meta: {},
          create(context) {}
        };
      `,
      output: null,
      options: [{ requireSchemaPropertyWhenOptionless: true }],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
          suggestions: [
            {
              messageId: 'addEmptySchema',
              output: `
        module.exports = {
          meta: {
schema: []
},
          create(context) {}
        };
      `,
            },
          ],
        },
      ],
      name: 'no schema (requireSchemaPropertyWhenOptionless: true)',
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
          suggestions: [
            {
              messageId: 'addEmptySchema',
              output: `
        export default {
          meta: {
schema: []
},
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
          meta: { type: 'problem' },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 36,
          endLine: 3,
          line: 3,
          suggestions: [
            {
              messageId: 'addEmptySchema',
              output: `
        module.exports = {
          meta: { type: 'problem',
schema: [] },
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
          meta: { schema: null },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'Literal',
          suggestions: [],
          column: 27,
          endColumn: 31,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      // requireSchemaPropertyWhenOptionless = false.
      code: `
        module.exports = {
          meta: { schema: null },
          create(context) {}
        };
      `,
      output: null,
      options: [{ requireSchemaPropertyWhenOptionless: false }],
      errors: [
        {
          messageId: 'wrongType',
          type: 'Literal',
          suggestions: [],
          column: 27,
          endColumn: 31,
          endLine: 3,
          line: 3,
        },
      ],
      name: 'schema is null (requireSchemaPropertyWhenOptionless: false)',
    },
    {
      code: `
        module.exports = {
          meta: { schema: undefined },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'Identifier',
          suggestions: [],
          column: 27,
          endColumn: 36,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      // Schema with number literal value.
      code: `
        module.exports = {
          meta: { schema: 123 },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'Literal',
          suggestions: [],
          column: 27,
          endColumn: 30,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      // Schema with string literal value.
      code: `
        module.exports = {
          meta: { schema: 'hello world' },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'Literal',
          suggestions: [],
          column: 27,
          endColumn: 40,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        const schema = null;
        module.exports = {
          meta: { schema },
          create(context) {}
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'Literal',
          suggestions: [],
          column: 24,
          endColumn: 28,
          endLine: 2,
          line: 2,
        },
      ],
    },
    {
      // Empty schema (array), but using rule options.
      code: `
        module.exports = {
          meta: { schema: [] },
          create(context) { const options = context.options; }
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'foundOptionsUsage',
          type: 'Property',
          suggestions: [],
          column: 19,
          endColumn: 29,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      // Empty schema (object), but using rule options.
      code: `
        module.exports = {
          meta: { schema: {} },
          create(context) { const options = context.options; }
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'foundOptionsUsage',
          type: 'Property',
          suggestions: [],
          column: 19,
          endColumn: 29,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      // Empty schema (object), but using rule options, requireSchemaPropertyWhenOptionless = false.
      code: `
        module.exports = {
          meta: { schema: {} },
          create(context) { const options = context.options; }
        };
      `,
      output: null,
      options: [{ requireSchemaPropertyWhenOptionless: false }],
      errors: [
        {
          messageId: 'foundOptionsUsage',
          type: 'Property',
          suggestions: [],
          column: 19,
          endColumn: 29,
          endLine: 3,
          line: 3,
        },
      ],
      name: 'empty schema (requireSchemaPropertyWhenOptionless: false)',
    },
    {
      // No schema, but using rule options, requireSchemaPropertyWhenOptionless = false.
      code: `
        module.exports = {
          meta: {},
          create(context) { const options = context.options; }
        };
      `,
      output: null,
      options: [{ requireSchemaPropertyWhenOptionless: false }],
      errors: [
        {
          messageId: 'foundOptionsUsage',
          type: 'ObjectExpression',
          suggestions: [],
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
        },
      ],
      name: 'no schema with rule options (requireSchemaPropertyWhenOptionless: false)',
    },
    {
      // No schema, but using rule options, should have no suggestions.
      code: `
        module.exports = {
          meta: {},
          create(context) { const options = context.options; }
        };
      `,
      output: null,
      errors: [
        {
          messageId: 'foundOptionsUsage',
          type: 'ObjectExpression',
          suggestions: [],
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
        },
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
      // `create` as variable.
      code: `
        const meta = {};
        const create = function create(context) { const options = context.options; }
        module.exports = { meta, create };
      `,
      output: null,
      errors: [
        {
          messageId: 'foundOptionsUsage',
          type: 'ObjectExpression',
          suggestions: [],
          column: 22,
          endColumn: 24,
          endLine: 2,
          line: 2,
        },
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          suggestions: [],
          column: 22,
          endColumn: 24,
          endLine: 2,
          line: 2,
        },
      ],
    },
    {
      // `rule`, `create`, and `meta` as variable.
      code: `
        const meta = {};
        const create = function create(context) { const options = context.options; }
        const rule = { meta, create };
        module.exports = rule;
      `,
      output: null,
      errors: [
        {
          messageId: 'foundOptionsUsage',
          type: 'ObjectExpression',
          suggestions: [],
          column: 22,
          endColumn: 24,
          endLine: 2,
          line: 2,
        },
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          suggestions: [],
          column: 22,
          endColumn: 24,
          endLine: 2,
          line: 2,
        },
      ],
    },
  ],
});
