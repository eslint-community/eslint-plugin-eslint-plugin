'use strict';

const utils = require('../utils');

module.exports = {
  meta: {
    docs: {},
    category: '', // fixme: add valid category
    schema: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      uniqueItems: true,
    },
  },
  create (context) {
    const options = new Set(context.options || []);

    // fixme: add JSDoc
    function isValidCategory (node) {
      return Boolean(
        node &&
        node.type === 'Literal' &&
        typeof node.value === 'string' &&
        options.has(node.value)
      );
    }

    return {
      Program (node) {
        const info = utils.getRuleInfo(node);
        if (!info) {
          return;
        }

        const metaNode = info.meta;
        const docsPropNode =
          metaNode &&
          metaNode.properties &&
          metaNode.properties.find(p => p.type === 'Property' && utils.getKeyName(p) === 'docs');
        const categoryPropNode =
          docsPropNode &&
          docsPropNode.value.properties &&
          docsPropNode.value.properties.find(p => p.type === 'Property' && utils.getKeyName(p) === 'category');

        if (isValidCategory(categoryPropNode && categoryPropNode.value)) {
          return;
        }

        context.report({
          node: categoryPropNode.value,
          message: 'Not a valid category.',
        });
      },
    };
  },
};
