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

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------
    /**
     *compare two test cases depite of properties order.
     *@returns {boolean} if eq, return true, else return false.
    */
    function eq (ta, tb) {
      if (ta.type !== tb.type) {
        return false;
      }

      if (ta.type !== 'ObjectExpression') {
        return sourceCode.getText(ta) === sourceCode.getText(tb);
      }

      const pa = ta.properties || [];
      const pb = tb.properties || [];

      // if properties length not eq; return false;
      if (pa.length !== pb.length) {
        return false;
      }

      // convert array to object
      const paObj = pa.reduce((result, item) => {
        const code = sourceCode.getText(item);
        result[code] = true;
        return result;
      }, {});

      for (let i = 0; i < pb.length; i++) {
        const code = sourceCode.getText(pb[i]);
        if (!(code in paObj)) {
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
            // to avoid tests being null
            (tests || []).forEach(test => {
              if (cache.some(item => eq(item, test))) {
                context.report({
                  node: test,
                  message,
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
