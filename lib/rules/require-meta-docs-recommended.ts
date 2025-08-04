import { getStaticValue } from '@eslint-community/eslint-utils';
import type { Rule } from 'eslint';
import type { ObjectExpression } from 'estree';

import {
  getMetaDocsProperty,
  getRuleInfo,
  isUndefinedIdentifier,
} from '../utils.js';

function insertRecommendedProperty(
  fixer: Rule.RuleFixer,
  objectNode: ObjectExpression,
  recommendedValue: boolean,
) {
  if (objectNode.properties.length === 0) {
    return fixer.replaceText(
      objectNode,
      `{ recommended: ${recommendedValue} }`,
    );
  }
  const lastProperty = objectNode.properties.at(-1);
  if (!lastProperty) {
    return fixer.replaceText(
      objectNode,
      `{ recommended: ${recommendedValue} }`,
    );
  }
  return fixer.insertTextAfter(
    lastProperty,
    `, recommended: ${recommendedValue}`,
  );
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'require rules to implement a `meta.docs.recommended` property',
      category: 'Rules',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-docs-recommended.md',
    },
    fixable: undefined,
    hasSuggestions: true,
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
    defaultOptions: [{ allowNonBoolean: false }],
    messages: {
      incorrect: '`meta.docs.recommended` is required to be a boolean.',
      missing: '`meta.docs.recommended` is required.',
      setRecommendedTrue: 'Set `meta.docs.recommended` to `true`.',
      setRecommendedFalse: 'Set `meta.docs.recommended` to `false`.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const ruleInfo = getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    const { scopeManager } = sourceCode;
    const {
      docsNode,
      metaNode,
      metaPropertyNode: descriptionNode,
    } = getMetaDocsProperty('recommended', ruleInfo, scopeManager);

    if (!descriptionNode) {
      const docNodeValue = docsNode?.value;
      const suggestions: Rule.SuggestionReportDescriptor[] =
        docNodeValue?.type === 'ObjectExpression'
          ? [
              {
                messageId: 'setRecommendedTrue',
                fix: (fixer) =>
                  insertRecommendedProperty(fixer, docNodeValue, true),
              },
              {
                messageId: 'setRecommendedFalse',
                fix: (fixer) =>
                  insertRecommendedProperty(fixer, docNodeValue, false),
              },
            ]
          : [];

      context.report({
        node: docsNode || metaNode || ruleInfo.create,
        messageId: 'missing',
        suggest: suggestions,
      });
      return {};
    }

    if (context.options[0]?.allowNonBoolean) {
      return {};
    }

    const staticValue = isUndefinedIdentifier(descriptionNode.value)
      ? { value: undefined }
      : getStaticValue(descriptionNode.value);

    if (staticValue && typeof staticValue.value !== 'boolean') {
      context.report({
        node: descriptionNode.value,
        messageId: 'incorrect',
        suggest: [
          {
            messageId: 'setRecommendedTrue',
            fix: (fixer) => fixer.replaceText(descriptionNode.value, 'true'),
          },
          {
            messageId: 'setRecommendedFalse',
            fix: (fixer) => fixer.replaceText(descriptionNode.value, 'false'),
          },
        ],
      });
      return {};
    }

    return {};
  },
};

export default rule;
