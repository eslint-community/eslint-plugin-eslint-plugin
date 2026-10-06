import type { Rule } from 'eslint';

import { evaluateObjectProperties, getKeyName, getTestInfo } from '../utils.ts';
import type { TestInfo } from '../types.ts';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce that all test cases with names have unique names',
      category: 'Tests',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/unique-test-case-names.md',
    },
    schema: [],
    messages: {
      notUnique:
        'This test case name is not unique.  All test cases with names should have unique names.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;

    /**
     * Validates test cases and reports them if found in violation
     * @param cases A list of test case nodes
     */
    function validateTestCases(cases: TestInfo['valid']): void {
      // Gather all of the information from each test case
      const namesSeen = new Set<string>();
      const violatingNodes: NonNullable<TestInfo['valid'][number]>[] = [];

      cases
        .filter((testCase) => !!testCase)
        .forEach((testCase) => {
          if (testCase.type === 'ObjectExpression') {
            for (const property of evaluateObjectProperties(
              testCase,
              sourceCode.scopeManager,
            )) {
              if (property.type === 'Property') {
                const keyName = getKeyName(
                  property,
                  sourceCode.getScope(testCase),
                );
                if (
                  keyName === 'name' &&
                  property.value.type === 'Literal' &&
                  typeof property.value.value === 'string'
                ) {
                  const name = property.value.value;
                  if (namesSeen.has(name)) {
                    violatingNodes.push(property.value);
                  } else {
                    namesSeen.add(name);
                  }
                  break;
                }
              }
            }
          }
        });

      for (const node of violatingNodes) {
        context.report({
          node,
          messageId: 'notUnique',
        });
      }
    }

    return {
      Program(ast) {
        getTestInfo(context, ast).forEach((testInfo) => {
          validateTestCases(testInfo.valid);
          validateTestCases(testInfo.invalid);
        });
      },
    };
  },
};

export default rule;
