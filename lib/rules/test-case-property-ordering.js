/**
 * @fileoverview Requires the properties of a test case to be placed in a consistent order.
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
      description: 'Requires the properties of a test case to be placed in a consistent order',
      category: 'Tests',
      recommended: false,
    },
    fixable: null, // or "code" or "whitespace"
    schema: [{
      type: 'array',
      elements: { type: 'string' },
    }],
  },

  create (context) {
    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------
    const message = 'The properties of a test case should be placed in a consistent order: [{{order}}].';
    const order = context.options[0] || ['code', 'output', 'options', 'parserOptions', 'errors'];

    return {
      Program (ast) {
        utils.getTestInfo(context, ast).forEach(testRun => {
          [testRun.valid, testRun.invalid].forEach(tests => {
            (tests || []).forEach(test => {
              const keys = (test.properties || []).map(utils.getKeyName);

              for (let i = 0, lastChecked; i < keys.length; i++) {
                const current = order.indexOf(keys[i]);

                // current < lastChecked to catch unordered;
                // and lastChecked === -1 to catch extra properties before.
                if (current > -1 && (current < lastChecked || lastChecked === -1)) {
                  let orderMsg = order.filter(item => keys.indexOf(item) > -1);
                  orderMsg = orderMsg.concat(
                    lastChecked === -1 ? keys.filter(item => order.indexOf(item) === -1) : []
                  );

                  context.report({
                    node: test.properties[i],
                    message,
                    data: { order: orderMsg.join(', ') },
                  });
                }
                lastChecked = current;
              }
            });
          });
        });
      },
    };
  },
};
