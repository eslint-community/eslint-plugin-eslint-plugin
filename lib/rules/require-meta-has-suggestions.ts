import { getStaticValue } from '@eslint-community/eslint-utils';
import type { Rule } from 'eslint';
import type { Node, Property } from 'estree';

import {
  evaluateObjectProperties,
  getContextIdentifiers,
  getKeyName,
  getRuleInfo,
  isUndefinedIdentifier,
} from '../utils.ts';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require suggestable rules to implement a `meta.hasSuggestions` property',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-has-suggestions.md',
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
    const sourceCode = context.sourceCode;
    const { scopeManager } = sourceCode;
    const ruleInfo = getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }
    let contextIdentifiers: Set<Node>;
    let ruleReportsSuggestions = false;

    /**
     * Check if a "suggest" object property from a rule violation report should be considered to contain suggestions.
     * @param node - the "suggest" object property to check
     * @returns whether this property should be considered to contain suggestions
     */
    function doesPropertyContainSuggestions(node: Property): boolean {
      const scope = sourceCode.getScope(node);
      const staticValue = getStaticValue(node.value, scope);
      if (
        !staticValue ||
        (Array.isArray(staticValue.value) && staticValue.value.length > 0) ||
        (Array.isArray(staticValue.value) &&
          staticValue.value.length === 0 &&
          node.value.type === 'Identifier') // Array variable can have suggestions pushed to it.
      ) {
        // These are all considered reporting suggestions:
        //   suggest: [{...}]
        //   suggest: getSuggestions()
        //   suggest: MY_SUGGESTIONS
        return true;
      }
      return false;
    }

    return {
      Program(ast) {
        contextIdentifiers = getContextIdentifiers(scopeManager, ast);
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
          const suggestProp = evaluateObjectProperties(
            node.arguments[0],
            scopeManager,
          )
            .filter((prop) => prop.type === 'Property')
            .find((prop) => getKeyName(prop) === 'suggest');
          if (suggestProp && doesPropertyContainSuggestions(suggestProp)) {
            ruleReportsSuggestions = true;
          }
        }
      },
      Property(node) {
        // In order to reduce false positives, we will also check for a `suggest` property anywhere in the file.
        // This is helpful especially in the event that helper functions are used for reporting violations.
        if (
          node.key.type === 'Identifier' &&
          node.key.name === 'suggest' &&
          doesPropertyContainSuggestions(node)
        ) {
          ruleReportsSuggestions = true;
        }
      },
      'Program:exit'(ast) {
        const scope = sourceCode.getScope(ast);
        const metaNode = ruleInfo && ruleInfo.meta;
        const hasSuggestionsProperty = evaluateObjectProperties(
          metaNode,
          scopeManager,
        )
          .filter((prop) => prop.type === 'Property')
          .find((prop) => getKeyName(prop) === 'hasSuggestions');
        const hasSuggestionsStaticValue =
          hasSuggestionsProperty &&
          getStaticValue(hasSuggestionsProperty.value, scope);

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
                      '{ hasSuggestions: true }',
                    );
                  }
                  // Add new property to start of property list.
                  return fixer.insertTextBefore(
                    metaNode.properties[0],
                    'hasSuggestions: true, ',
                  );
                }
                return null;
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
                  isUndefinedIdentifier(hasSuggestionsProperty.value)
                ) {
                  return fixer.replaceText(
                    hasSuggestionsProperty.value,
                    'true',
                  );
                }
                return null;
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

export default rule;
