/**
 * @author Brad Zacher <https://github.com/bradzacher>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/prefer-object-rule');
const RuleTester = require('../eslint-rule-tester').RuleTester;

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
      errors: [{ messageId: 'preferObject', line: 2, column: 26 }],
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
      errors: [{ messageId: 'preferObject', line: 2, column: 26 }],
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
      errors: [{ messageId: 'preferObject', line: 2, column: 26 }],
    },
    {
      code: 'const rule = (context) => { return {}; }; module.exports = rule;',
      output:
        'const rule = {create: (context) => { return {}; }}; module.exports = rule;',
      errors: [{ messageId: 'preferObject', line: 1, column: 14 }],
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
      errors: [{ messageId: 'preferObject', line: 2, column: 24 }],
      languageOptions: { sourceType: 'module' },
    },
    {
      code: 'export default function create(context) { return {}; };',
      output: 'export default {create(context) { return {}; }};',
      errors: [{ messageId: 'preferObject', line: 1, column: 16 }],
      languageOptions: { sourceType: 'module' },
    },
    {
      code: 'export default (context) => { return {}; };',
      output: 'export default {create: (context) => { return {}; }};',
      errors: [{ messageId: 'preferObject', line: 1, column: 16 }],
      languageOptions: { sourceType: 'module' },
    },
    {
      code: 'const rule = (context) => { return {}; }; export default rule;',
      output:
        'const rule = {create: (context) => { return {}; }}; export default rule;',
      errors: [{ messageId: 'preferObject', line: 1, column: 14 }],
      languageOptions: { sourceType: 'module' },
    },
  ],
});
