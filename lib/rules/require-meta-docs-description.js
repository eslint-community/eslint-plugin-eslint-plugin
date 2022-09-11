'use strict';

const { getStaticValue } = require('eslint-utils');
const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const DEFAULT_PATTERN = new RegExp('^(enforce|require|disallow)');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'require rules to implement a `meta.docs.description` property with the correct format',
      category: 'Rules',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-docs-description.md',
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
      extraWhitespace:
        '`meta.docs.description` must not have leading nor trailing whitespace.',
      mismatch: '`meta.docs.description` must match the regexp {{pattern}}.',
      missing: '`meta.docs.description` is required.',
      wrongType: '`meta.docs.description` must be a non-empty string.',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const ruleInfo = utils.getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    return {
      Program() {
        const { scopeManager } = sourceCode;

        const pattern =
          context.options[0] && context.options[0].pattern
            ? new RegExp(context.options[0].pattern)
            : DEFAULT_PATTERN;

        const metaNode = ruleInfo.meta;
        const docsNode = utils
          .evaluateObjectProperties(metaNode, scopeManager)
          .find((p) => p.type === 'Property' && utils.getKeyName(p) === 'docs');

        const descriptionNode = utils
          .evaluateObjectProperties(docsNode && docsNode.value, scopeManager)
          .find(
            (p) =>
              p.type === 'Property' && utils.getKeyName(p) === 'description'
          );

        if (!descriptionNode) {
          context.report({
            node: docsNode || metaNode || ruleInfo.create,
            messageId: 'missing',
          });
          return;
        }

        const staticValue = getStaticValue(
          descriptionNode.value,
          context.getScope()
        );
        if (!staticValue) {
          // Ignore non-static values since we can't determine what they look like.
          return;
        }

        if (typeof staticValue.value !== 'string' || staticValue.value === '') {
          context.report({
            node: descriptionNode.value,
            messageId: 'wrongType',
          });
        } else if (staticValue.value !== staticValue.value.trim()) {
          context.report({
            node: descriptionNode.value,
            messageId: 'extraWhitespace',
          });
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
