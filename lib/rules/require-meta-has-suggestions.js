'use strict';

const utils = require('../utils');
const { getStaticValue } = require('eslint-utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'require suggestable rules to implement a `meta.hasSuggestions` property',
      category: 'Rules',
      recommended: false,
    },
    type: 'problem',
    messages: {
      shouldBeSuggestable: 'Suggestable rules should specify a `meta.hasSuggestions` property with value `true`.',
      shouldNotBeSuggestable: 'Non-suggestable rules should not specify a `meta.hasSuggestions` property with value `true`.',
    },
    schema: [],
  },

  create (context) {
    const sourceCode = context.getSourceCode();
    const ruleInfo = utils.getRuleInfo(sourceCode);
    let contextIdentifiers;
    let ruleReportsSuggestions;

    return {
      Program (node) {
        contextIdentifiers = utils.getContextIdentifiers(context, node);
      },
      CallExpression (node) {
        if (
          node.callee.type === 'MemberExpression' &&
          contextIdentifiers.has(node.callee.object) &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'report' &&
          (node.arguments.length > 4 || (
            node.arguments.length === 1 &&
            node.arguments[0].type === 'ObjectExpression'
          ))
        ) {
          const suggestProp = node.arguments[0].properties.find(prop => utils.getKeyName(prop) === 'suggest');
          if (suggestProp) {
            const staticValue = getStaticValue(suggestProp.value, context.getScope());
            if (!staticValue || (Array.isArray(staticValue.value) && staticValue.value.length > 0)) {
              // These are all considered reporting suggestions:
              //   suggest: [{...}]
              //   suggest: getSuggestions()
              //   suggest: MY_SUGGESTIONS
              ruleReportsSuggestions = true;
            }
          }
        }
      },
      'Program:exit' () {
        const metaNode = ruleInfo && ruleInfo.meta;
        const hasSuggestionsProperty = metaNode && metaNode.type === 'ObjectExpression' ? metaNode.properties.find(prop => utils.getKeyName(prop) === 'hasSuggestions') : undefined;
        const hasSuggestionsStaticValue = hasSuggestionsProperty && getStaticValue(hasSuggestionsProperty.value, context.getScope());

        if (ruleReportsSuggestions) {
          if (!hasSuggestionsProperty) {
            // Rule reports suggestions but is missing the `meta.hasSuggestions` property altogether.
            context.report({ node: metaNode ? metaNode : ruleInfo.create, messageId: 'shouldBeSuggestable' });
          } else if (hasSuggestionsStaticValue.value !== true) {
            // Rule reports suggestions but does not have `meta.hasSuggestions` property enabled.
            context.report({ node: hasSuggestionsProperty.value, messageId: 'shouldBeSuggestable' });
          }
        } else if (!ruleReportsSuggestions && hasSuggestionsProperty && hasSuggestionsStaticValue.value === true) {
          // Rule does not report suggestions but has the `meta.hasSuggestions` property enabled.
          context.report({ node: hasSuggestionsProperty.value, messageId: 'shouldNotBeSuggestable' });
        }
      },
    };
  },
};
