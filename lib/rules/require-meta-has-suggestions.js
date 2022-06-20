'use strict';

const utils = require('../utils');
const { getStaticValue } = require('eslint-utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'require suggestable rules to implement a `meta.hasSuggestions` property',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-has-suggestions.md',
    },
    fixable: 'code',
    schema: [],
    messages: {
      shouldBeSuggestable:
        '`meta.hasSuggestions` must be `true` for suggestable rules.',
      shouldNotBeSuggestable:
        '`meta.hasSuggestions` cannot be `true` for non-suggestable rules.',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const { scopeManager } = sourceCode;
    const ruleInfo = utils.getRuleInfo(sourceCode);
    let contextIdentifiers;
    let ruleReportsSuggestions;

    return {
      Program(ast) {
        contextIdentifiers = utils.getContextIdentifiers(scopeManager, ast);
      },
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          contextIdentifiers.has(node.callee.object) &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'report' &&
          (node.arguments.length > 4 ||
            (node.arguments.length === 1 &&
              node.arguments[0].type === 'ObjectExpression'))
        ) {
          const suggestProp = node.arguments[0].properties.find(
            (prop) => utils.getKeyName(prop) === 'suggest'
          );
          if (suggestProp) {
            const staticValue = getStaticValue(
              suggestProp.value,
              context.getScope()
            );
            if (
              !staticValue ||
              (Array.isArray(staticValue.value) &&
                staticValue.value.length > 0) ||
              (Array.isArray(staticValue.value) &&
                staticValue.value.length === 0 &&
                suggestProp.value.type === 'Identifier') // Array variable can have suggestions pushed to it.
            ) {
              // These are all considered reporting suggestions:
              //   suggest: [{...}]
              //   suggest: getSuggestions()
              //   suggest: MY_SUGGESTIONS
              ruleReportsSuggestions = true;
            }
          }
        }
      },
      'Program:exit'() {
        const metaNode = ruleInfo && ruleInfo.meta;
        const hasSuggestionsProperty = utils
          .evaluateObjectProperties(metaNode, scopeManager)
          .find((prop) => utils.getKeyName(prop) === 'hasSuggestions');
        const hasSuggestionsStaticValue =
          hasSuggestionsProperty &&
          getStaticValue(hasSuggestionsProperty.value, context.getScope());

        if (ruleReportsSuggestions) {
          if (!hasSuggestionsProperty) {
            // Rule reports suggestions but is missing the `meta.hasSuggestions` property altogether.
            context.report({
              node: metaNode || ruleInfo.create,
              messageId: 'shouldBeSuggestable',
              fix(fixer) {
                if (metaNode && metaNode.type === 'ObjectExpression') {
                  if (metaNode.properties.length === 0) {
                    // If object is empty, just replace entire object.
                    return fixer.replaceText(
                      metaNode,
                      '{ hasSuggestions: true }'
                    );
                  }
                  // Add new property to start of property list.
                  return fixer.insertTextBefore(
                    metaNode.properties[0],
                    'hasSuggestions: true, '
                  );
                }
              },
            });
          } else if (
            hasSuggestionsStaticValue &&
            hasSuggestionsStaticValue.value !== true
          ) {
            // Rule reports suggestions but does not have `meta.hasSuggestions` property enabled.
            context.report({
              node: hasSuggestionsProperty.value,
              messageId: 'shouldBeSuggestable',
              fix(fixer) {
                if (
                  hasSuggestionsProperty.value.type === 'Literal' ||
                  (hasSuggestionsProperty.value.type === 'Identifier' &&
                    hasSuggestionsProperty.value.name === 'undefined')
                ) {
                  return fixer.replaceText(
                    hasSuggestionsProperty.value,
                    'true'
                  );
                }
              },
            });
          }
        } else if (
          !ruleReportsSuggestions &&
          hasSuggestionsProperty &&
          hasSuggestionsStaticValue &&
          hasSuggestionsStaticValue.value === true
        ) {
          // Rule does not report suggestions but has the `meta.hasSuggestions` property enabled.
          context.report({
            node: hasSuggestionsProperty.value,
            messageId: 'shouldNotBeSuggestable',
          });
        }
      },
    };
  },
};
