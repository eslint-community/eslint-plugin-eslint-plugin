/**
 * @fileoverview Enforce consistent use of `output` assertions in rule tests
 * @author Teddy Katz
 */

'use strict';

const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce consistent use of `output` assertions in rule tests',
      category: 'Tests',
      recommended: true,
      url: 'https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/consistent-output.md',
    },
    fixable: null, // or "code" or "whitespace"
    schema: [
      {
        type: 'string',
        enum: ['always', 'consistent'],
      },
    ],
    messages: {
      missingOutput: 'This test case should have an output assertion.',
    },
  },

  create (context) {
    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------
    const always = context.options[0] && context.options[0] === 'always';

    return {
      Program (ast) {
        utils.getTestInfo(context, ast).forEach(testRun => {
          const readableCases = testRun.invalid.filter(testCase => testCase.type === 'ObjectExpression');
          const casesWithoutOutput = readableCases
            .filter(testCase => !testCase.properties.map(utils.getKeyName).includes('output'));

          if (
            (casesWithoutOutput.length < readableCases.length) ||
            (always && casesWithoutOutput.length > 0)
          ) {
            casesWithoutOutput.forEach(testCase => {
              context.report({
                node: testCase,
                messageId: 'missingOutput',
              });
            });
          }
        });
      },
    };
  },
};
