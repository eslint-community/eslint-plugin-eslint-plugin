/**
 * @fileoverview disallows invalid RuleTester test cases where the `output` matches the `code`
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

import { getTestInfo } from '../utils.js';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
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
    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    const sourceCode = context.sourceCode;

    return {
      Program(ast) {
        getTestInfo(context, ast).forEach((testRun) => {
          testRun.invalid.forEach((test) => {
            /**
             * Get a test case's giving keyname node.
             * @param {string} the keyname to find.
             * @returns {Node} found node; if not found, return null;
             */
            function getTestInfoProperty(key) {
              if (test.type === 'ObjectExpression') {
                return test.properties.find(
                  (item) => item.type === 'Property' && item.key.name === key,
                );
              }
              return null;
            }

            const code = getTestInfoProperty('code');
            const output = getTestInfoProperty('output');

            if (
              output &&
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
