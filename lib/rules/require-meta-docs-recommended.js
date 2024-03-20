'use strict';

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
    schema: [],
    messages: {
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
    } = utils.getMetaProperty('recommended', ruleInfo, scopeManager);

    if (!descriptionNode) {
      context.report({
        node: docsNode || metaNode || ruleInfo.create,
        messageId: 'missing',
      });
    }

    return {};
  },
};
