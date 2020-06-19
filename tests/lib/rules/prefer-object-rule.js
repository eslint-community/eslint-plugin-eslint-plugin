/**
 * @author Brad Zacher <https://github.com/bradzacher>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/prefer-object-rule');
const RuleTester = require('eslint').RuleTester;

const ERROR = { messageId: 'preferObject', line: 2, column: 26 };

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
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
      errors: [ERROR],
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
      errors: [ERROR],
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
      errors: [ERROR],
    },
  ],
});
