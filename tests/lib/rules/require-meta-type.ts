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
    // `type` is provided through an inline object spread.
    `
      module.exports = {
        meta: { ...{ type: 'problem' } },
        create(context) {}
      };
    `,
    // `type` may be inherited through a variable that itself spreads an unresolvable value.
    `
      const baseRule = require('./base-rule');
      const inheritedMeta = { ...baseRule.meta };
      module.exports = {
        meta: { ...inheritedMeta },
        create(context) {}
      };
    `,
    // A later inline-spread value overrides an earlier direct property (last write wins).
    `
      module.exports = {
        meta: { type: 'invalid', ...{ type: 'problem' } },
        create(context) {}
      };
    `,
    // A repeated resolved spread after an override supplies the effective value.
    `
      const extra = { type: 'problem' };
      module.exports = {
        meta: { ...extra, type: 'invalid', ...extra },
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
      // Inline empty spread is statically known and cannot provide `type`.
      code: `
        module.exports = {
          meta: { ...{} },
          create(context) {}
        };
      `,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 26,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      // Spread of a statically-known non-object cannot provide `type`.
      code: `
        const num = 5;
        module.exports = {
          meta: { ...num },
          create(context) {}
        };
      `,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 27,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      // A later direct property overrides an earlier inline-spread value (last write wins),
      // so the effective (invalid) `type` is what gets reported.
      code: `
        module.exports = {
          meta: { ...{ type: 'problem' }, type: 'invalid' },
          create(context) {}
        };
      `,
      errors: [
        {
          messageId: 'unexpected',
          type: 'Literal',
          column: 49,
          endColumn: 58,
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
