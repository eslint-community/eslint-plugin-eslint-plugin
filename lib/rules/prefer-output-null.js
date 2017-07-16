/**
 * @fileoverview disallows invalid RuleTester test cases with the output the same as the code.
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
      description: 'disallows invalid RuleTester test cases with the output the same as the code.',
      category: 'Tests',
      recommended: false,
    },
    fixable: null,
    schema: [],
  },

  create (context) {
    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------
    const message = 'Prefer `output: null` to assert that a test case is not autofixed.';

    return {
      Program (ast) {
        utils.getTestInfo(context, ast).forEach(testRun => {
          (testRun.invalid || []).forEach(test => {
            if (!test.properties.some(item => item.key.name === 'output')) {
              context.report({
                node: test,
                message,
              });
            }
          });
        });
      },
    };
  },
};
