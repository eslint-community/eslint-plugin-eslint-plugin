/**
 * @fileoverview require rules to implement a `meta.type` property
 * @author 唯然<weiran.zsd@outlook.com>
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/require-meta-type.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('require-meta-type', rule, {
  valid: [
    `
      module.exports = {
        meta: { type: 'problem' },
        create(context) {}
      };
    `,
    {
      // ESM
      code: `
        export default {
          meta: { type: 'problem' },
          create(context) {}
        };
      `,
      languageOptions: { sourceType: 'module' },
    },
    `
      module.exports = {
        meta: { type: 'suggestion' },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { type: 'layout' },
        create(context) {}
      };
    `,
    `
      const type = 'problem';
      module.exports = {
        meta: { type },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { type: getType() },
        create(context) {}
      };
    `,
    `
      module.exports = {
        meta: { type: FOO },
        create(context) {}
      };
    `,
    // Spread.
    `
      const extra = { type: 'problem' };
      module.exports = {
        meta: { ...extra },
        create(context) {}
      };
    `,
    // Unresolved spread may contain `type`.
    `
      const baseRule = require('./base-rule');
      module.exports = {
        meta: { ...baseRule.meta },
        create(context) {}
      };
    `,
    'module.exports = {};', // No rule.
    // No `create` function.
    `
        const create = {};
        module.exports = {
          meta: {},
          create,
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
      // `meta` in variable, missing `type`.
      code: 'const meta = {}; module.exports = { meta, create(context) {} };',
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 14,
          endColumn: 16,
          endLine: 1,
          line: 1,
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
        function create(context) {}
        module.exports = {
          meta: {},
          create,
        };
      `,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      code: `
        const create = function(context) {};
        module.exports = {
          meta: {},
          create,
        };
      `,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      code: `
        const create = (context) => {};
        module.exports = {
          meta: {},
          create,
        };
      `,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { type: 'invalid-type' },
          create(context) {}
        };
      `,
      errors: [
        {
          messageId: 'unexpected',
          type: 'Literal',
          column: 25,
          endColumn: 39,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        const type = 'invalid-type';
        module.exports = {
          meta: { type },
          create(context) {}
        };
      `,
      errors: [
        {
          messageId: 'unexpected',
          type: 'Identifier',
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
          meta: { type: null },
          create(context) {}
        };
      `,
      errors: [
        {
          messageId: 'unexpected',
          type: 'Literal',
          column: 25,
          endColumn: 29,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { type: undefined },
          create(context) {}
        };
      `,
      errors: [
        {
          messageId: 'unexpected',
          type: 'Identifier',
          column: 25,
          endColumn: 34,
          endLine: 3,
          line: 3,
        },
      ],
    },
  ],
});
