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
    docs: {
      description: 'disallow identical tests',
      category: 'Tests',
      recommended: true,
    },
    fixable: null,  // or "code" or "whitespace"
    schema: [],
  },

  create (context) {
    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------
    const message = 'This test case should not be identical to someone else.';
    const sourceCode = context.getSourceCode();

    return {
      Program (ast) {
        utils.getTestInfo(context, ast).forEach(testRun => {
          [testRun.valid, testRun.invalid].forEach(tests => {
            const cache = Object.create(null);
            // to avoid tests being null
            (tests || []).forEach(test => {
              const testCode = sourceCode.getText(test);
              if (cache[testCode]) {
                context.report({
                  node: test,
                  message,
                });
              } else {
                cache[testCode] = true;
              }
            });
          });
        });
      },
    };
  },
};
