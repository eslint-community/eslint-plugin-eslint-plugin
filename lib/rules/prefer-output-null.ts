/**
 * @fileoverview disallows invalid RuleTester test cases where the `output` matches the `code`
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

import type { Rule } from 'eslint';

import { getTestInfo, getTestInfoProperty } from '../utils.ts';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'disallow invalid RuleTester test cases where the `output` matches the `code`',
      category: 'Tests',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/prefer-output-null.md',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useOutputNull:
        'Use `output: null` to assert that a test case is not autofixed.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;

    return {
      Program(ast) {
        getTestInfo(context, ast).forEach((testRun) => {
          testRun.invalid
            .filter((test) => !!test)
            .forEach((test) => {
              const code = getTestInfoProperty(test, 'code');
              const output = getTestInfoProperty(test, 'output');

              if (
                output &&
                code &&
                sourceCode.getText(output.value) ===
                  sourceCode.getText(code.value)
              ) {
                context.report({
                  node: output,
                  messageId: 'useOutputNull',
                  fix: (fixer) => fixer.replaceText(output.value, 'null'),
                });
              }
            });
        });
      },
    };
  },
};

export default rule;
