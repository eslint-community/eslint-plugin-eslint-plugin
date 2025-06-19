/**
 * @fileoverview Enforce consistent usage of shorthand strings for test cases with no options
 * @author Teddy Katz
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/test-case-shorthand-strings');
const RuleTester = require('eslint').RuleTester;

/**
 * Returns the code for some valid test cases
 * @param {string[]} cases The code representation of valid test cases
 * @returns {string} Code representing the test cases
 */
function getTestCases(cases) {
  return `
    new RuleTester().run('foo', bar, {
      valid: [
        ${cases.join(',\n        ')},
      ],
      invalid: []
    });
  `;
}

const EXPECTED_SHORTHAND_ERROR = {
  message: 'Use a string for this test case instead of an object.',
  type: 'ObjectExpression',
};
const UNEXPECTED_SHORTHAND_ERROR = {
  message: 'Use an object for this test case instead of a string.',
};

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('test-case-shorthand-strings', rule, {
  valid: [
    // default (as-needed)
    getTestCases(['"foo"']),
    getTestCases(['"foo"', '"bar"']),
    getTestCases(['"foo"', '"bar"', '{ code: "foo", options: ["bar"] }']),
    getTestCases(['"foo"', '"bar"', '{ code: "foo", parserOptions: ["bar"] }']),
    getTestCases(['`foo`']),
    getTestCases(['tag`foo`']),

    // as-needed
    {
      code: getTestCases(['"foo"']),
      options: ['as-needed'],
    },
    {
      code: getTestCases(['"foo"', '"bar"']),
      options: ['as-needed'],
    },
    {
      code: getTestCases([
        '"foo"',
        '"bar"',
        '{ code: "foo", options: ["bar"] }',
      ]),
      options: ['as-needed'],
    },
    {
      code: getTestCases([
        '"foo"',
        '"bar"',
        '{ code: "foo", parserOptions: ["bar"] }',
      ]),
      options: ['as-needed'],
    },
    {
      code: getTestCases(['`foo`']),
      options: ['as-needed'],
    },
    {
      code: getTestCases(['tag`foo`']),
      options: ['as-needed'],
    },

    // never
    {
      code: getTestCases(['{ code: "foo" }', '{ code: "bar" }']),
      options: ['never'],
    },
    {
      code: getTestCases(['notAString', '{ code: "bar" }']),
      options: ['never'],
    },
    {
      code: getTestCases(['notAString()', '{ code: "bar" }']),
      options: ['never'],
    },

    // consistent
    {
      code: getTestCases(['"foo"', '"bar"']),
      options: ['consistent'],
    },
    {
      code: getTestCases(['{ code: "foo" }', '{ code: "bar" }']),
      options: ['consistent'],
    },
    {
      code: getTestCases([
        '{ code: "foo" }',
        '{ code: "bar", options: ["foo"] }',
      ]),
      options: ['consistent'],
    },
    {
      code: getTestCases(['"foo"', "'bar'", '`baz`']),
      options: ['consistent'],
    },

    // consistent-as-needed
    {
      code: getTestCases(['"foo"', '"bar"']),
      options: ['consistent-as-needed'],
    },
    {
      code: getTestCases([
        '{ code: "foo" }',
        '{ code: "bar", options: ["foo"] }',
      ]),
      options: ['consistent-as-needed'],
    },
    {
      code: getTestCases(['"foo"', "'bar'", '`baz`']),
      options: ['consistent-as-needed'],
    },
    `
    new NotRuleTester().run('foo', bar, {
      valid: [{ code: 'foo' }],
      invalid: []
    });`, // Not RuleTester.
    `
    new RuleTester().notRun('foo', bar, {
      valid: [{ code: 'foo' }],
      invalid: []
    });`, // Not run() from RuleTester.
  ],

  invalid: [
    // as-needed
    {
      code: getTestCases(['{ code: "foo" }']),
      output: getTestCases(['"foo"']),
      errors: [EXPECTED_SHORTHAND_ERROR],
    },
    {
      code: getTestCases(['{ code: `foo` }']),
      output: getTestCases(['`foo`']),
      errors: [EXPECTED_SHORTHAND_ERROR],
    },
    {
      code: getTestCases(['"foo"', '{ code: `foo` }']),
      output: getTestCases(['"foo"', '`foo`']),
      errors: [EXPECTED_SHORTHAND_ERROR],
    },
    {
      code: getTestCases(['"foo"', '{ code: "foo" }', '{ code: `bar` }']),
      output: getTestCases(['"foo"', '"foo"', '`bar`']),
      errors: [EXPECTED_SHORTHAND_ERROR, EXPECTED_SHORTHAND_ERROR],
    },

    // never
    {
      code: getTestCases(['"foo"']),
      output: getTestCases(['{code: "foo"}']),
      options: ['never'],
      errors: [UNEXPECTED_SHORTHAND_ERROR],
    },
    {
      code: getTestCases(['foo', '"bar"']),
      output: getTestCases(['foo', '{code: "bar"}']),
      options: ['never'],
      errors: [UNEXPECTED_SHORTHAND_ERROR],
    },
    {
      code: getTestCases(['`foo`']),
      output: getTestCases(['{code: `foo`}']),
      options: ['never'],
      errors: [UNEXPECTED_SHORTHAND_ERROR],
    },
    {
      code: getTestCases(['"foo"']) + getTestCases(['"foo"']),
      output: getTestCases(['{code: "foo"}']) + getTestCases(['{code: "foo"}']),
      options: ['never'],
      errors: [UNEXPECTED_SHORTHAND_ERROR, UNEXPECTED_SHORTHAND_ERROR],
    },

    // consistent
    {
      code: getTestCases(['"foo"', '{ code: "bar" }', '{ code: "baz" }']),
      output: getTestCases(['"foo"', '"bar"', '"baz"']),
      errors: [EXPECTED_SHORTHAND_ERROR, EXPECTED_SHORTHAND_ERROR],
    },
    {
      code: getTestCases(['{ code: "bar" }', '"foo"', '{ code: "baz" }']),
      output: getTestCases(['"bar"', '"foo"', '"baz"']),
      errors: [EXPECTED_SHORTHAND_ERROR, EXPECTED_SHORTHAND_ERROR],
    },

    // consistent-as-needed
    {
      code: getTestCases(['{ code: "foo" }', '{ code: "bar" }']),
      output: getTestCases(['"foo"', '"bar"']),
      options: ['consistent-as-needed'],
      errors: [EXPECTED_SHORTHAND_ERROR, EXPECTED_SHORTHAND_ERROR],
    },
    {
      code: getTestCases([
        '"foo"',
        '"bar"',
        '{ code: "baz", options: ["foo"] }',
      ]),
      output: getTestCases([
        '{code: "foo"}',
        '{code: "bar"}',
        '{ code: "baz", options: ["foo"] }',
      ]),
      options: ['consistent-as-needed'],
      errors: [UNEXPECTED_SHORTHAND_ERROR, UNEXPECTED_SHORTHAND_ERROR],
    },
    {
      code: getTestCases([
        '"foo"',
        '{ code: "baz", options: ["foo"] }',
        '"bar"',
      ]),
      output: getTestCases([
        '{code: "foo"}',
        '{ code: "baz", options: ["foo"] }',
        '{code: "bar"}',
      ]),
      options: ['consistent-as-needed'],
      errors: [UNEXPECTED_SHORTHAND_ERROR, UNEXPECTED_SHORTHAND_ERROR],
    },
  ],
});
