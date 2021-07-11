'use strict';

const { getStaticValue } = require('eslint-utils');
const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const DEFAULT_PATTERN = new RegExp('^(enforce|require|disallow)');

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require rules to implement a `meta.docs.description` property with the correct format',
      category: 'Rules',
      recommended: false, // TODO: enable it in a major release.
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      extraWhitespace: '`meta.docs.description` must not have leading nor trailing whitespace.',
      mismatch: '`meta.docs.description` must match the regexp {{pattern}}.',
      missing: '`meta.docs.description` is required.',
      wrongType: '`meta.docs.description` must be a non-empty string.',
    },
  },

  create (context) {
    const sourceCode = context.getSourceCode();
    const info = utils.getRuleInfo(sourceCode);

    return {
      Program () {
        if (info === null || info.meta === null) {
          return;
        }

        const pattern = context.options[0] && context.options[0].pattern ? new RegExp(context.options[0].pattern) : DEFAULT_PATTERN;

        const metaNode = info.meta;
        const docsNode =
          metaNode &&
          metaNode.properties &&
          metaNode.properties.find(p => p.type === 'Property' && utils.getKeyName(p) === 'docs');

        const descriptionNode =
          docsNode &&
          docsNode.value.properties &&
          docsNode.value.properties.find(p => p.type === 'Property' && utils.getKeyName(p) === 'description');

        if (!descriptionNode) {
          context.report({ node: docsNode ? docsNode : metaNode, messageId: 'missing' });
          return;
        }

        const staticValue = getStaticValue(descriptionNode.value, context.getScope());
        if (!staticValue) {
          // Ignore non-static values since we can't determine what they look like.
          return;
        }

        if (typeof staticValue.value !== 'string' || staticValue.value === '') {
          context.report({ node: descriptionNode.value, messageId: 'wrongType' });
        } else if (staticValue.value !== staticValue.value.trim()) {
          context.report({ node: descriptionNode.value, messageId: 'extraWhitespace' });
        } else if (!pattern.test(staticValue.value)) {
          context.report({
            node: descriptionNode.value,
            messageId: 'mismatch',
            data: { pattern },
          });
        }
      },
    };
  },
};
