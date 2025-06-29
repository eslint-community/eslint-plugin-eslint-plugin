/**
 * @fileoverview Disallow unnecessary calls to `sourceCode.getFirstToken()` and `sourceCode.getLastToken()`
 * @author Teddy Katz
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/no-useless-token-range.js';
import { RuleTester } from 'eslint';

/**
 * Wraps a code sample as an eslint rule
 * @param {string} code source text given a `sourceCode` variable
 * @returns {string} rule code containing that source text
 */
function wrapRule(code) {
  return `
    module.exports = {
      create(context) {
        const sourceCode = context.getSourceCode();
        ${code}
      }
    };
  `;
}

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const INVALID_CASES = [
  {
    code: 'sourceCode.getFirstToken(foo).range[0]',
    output: 'foo.range[0]',
    errors: [
      { message: "Use 'foo.range[0]' instead.", type: 'CallExpression' },
    ],
  },
  {
    code: 'sourceCode.getFirstToken(foo).start',
    output: 'foo.start',
    errors: [{ message: "Use 'foo.start' instead.", type: 'CallExpression' }],
  },
  {
    code: 'sourceCode.getLastToken(foo).range[1]',
    output: 'foo.range[1]',
    errors: [
      { message: "Use 'foo.range[1]' instead.", type: 'CallExpression' },
    ],
  },
  {
    code: 'sourceCode.getLastToken(foo).end',
    output: 'foo.end',
    errors: [{ message: "Use 'foo.end' instead.", type: 'CallExpression' }],
  },
  {
    code: 'sourceCode.getFirstToken(foo, { includeComments: true }).range[0]',
    output: 'foo.range[0]',
    errors: [
      { message: "Use 'foo.range[0]' instead.", type: 'CallExpression' },
    ],
  },
  {
    code: 'sourceCode.getLastToken(foo, { includeComments: true }).range[1]',
    output: 'foo.range[1]',
    errors: [
      { message: "Use 'foo.range[1]' instead.", type: 'CallExpression' },
    ],
  },
].map((invalidCase) =>
  Object.assign(invalidCase, {
    code: wrapRule(invalidCase.code),
    output: wrapRule(invalidCase.output),
  }),
);

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('no-useless-token-range', rule, {
  valid: [
    ...[
      'sourceCode.getLastToken(foo).range[0]',
      'sourceCode.getFirstToken(foo).range[1]',
      'sourceCode.getLastToken(foo).start',
      'sourceCode.getFirstToken(foo).end',
      'sourceCode.getSomethingElse(foo).range[0]',
      'notSourceCode.getFirstToken(foo).range[0]',
      'sourceCode.getFirstToken(foo, bar).range[0]',
      'sourceCode.getFirstToken(foo, { skip: 1 }).start',
      'sourceCode.getLastToken(foo, bar).range[1]',
      'sourceCode.getLastToken(foo, { skip: 1 }).end',
    ].map(wrapRule),
    'module.exports = {};', // Not a rule.
  ],

  invalid: [
    ...INVALID_CASES,
    {
      // `create` as variable.
      code: `
        function create(context) {
          const sourceCode = context.getSourceCode();
          sourceCode.getFirstToken(foo).range[0]
        }
        module.exports = { create };
      `,
      output: `
        function create(context) {
          const sourceCode = context.getSourceCode();
          foo.range[0]
        }
        module.exports = { create };
      `,
      errors: [
        { message: "Use 'foo.range[0]' instead.", type: 'CallExpression' },
      ],
    },
  ],
});
