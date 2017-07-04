/**
 * @fileoverview Requires the properties of a test case to be placed in the given order.
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
      description: 'Requires the properties of a test case to be placed in the given order',
      category: 'Tests',
      recommended: false,
    },
    fixable: null,  // or "code" or "whitespace"
    schema: [{
      type: 'array',
    }],
  },

  create (context) {
    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------
    const message = 'The properties of a test case should be placed in the given order: [{{order}}].';
    const order = context.options[0] || ['code', 'output', 'options', 'parserOptions', 'errors'];

    return {
      Program (ast) {
        utils.getTestInfo(context, ast).forEach(testRun => {
          [testRun.valid, testRun.invalid].forEach(tests => {
            (tests || []).forEach(test => {
              const keys = (test.properties || []).map(item => item.key.name);

              for (let i = 0, j; i < keys.length; i++) {
                const current = order.indexOf(keys[i]);

                // current < j to catch unordered;
                // and j === -1 to catch extra properties before.
                if (current > -1 && (current < j || j === -1)) {
                  context.report({
                    node: test.properties[i],
                    message,
                    data: { order: order.join(', ') },
                  });
                }
                j = current;
              }
            });
          });
        });
      },
    };
  },
};
