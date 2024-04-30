'use strict';

const { getStaticValue } = require('@eslint-community/eslint-utils');
const utils = require('../utils');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'require rules to implement a `meta.docs.recommended` property',
      category: 'Rules',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-docs-recommended.md',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowNonBoolean: {
            default: false,
            description: 'Whether to allow values of types other than boolean.',
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      incorrect: '`meta.docs.recommended` is required to be a boolean.',
      missing: '`meta.docs.recommended` is required.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode(); // TODO: just use context.sourceCode when dropping eslint < v9
    const ruleInfo = utils.getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    const { scopeManager } = sourceCode;
    const {
      docsNode,
      metaNode,
      metaPropertyNode: descriptionNode,
    } = utils.getMetaDocsProperty('recommended', ruleInfo, scopeManager);

    if (!descriptionNode) {
      context.report({
        node: docsNode || metaNode || ruleInfo.create,
        messageId: 'missing',
      });
      return {};
    }

    if (context.options[0]?.allowNonBoolean) {
      return {};
    }

    const staticValue = utils.isUndefinedIdentifier(descriptionNode.value)
      ? { value: undefined }
      : getStaticValue(descriptionNode.value);

    if (staticValue && typeof staticValue.value !== 'boolean') {
      context.report({
        node: descriptionNode.value,
        messageId: 'incorrect',
      });
      return {};
    }

    return {};
  },
};
