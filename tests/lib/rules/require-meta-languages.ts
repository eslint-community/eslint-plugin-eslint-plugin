/**
 * @fileoverview require rules to implement a `meta.languages` property
 * @author morgan-coded
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/require-meta-languages.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('require-meta-languages', rule, {
  valid: [
    "module.exports = { meta: { languages: ['js/js'] }, create(context) {} };",
    {
      // ESM
      code: `
        export default {
          meta: { languages: ['js/js'] },
          create(context) {}
        };
      `,
      languageOptions: { sourceType: 'module' },
    },
    "module.exports = { meta: { languages: ['js/js', 'json/json'] }, create(context) {} };",
    'module.exports = { meta: { languages: someVar }, create(context) {} };',
    `
      const extra = { languages: ['js/js'] };
      module.exports = {
        meta: { ...extra },
        create(context) {}
      };
    `,
    `
      const langs = ['js/js'];
      module.exports = {
        meta: { languages: langs },
        create(context) {}
      };
    `,
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
          meta: { languages: ['js/js'] },
          create,
        };
      `,
  ],

  invalid: [
    {
      code: `
        module.exports = {
          meta: { type: 'problem' },
          create(context) {}
        };
      `,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 36,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
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
      // `meta` in variable, missing `languages`.
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
      code: 'module.exports = { meta: { languages: [] }, create(context) {} };',
      errors: [
        {
          messageId: 'empty',
          type: 'ArrayExpression',
          column: 39,
          endColumn: 41,
          endLine: 1,
          line: 1,
        },
      ],
    },
    {
      code: "module.exports = { meta: { languages: 'js/js' }, create(context) {} };",
      errors: [
        {
          messageId: 'invalid',
          type: 'Literal',
          column: 39,
          endColumn: 46,
          endLine: 1,
          line: 1,
        },
      ],
    },
    {
      code: "module.exports = { meta: { languages: ['js/js', 123] }, create(context) {} };",
      errors: [
        {
          messageId: 'invalid',
          type: 'ArrayExpression',
          column: 39,
          endColumn: 53,
          endLine: 1,
          line: 1,
        },
      ],
    },
    {
      code: `
        const langs = 'js/js';
        module.exports = {
          meta: { languages: langs },
          create(context) {}
        };
      `,
      errors: [
        {
          messageId: 'invalid',
          type: 'Identifier',
          column: 30,
          endColumn: 35,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { languages: null },
          create(context) {}
        };
      `,
      errors: [
        {
          messageId: 'invalid',
          type: 'Literal',
          column: 30,
          endColumn: 34,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: { languages: undefined },
          create(context) {}
        };
      `,
      errors: [
        {
          messageId: 'invalid',
          type: 'Identifier',
          column: 30,
          endColumn: 39,
          endLine: 3,
          line: 3,
        },
      ],
    },
  ],
});
