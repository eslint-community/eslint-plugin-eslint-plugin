/**
 * @fileoverview require rules to implement a `meta.type` property
 * @author 薛定谔的猫<weiran.zsd@outlook.com>
 */

'use strict';

const { getStaticValue } = require('eslint-utils');
const utils = require('../utils');
const VALID_TYPES = new Set(['problem', 'suggestion', 'layout']);

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require rules to implement a `meta.type` property',
      category: 'Rules',
      recommended: false, // TODO: enable it in a major release.
    },
    fixable: null,
    schema: [],
    messages: {
      missing: '`meta.type` is required (must be either `problem`, `suggestion`, or `layout`).',
      unexpected: '`meta.type` must be either `problem`, `suggestion`, or `layout`.',
    },
  },

  create (context) {
    const sourceCode = context.getSourceCode();
    const info = utils.getRuleInfo(sourceCode);

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      Program () {
        if (info === null || info.meta === null) {
          return;
        }

        const metaNode = info.meta;
        const typeNode =
          metaNode &&
          metaNode.properties &&
          metaNode.properties.find(p => p.type === 'Property' && utils.getKeyName(p) === 'type');

        if (!typeNode) {
          context.report({ node: metaNode, messageId: 'missing' });
          return;
        }

        const staticValue = getStaticValue(typeNode.value, context.getScope());
        if (!staticValue) {
          // Ignore non-static values since we can't determine what they look like.
          return;
        }

        if (!VALID_TYPES.has(staticValue.value)) {
          context.report({ node: typeNode.value, messageId: 'unexpected' });
        }
      },
    };
  },
};
