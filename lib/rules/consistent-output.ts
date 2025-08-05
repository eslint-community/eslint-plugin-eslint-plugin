/**
 * @fileoverview Enforce consistent use of `output` assertions in rule tests
 * @author Teddy Katz
 */
import type { Rule } from 'eslint';

import { getKeyName, getTestInfo } from '../utils.ts';

const keyNameMapper = (property: Parameters<typeof getKeyName>[0]) =>
  getKeyName(property);

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'enforce consistent use of `output` assertions in rule tests',
      category: 'Tests',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/consistent-output.md',
    },
    fixable: undefined, // or "code" or "whitespace"
    schema: [
      {
        type: 'string',
        description:
          "Whether to enforce having output assertions 'always' or to be 'consistent' when some cases have them.",
        enum: ['always', 'consistent'],
        default: 'consistent',
      },
    ],
    defaultOptions: ['consistent'],
    messages: {
      missingOutput: 'This test case should have an output assertion.',
    },
  },

  create(context) {
    const always: boolean =
      context.options[0] && context.options[0] === 'always';

    return {
      Program(ast) {
        getTestInfo(context, ast).forEach((testRun) => {
          const readableCases = testRun.invalid.filter(
            (testCase) => testCase?.type === 'ObjectExpression',
          );
          const casesWithoutOutput = readableCases.filter(
            (testCase) =>
              !testCase.properties.map(keyNameMapper).includes('output'),
          );

          if (
            casesWithoutOutput.length < readableCases.length ||
            (always && casesWithoutOutput.length > 0)
          ) {
            casesWithoutOutput.forEach((testCase) => {
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

export default rule;
