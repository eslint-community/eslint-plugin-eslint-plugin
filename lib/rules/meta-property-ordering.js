/**
 * @fileoverview Enforces the order of meta properties
 */

'use strict';

const { getKeyName, getRuleInfo } = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Enforces the order of meta properties',
      category: 'Rules',
      recommended: false,
    },
    type: 'suggestion',
    fixable: 'code',
    schema: [{
      type: 'array',
      elements: { type: 'string' },
    }],
  },

  create (context) {
    const sourceCode = context.getSourceCode();
    const info = getRuleInfo(sourceCode.ast);

    const message = 'The meta properties should be placed in a consistent order: [{{order}}].';
    const order = context.options[0] || ['type', 'docs', 'fixable', 'schema', 'messages'];

    const orderMap = new Map(order.map((name, i) => [name, i]));

    return {
      Program () {
        if (
          !info ||
          !info.meta ||
          info.meta.properties.length < 2
        ) {
          return;
        }

        const propsActual = info.meta.properties
          .filter(prop => orderMap.has(getKeyName(prop)));

        for (let i = 1, j = propsActual.length; i < j; i += 1) {
          const last = propsActual[i - 1];
          const curr = propsActual[i];
          if (order.indexOf(getKeyName(last)) > order.indexOf(getKeyName(curr))) {
            const propsExpected = propsActual
              .slice()
              .sort((a, b) => orderMap.get(getKeyName(a)) - orderMap.get(getKeyName(b)));

            context.report({
              node: curr,
              message,
              data: {
                order: propsExpected.map(getKeyName).join(', '),
              },
              fix (fixer) {
                return propsActual.map((prop, k) => {
                  return fixer.replaceText(
                    prop,
                    sourceCode.getText(propsExpected[k])
                  );
                });
              },
            });
          }
        }
      },
    };
  },
};
