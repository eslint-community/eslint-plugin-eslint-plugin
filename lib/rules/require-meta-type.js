/**
 * @fileoverview require rules to implement a meta.type property
 * @author 薛定谔的猫<weiran.zsd@outlook.com>
 */

'use strict';

const utils = require('../utils');
const validTypes = ['problem', 'suggestion', 'layout'];
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'require rules to implement a meta.type property',
      category: 'Rules',
      recommended: false, // TODO: enable it in a major release.
    },
    type: 'problem',
    fixable: null,
    schema: [],
    messages: {
      missing: '`meta.type` is required.',
      unexpected: '`meta.type` must be either `problem`, `suggestion` or `layout`.',
    },
  },

  create (context) {
    const sourceCode = context.getSourceCode();
    const info = utils.getRuleInfo(sourceCode.ast);

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      Program () {
        if (info === null) {
          return;
        }

        const metaNode = info.meta;
        const typeNode =
          metaNode &&
          metaNode.properties &&
          metaNode.properties.find(p => p.type === 'Property' && utils.getKeyName(p) === 'type');

        // if has no typeNode => report "missing"
        // if has invalid value => report "unexpected"
        const messageId = typeNode
          ? validTypes.indexOf(typeNode.value.value) < 0 ? 'unexpected' : ''
          : 'missing';

        if (messageId) {
          context.report({ node: metaNode, messageId });
        }
      },
    };
  },
};
