import type { Rule } from 'eslint';

import { evaluateObjectProperties, getKeyName, getTestInfo } from '../utils.ts';
import type { TestInfo } from '../types.ts';

type TestCaseData = {
  node: NonNullable<TestInfo['valid'][number]>;
  isObject: boolean;
  hasName: boolean;
  hasConfig: boolean;
};

const violationFilters = {
  always: (testCase: TestCaseData) => !testCase.hasName,
  objects: (testCase: TestCaseData) => testCase.isObject && !testCase.hasName,
  'objects-with-config': (testCase: TestCaseData) =>
    testCase.isObject && testCase.hasConfig && !testCase.hasName,
} satisfies Record<Options['require'], (testCase: TestCaseData) => boolean>;

const violationMessages = {
  always: 'nameRequiredAlways',
  objects: 'nameRequiredObjects',
  'objects-with-config': 'nameRequiredObjectsWithConfig',
} satisfies Record<Options['require'], string>;

type Options = {
  require: 'always' | 'objects' | 'objects-with-config';
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'require test cases to have a `name` property under certain conditions',
      category: 'Tests',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-test-case-name.md',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          require: {
            description:
              'When should the name property be required on a test case object.',
            enum: ['always', 'objects', 'objects-with-config'],
          },
        },
        type: 'object',
      },
    ],
    defaultOptions: [{ require: 'objects-with-config' }],
    messages: {
      nameRequiredAlways:
        'This test case is missing the `name` property.  All test cases should have a name property.',
      nameRequiredObjects:
        'This test case is missing the `name` property.  Test cases defined as objects should have a name property.',
      nameRequiredObjectsWithConfig:
        'This test case is missing the `name` property.  Test cases defined as objects with additional configuration should have a name property.',
    },
  },

  create(context) {
    const { require: requireOption = 'objects-with-config' }: Options =
      context.options[0] || {};
    const sourceCode = context.sourceCode;

    /**
     * Validates test cases and reports them if found in violation
     * @param cases A list of test case nodes
     */
    function validateTestCases(cases: TestInfo['valid']): void {
      // Gather all of the information from each test case
      const testCaseData: TestCaseData[] = cases
        .filter((testCase) => !!testCase)
        .map((testCase) => {
          if (
            testCase.type === 'Literal' ||
            testCase.type === 'TemplateLiteral'
          ) {
            return {
              node: testCase,
              isObject: false,
              hasName: false,
              hasConfig: false,
            };
          }
          if (testCase.type === 'ObjectExpression') {
            let hasName = false;
            let hasConfig = false;

            // evaluateObjectProperties is used here to expand spread elements
            for (const property of evaluateObjectProperties(
              testCase,
              sourceCode.scopeManager,
            )) {
              if (property.type === 'Property') {
                const keyName = getKeyName(
                  property,
                  sourceCode.getScope(testCase),
                );
                if (keyName === 'name') {
                  hasName = true;
                } else if (keyName === 'options' || keyName === 'settings') {
                  hasConfig = true;
                }
              }
            }

            return {
              node: testCase,
              isObject: true,
              hasName,
              hasConfig,
            };
          }
          return null;
        })
        .filter((testCase) => !!testCase);

      const violations = testCaseData.filter(violationFilters[requireOption]);
      for (const violation of violations) {
        context.report({
          node: violation.node,
          messageId: violationMessages[requireOption],
        });
      }
    }

    return {
      Program(ast) {
        getTestInfo(context, ast)
          .map((testRun) => [...testRun.valid, ...testRun.invalid])
          .forEach(validateTestCases);
      },
    };
  },
};

export default rule;
