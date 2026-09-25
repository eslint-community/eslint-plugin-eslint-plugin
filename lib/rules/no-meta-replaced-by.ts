/**
 * @fileoverview Disallows the usage of `meta.replacedBy` property
 */
import { isCommaToken } from '@eslint-community/eslint-utils';
import type { Rule, SourceCode } from 'eslint';
import type { Node, Property } from 'estree';

import {
  evaluateObjectProperties,
  getKeyName,
  getRuleInfo,
  insertProperty,
  isStringLiteral,
} from '../utils.ts';

/**
 * Build the replacement text for a moved `replacedBy` value.
 * Static string arrays become the rich `[{ rule: { name } }, …]` format;
 * anything else is copied verbatim.
 */
function getReplacedByValueText(
  valueNode: Node,
  sourceCode: SourceCode,
): string {
  if (
    valueNode.type === 'ArrayExpression' &&
    valueNode.elements.length > 0 &&
    valueNode.elements.every(
      (element) => element !== null && isStringLiteral(element),
    )
  ) {
    const entries = valueNode.elements
      .map((element) => `{ rule: { name: ${sourceCode.getText(element!)} } }`)
      .join(', ');
    return `[${entries}]`;
  }

  return sourceCode.getText(valueNode);
}

/**
 * Remove a property from an object, including its surrounding comma and
 * adjacent whitespace so blank lines are not left behind.
 */
function removeProperty(
  fixer: Rule.RuleFixer,
  property: Property,
  sourceCode: SourceCode,
): Rule.Fix {
  const tokenBefore = sourceCode.getTokenBefore(property)!;
  const tokenAfter = sourceCode.getTokenAfter(property);

  if (tokenAfter && isCommaToken(tokenAfter)) {
    // Remove leading whitespace through the trailing comma.
    return fixer.removeRange([tokenBefore.range[1], tokenAfter.range[1]]);
  }

  if (isCommaToken(tokenBefore)) {
    // Last property: remove the leading comma through the property.
    return fixer.removeRange([tokenBefore.range[0], property.range![1]]);
  }

  return fixer.remove(property);
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow using the `meta.replacedBy` rule property',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-meta-replaced-by.md',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      useNewFormat:
        'Use `meta.deprecated.replacedBy` instead of `meta.replacedBy`',
      moveToDeprecated: 'Move `replacedBy` into `meta.deprecated`.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const ruleInfo = getRuleInfo(sourceCode);

    if (!ruleInfo) {
      return {};
    }

    return {
      Program() {
        const metaNode = ruleInfo.meta;

        if (!metaNode) {
          return;
        }

        const metaProperties = evaluateObjectProperties(
          metaNode,
          sourceCode.scopeManager,
        );
        const replacedByNode = metaProperties.find(
          (p): p is Property =>
            p.type === 'Property' && getKeyName(p) === 'replacedBy',
        );

        if (!replacedByNode) {
          return;
        }

        const suggestions: Rule.SuggestionReportDescriptor[] = [];

        // Only suggest when replacedBy is a direct own-property of a meta object literal.
        if (
          metaNode.type === 'ObjectExpression' &&
          replacedByNode.parent === metaNode
        ) {
          const valueText = getReplacedByValueText(
            replacedByNode.value,
            sourceCode,
          );
          const directDeprecated = metaNode.properties.find(
            (p): p is Property =>
              p.type === 'Property' && getKeyName(p) === 'deprecated',
          );

          if (!directDeprecated) {
            suggestions.push({
              messageId: 'moveToDeprecated',
              fix(fixer) {
                return fixer.replaceText(
                  replacedByNode,
                  `deprecated: { replacedBy: ${valueText} }`,
                );
              },
            });
          } else if (
            directDeprecated.value.type === 'Literal' &&
            directDeprecated.value.value === true
          ) {
            suggestions.push({
              messageId: 'moveToDeprecated',
              *fix(fixer) {
                yield fixer.replaceText(
                  directDeprecated.value,
                  `{ replacedBy: ${valueText} }`,
                );
                yield removeProperty(fixer, replacedByNode, sourceCode);
              },
            });
          } else if (directDeprecated.value.type === 'ObjectExpression') {
            const deprecatedObject = directDeprecated.value;
            const hasReplacedBy = evaluateObjectProperties(
              deprecatedObject,
              sourceCode.scopeManager,
            ).some(
              (p) => p.type === 'Property' && getKeyName(p) === 'replacedBy',
            );

            if (!hasReplacedBy) {
              suggestions.push({
                messageId: 'moveToDeprecated',
                *fix(fixer) {
                  yield insertProperty(
                    fixer,
                    deprecatedObject,
                    `replacedBy: ${valueText}`,
                    sourceCode,
                  );
                  yield removeProperty(fixer, replacedByNode, sourceCode);
                },
              });
            }
          }
          // deprecated: false / identifier / other → report without suggestion
        }

        context.report({
          node: replacedByNode,
          messageId: 'useNewFormat',
          suggest: suggestions,
        });
      },
    };
  },
};

export default rule;
