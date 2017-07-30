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
    fixable: 'code',
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
    const sourceCode = context.getSourceCode();

    return {
      Program (ast) {
        utils.getTestInfo(context, ast).forEach(testRun => {
          [testRun.valid, testRun.invalid].forEach(tests => {
            (tests || []).forEach(test => {
              const properties = test.properties || [];
              const keyNames = properties.map(utils.getKeyName);

              for (let i = 0, lastChecked; i < keyNames.length; i++) {
                const current = order.indexOf(keyNames[i]);

                // current < lastChecked to catch unordered;
                // and lastChecked === -1 to catch extra properties before.
                if (current > -1 && (current < lastChecked || lastChecked === -1)) {
                  let orderMsg = order.filter(item => keyNames.indexOf(item) > -1);
                  orderMsg = orderMsg.concat(
                    lastChecked === -1 ? keyNames.filter(item => order.indexOf(item) === -1) : []
                  );

                  context.report({
                    node: properties[i],
                    message,
                    data: { order: orderMsg.join(', ') },
                    fix (fixer) {
                      const source = sourceCode.getText();
                      const last = properties[properties.length - 1];
                      // end loc to replace(including whitespaces).
                      const finalEnd = sourceCode.getTokenAfter(last, token => token.value === '}' && token.type === 'Punctuator').range[0];
                      // reorder the properties and put in result array.
                      const result = [];
                      for (let j = 0; j < keyNames.length; j++) {
                        const insertedIndex = orderMsg.indexOf(keyNames[j]);
                        const propertyCode = sourceCode.getText(properties[j]);
                        const propertyStart = properties[j].range[1];
                        const propertyEnd = j < properties.length - 1 ? properties[j + 1].range[0] : finalEnd;
                        let trailing = source.slice(propertyStart, propertyEnd);

                        // for last property, should check & add trailling commas.
                        if (j === properties.length - 1 && sourceCode.getTokenAfter(last).value !== ',') {
                          trailing = ', ' + trailing;
                        }
                        result[insertedIndex] = propertyCode + trailing;
                      }

                      const start = properties[0].range[0];

                      return fixer.replaceTextRange(
                        [start, finalEnd],
                        result.join('')
                      );
                    },
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
