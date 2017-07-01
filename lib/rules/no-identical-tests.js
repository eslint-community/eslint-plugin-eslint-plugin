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
      recommended: false,
    },
    fixable: 'code',
    schema: [],
  },

  create (context) {
    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------
    const message = 'This test case is identical to another case.';
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
                  fix (fixer) {
                    return fixer.remove(test);
                  },
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
