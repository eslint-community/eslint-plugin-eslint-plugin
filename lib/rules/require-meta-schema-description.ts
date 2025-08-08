import { getStaticValue } from '@eslint-community/eslint-utils';
import type { Rule } from 'eslint';
import type { Expression, SpreadElement } from 'estree';

import {
  getMetaSchemaNode,
  getMetaSchemaNodeProperty,
  getRuleInfo,
} from '../utils.ts';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'require rules `meta.schema` properties to include descriptions',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-schema-description.md',
    },
    schema: [],
    messages: {
      missingDescription: 'Schema option is missing an ajv description.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const { scopeManager } = sourceCode;
    const ruleInfo = getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    const schemaNode = getMetaSchemaNode(ruleInfo.meta, scopeManager);
    if (!schemaNode) {
      return {};
    }

    const schemaProperty = getMetaSchemaNodeProperty(schemaNode, scopeManager);
    if (schemaProperty?.type !== 'ArrayExpression') {
      return {};
    }

    for (const element of schemaProperty.elements) {
      checkSchemaElement(element, true);
    }

    return {};

    function checkSchemaElement(
      node: Expression | SpreadElement | null,
      isRoot = false,
    ): void {
      if (!node || node.type !== 'ObjectExpression') {
        return;
      }

      let hadChildren = false;
      let hadDescription = false;

      for (const { key, value } of node.properties.filter(
        (prop) => prop.type === 'Property',
      )) {
        if (!key) {
          continue;
        }
        const staticKey =
          key.type === 'Identifier' ? { value: key.name } : getStaticValue(key);
        if (!staticKey?.value) {
          continue;
        }

        // @ts-expect-error == Property 'name' does not exist on type 'ClassExpression'.ts(2339)
        switch (key.name ?? key.value) {
          case 'description': {
            hadDescription = true;
            break;
          }

          case 'oneOf': {
            hadChildren = true;

            if (value.type === 'ArrayExpression') {
              for (const element of value.elements) {
                checkSchemaElement(element, isRoot);
              }
            }

            break;
          }

          case 'properties': {
            hadChildren = true;

            if ('properties' in value && Array.isArray(value.properties)) {
              for (const property of value.properties) {
                if (
                  'value' in property &&
                  property.value?.type === 'ObjectExpression'
                ) {
                  checkSchemaElement(property.value);
                }
              }
            }

            break;
          }
        }
      }

      if (!hadDescription && !(hadChildren && isRoot)) {
        context.report({
          messageId: 'missingDescription',
          node,
        });
      }
    }
  },
};

export default rule;
