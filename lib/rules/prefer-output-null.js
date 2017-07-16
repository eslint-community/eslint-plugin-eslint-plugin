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
    const sourceCode = context.getSourceCode();
    return {
      Program (ast) {
        utils.getTestInfo(context, ast).forEach(testRun => {
          const reportInfo = utils.getReportInfo(testRun.invalid);
          const code = sourceCode.getText(reportInfo.code);
          const output = sourceCode.getText(reportInfo.output);
          if (output && output === code) {
            context.report({
              node: reportInfo.output,
              message,
            });
          }
        });
      },
    };
  },
};
