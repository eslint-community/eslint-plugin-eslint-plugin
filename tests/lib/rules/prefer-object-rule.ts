/**
 * @author Brad Zacher <https://github.com/bradzacher>
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/prefer-object-rule.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('prefer-object-rule', rule, {
  valid: [
    `
      module.exports = {
        create(context) {
          return { Program() { context.report() } };
        },
      };
    `,
    `
      module.exports = {
        create: (context) => {
          return { Program() { context.report() } };
        },
      };
    `,
    `
      module.exports.create = (context) => {
        return { Program() { context.report() } };
      };
    `,
    `
      module.exports.create = function (context) {
        return { Program() { context.report() } };
      };
    `,
    `
      module.exports.create = function create(context) {
        return { Program() { context.report() } };
      };
    `,
    `
      function create(context) {
        return { Program() { context.report() } };
      };
      module.exports.create = create;
    `,
    `
      const rule = {
        create(context) {
          return { Program() { context.report() } };
        },
      };
      module.exports = rule;
    `,
    // `create` as variable.
    `
      function create(context) {
        return { Program() { context.report() } };
      };
      module.exports = { create };
  `,
    {
      // ESM
      code: `
        export default {
          create(context) {
            return { Program() { context.report() } };
          },
        };
      `,
      languageOptions: { sourceType: 'module' },
    },
    'module.exports = {};', // No rule.
  ],

  invalid: [
    {
      code: `
        module.exports = function (context) {
          return { Program() { context.report() } };
        };
      `,
      output: `
        module.exports = {create(context) {
          return { Program() { context.report() } };
        }};
      `,
      errors: [
        {
          messageId: 'preferObject',
          line: 2,
          column: 26,
          endColumn: 10,
          endLine: 4,
        },
      ],
    },
    {
      code: `
        module.exports = function create(context) {
          return { Program() { context.report() } };
        };
      `,
      output: `
        module.exports = {create(context) {
          return { Program() { context.report() } };
        }};
      `,
      errors: [
        {
          messageId: 'preferObject',
          line: 2,
          column: 26,
          endColumn: 10,
          endLine: 4,
        },
      ],
    },
    {
      code: `
        module.exports = (context) => {
          return { Program() { context.report() } };
        };
      `,
      output: `
        module.exports = {create: (context) => {
          return { Program() { context.report() } };
        }};
      `,
      errors: [
        {
          messageId: 'preferObject',
          line: 2,
          column: 26,
          endColumn: 10,
          endLine: 4,
        },
      ],
    },
    {
      code: 'const rule = (context) => { return {}; }; module.exports = rule;',
      output:
        'const rule = {create: (context) => { return {}; }}; module.exports = rule;',
      errors: [
        {
          messageId: 'preferObject',
          line: 1,
          column: 14,
          endColumn: 41,
          endLine: 1,
        },
      ],
    },

    // ESM
    {
      code: `
        export default function (context) {
          return { Program() { context.report() } };
        };
      `,
      output: `
        export default {create(context) {
          return { Program() { context.report() } };
        }};
      `,
      languageOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'preferObject',
          line: 2,
          column: 24,
          endColumn: 10,
          endLine: 4,
        },
      ],
    },
    {
      code: 'export default function create(context) { return {}; };',
      output: 'export default {create(context) { return {}; }};',
      languageOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'preferObject',
          line: 1,
          column: 16,
          endColumn: 55,
          endLine: 1,
        },
      ],
    },
    {
      code: 'export default (context) => { return {}; };',
      output: 'export default {create: (context) => { return {}; }};',
      languageOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'preferObject',
          line: 1,
          column: 16,
          endColumn: 43,
          endLine: 1,
        },
      ],
    },
    {
      code: 'const rule = (context) => { return {}; }; export default rule;',
      output:
        'const rule = {create: (context) => { return {}; }}; export default rule;',
      languageOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'preferObject',
          line: 1,
          column: 14,
          endColumn: 41,
          endLine: 1,
        },
      ],
    },

    {
      code: "module.exports = function (context) { return {}; };\nmodule.exports.schema = [{ type: 'object' }];\nmodule.exports.deprecated = true;",
      output:
        "module.exports = {meta: {schema: [{ type: 'object' }], deprecated: true}, create(context) { return {}; }};\n\n",
      errors: [
        {
          messageId: 'preferObject',
          line: 1,
          column: 18,
          endLine: 1,
          endColumn: 51,
        },
      ],
    },
    {
      code: 'module.exports = (context) => { return {}; };\nmodule.exports.schema = [];',
      output:
        'module.exports = {meta: {schema: []}, create: (context) => { return {}; }};\n',
      errors: [
        {
          messageId: 'preferObject',
          line: 1,
          column: 18,
          endLine: 1,
          endColumn: 45,
        },
      ],
    },
    {
      code: 'module.exports = function (context) { return {}; };\nexports.deprecated = true;',
      output:
        'module.exports = {create(context) { return {}; }};\nexports.deprecated = true;',
      errors: [
        {
          messageId: 'preferObject',
          line: 1,
          column: 18,
          endLine: 1,
          endColumn: 51,
        },
      ],
    },

    {
      code: "module.exports = function (context) { return {}; };\nmodule.exports.fixable = 'code';\nmodule.exports['schema'] = [];",
      output:
        "module.exports = {create(context) { return {}; }};\nmodule.exports.fixable = 'code';\nmodule.exports['schema'] = [];",
      errors: [
        {
          messageId: 'preferObject',
          line: 1,
          column: 18,
          endLine: 1,
          endColumn: 51,
        },
      ],
    },
    {
      code: 'module.exports = function (context) { return {}; };\ndoSomething();',
      output:
        'module.exports = {create(context) { return {}; }};\ndoSomething();',
      errors: [
        {
          messageId: 'preferObject',
          line: 1,
          column: 18,
          endLine: 1,
          endColumn: 51,
        },
      ],
    },
    {
      code: 'module.exports = function (context) { return {}; };\nmodule.exports.schema = [1];\nmodule.exports.meta = {};',
      output:
        'module.exports = {create(context) { return {}; }};\nmodule.exports.schema = [1];\nmodule.exports.meta = {};',
      errors: [
        {
          messageId: 'preferObject',
          line: 1,
          column: 18,
          endLine: 1,
          endColumn: 51,
        },
      ],
    },
    {
      code: 'module.exports = function (context) { return {}; };\nmodule.exports.schema = [1];\nmodule.exports.schema = [2];',
      output:
        'module.exports = {meta: {schema: [2]}, create(context) { return {}; }};\n\n',
      errors: [
        {
          messageId: 'preferObject',
          line: 1,
          column: 18,
          endLine: 1,
          endColumn: 51,
        },
      ],
    },
    {
      code: 'module.exports.schema = [1];\nmodule.exports = function (context) { return {}; };',
      output:
        'module.exports.schema = [1];\nmodule.exports = {create(context) { return {}; }};',
      errors: [
        {
          messageId: 'preferObject',
          line: 2,
          column: 18,
          endLine: 2,
          endColumn: 51,
        },
      ],
    },
  ],
});
