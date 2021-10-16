/**
 * @fileoverview disallow identical tests
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow identical tests',
      category: 'Tests',
      recommended: true,
      url: 'https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-identical-tests.md',
    },
    fixable: 'code',
    schema: [],
    messages: {
      identical: 'This test case is identical to another case.',
    },
  },

  create (context) {
    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------
    const sourceCode = context.getSourceCode();

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------
    /**
     *compare two test cases despite of properties order.
     *@returns {boolean} if eq, return true, else return false.
    */
    function eq (testA, testB) {
      if (testA.type !== testB.type) {
        return false;
      }

      if (testA.type !== 'ObjectExpression') {
        return sourceCode.getText(testA) === sourceCode.getText(testB);
      }

      const propertiesA = testA.properties;
      const propertiesB = testB.properties;

      // if properties length not eq; return false;
      if (propertiesA.length !== propertiesB.length) {
        return false;
      }

      const propertiesSetA = new Set();
      propertiesA.forEach(item => {
        const code = sourceCode.getText(item);
        propertiesSetA.add(code);
      });

      for (const element of propertiesB) {
        const code = sourceCode.getText(element);
        if (!propertiesSetA.has(code)) {
          return false;
        }
      }
      return true;
    }

    return {
      Program (ast) {
        utils.getTestInfo(context, ast).forEach(testRun => {
          [testRun.valid, testRun.invalid].forEach(tests => {
            const cache = [];
            tests.forEach(test => {
              if (cache.some(item => eq(item, test))) {
                context.report({
                  node: test,
                  messageId: 'identical',
                  fix (fixer) {
                    const start = sourceCode.getTokenBefore(test);
                    const end = sourceCode.getTokenAfter(test);
                    return fixer.removeRange(
                      // should remove test's trailing comma
                      [start.range[1], end.value === ',' ? end.range[1] : test.range[1]]);
                  },
                });
              } else {
                cache.push(test);
              }
            });
          });
        });
      },
    };
  },
};
