/**
 * @fileoverview Require explicit policy choices in rule options schemas.
 * @author morgan-coded
 */
import type { Rule, Scope } from 'eslint';
import type { ObjectExpression } from 'estree';

import {
  getMetaSchemaNode,
  getMetaSchemaNodeProperty,
  getRuleInfo,
  hasUnresolvedObjectSpread,
} from '../utils.ts';
import {
  annotations,
  getArrayElements,
  getChildSchemas,
  getObjectProperties,
  getPropertyStaticValue,
  hasInertKeywordUse,
  hasOnlyArrayType,
  hasType,
  isStaticallyInspectable,
  resolveObjectExpression,
  type ObjectProperties,
} from './meta-schema-utils.ts';

const defaultChecks = {
  explicitAdditionalProperties: true,
  explicitItems: true,
  typedItems: true,
  boundedTuples: true,
};

type Checks = typeof defaultChecks;

const arrayApplicableKeywords = new Set([
  '$ref',
  'allOf',
  'anyOf',
  'const',
  'contains',
  'else',
  'enum',
  'if',
  'items',
  'maxItems',
  'minItems',
  'not',
  'oneOf',
  'then',
  'type',
  'uniqueItems',
]);

const typeAlternativeKeywords = new Set([
  '$ref',
  'allOf',
  'anyOf',
  'const',
  'enum',
  'if',
  'not',
  'oneOf',
]);

function hasTypeAlternative(properties: ObjectProperties): boolean {
  return [...typeAlternativeKeywords].some((key) => properties.has(key));
}

function hasUselessKeyword(
  properties: ObjectProperties,
  scope: Scope.Scope,
): boolean {
  return properties.has('$ref') || hasInertKeywordUse(properties, scope);
}

function isUselessObjectFormRoot(
  properties: ObjectProperties,
  scope: Scope.Scope,
): boolean {
  const keys = [...properties.keys()];
  const assertionKeys = keys.filter((key) => !annotations.has(key));
  return (
    keys.length === 0 ||
    (hasOnlyArrayType(properties, scope) &&
      assertionKeys.length === 1 &&
      assertionKeys[0] === 'type') ||
    !assertionKeys.some((key) => arrayApplicableKeywords.has(key))
  );
}

function hasItemConstraint(
  properties: ObjectProperties,
  scope: Scope.Scope,
  scopeManager: Scope.ScopeManager,
): boolean {
  const items = properties.get('items');
  if (items && getPropertyStaticValue(items, scope) !== true) {
    return true;
  }
  if (properties.has('$ref')) {
    return true;
  }

  const allOf = getArrayElements(properties.get('allOf'), scopeManager);
  if (
    allOf?.some((branch) => {
      const resolvedBranch = resolveObjectExpression(branch, scopeManager);
      if (!resolvedBranch) {
        return false;
      }
      const branchProperties = getObjectProperties(
        resolvedBranch,
        scopeManager,
      );
      if (!branchProperties) {
        return false;
      }
      return hasItemConstraint(branchProperties, scope, scopeManager);
    })
  ) {
    return true;
  }

  for (const keyword of ['anyOf', 'oneOf']) {
    const branches = getArrayElements(properties.get(keyword), scopeManager);
    if (
      branches &&
      branches.length > 0 &&
      branches.every((branch) => {
        const resolvedBranch = resolveObjectExpression(branch, scopeManager);
        if (!resolvedBranch) {
          return false;
        }
        const branchProperties = getObjectProperties(
          resolvedBranch,
          scopeManager,
        );
        if (!branchProperties) {
          return false;
        }
        return hasItemConstraint(branchProperties, scope, scopeManager);
      })
    ) {
      return true;
    }
  }
  return false;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require explicit policy choices in rule options schemas',
      category: 'Rules',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-incomplete-meta-schema.md',
    },
    schema: [
      {
        type: 'object',
        properties: {
          checks: {
            type: 'object',
            description: 'Which schema completeness checks to enforce.',
            properties: {
              explicitAdditionalProperties: {
                type: 'boolean',
                description:
                  'Whether object schemas must state an additionalProperties policy.',
              },
              explicitItems: {
                type: 'boolean',
                description:
                  'Whether array schemas must state an items policy.',
              },
              typedItems: {
                type: 'boolean',
                description:
                  'Whether array item schemas must constrain their type.',
              },
              boundedTuples: {
                type: 'boolean',
                description:
                  'Whether tuple schemas must state how additional items are handled.',
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ checks: defaultChecks }],
    messages: {
      explicitAdditionalProperties:
        'State an explicit `additionalProperties` policy for this object schema.',
      explicitItems: 'Specify an explicit `items` policy for this array.',
      typedItems:
        'Specify the item type or a recognized type-constraining alternative.',
      boundedTuples:
        'Bound tuple items with `additionalItems` or an equivalent `maxItems`.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const { scopeManager } = sourceCode;
    const ruleInfo = getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    const configuredChecks = context.options[0]?.checks as
      Partial<Checks> | undefined;
    const checks = { ...defaultChecks, ...configuredChecks };
    const metaNode = ruleInfo.meta;
    const schemaNode = getMetaSchemaNode(metaNode, scopeManager);
    const schemaValue = getMetaSchemaNodeProperty(schemaNode, scopeManager);

    return {
      Program(ast) {
        if (!schemaValue || hasUnresolvedObjectSpread(metaNode, scopeManager)) {
          return;
        }
        if (schemaValue.type === 'Literal' && schemaValue.value === false) {
          return;
        }
        if (
          schemaValue.type !== 'ArrayExpression' &&
          schemaValue.type !== 'ObjectExpression'
        ) {
          return;
        }
        if (
          schemaValue.type === 'ArrayExpression' &&
          schemaValue.elements.length === 0
        ) {
          return;
        }

        const scope = sourceCode.getScope(ast);
        if (!isStaticallyInspectable(schemaValue, scope, scopeManager)) {
          return;
        }

        const seen = new Set<ObjectExpression>();
        const visitSchema = (
          schema: ObjectExpression,
          isObjectFormRoot = false,
        ) => {
          if (seen.has(schema)) {
            return;
          }
          seen.add(schema);

          const properties = getObjectProperties(schema, scopeManager)!;

          const hasExplicitWrongRootType =
            isObjectFormRoot &&
            properties.has('type') &&
            !hasType(properties, 'array', scope);
          const skipLocalPolicy =
            hasExplicitWrongRootType ||
            hasUselessKeyword(properties, scope) ||
            (isObjectFormRoot && isUselessObjectFormRoot(properties, scope));

          if (
            !skipLocalPolicy &&
            checks.explicitAdditionalProperties &&
            hasType(properties, 'object', scope) &&
            !properties.has('additionalProperties')
          ) {
            context.report({
              node: schema,
              messageId: 'explicitAdditionalProperties',
            });
          }

          const isArraySchema =
            hasType(properties, 'array', scope) ||
            (isObjectFormRoot && !properties.has('type'));
          if (!skipLocalPolicy && isArraySchema) {
            const itemsProperty = properties.get('items');
            if (itemsProperty?.value.type === 'ArrayExpression') {
              const additionalItemsProperty = properties.get('additionalItems');
              const additionalItems = getPropertyStaticValue(
                additionalItemsProperty,
                scope,
              );
              const hasAdditionalItemsSchema =
                additionalItemsProperty !== undefined &&
                resolveObjectExpression(
                  additionalItemsProperty.value,
                  scopeManager,
                ) !== null;
              const maxItems = getPropertyStaticValue(
                properties.get('maxItems'),
                scope,
              );
              if (
                checks.boundedTuples &&
                additionalItems !== false &&
                additionalItems !== true &&
                !hasAdditionalItemsSchema &&
                (!Number.isInteger(maxItems) ||
                  (maxItems as number) > itemsProperty.value.elements.length)
              ) {
                context.report({ node: schema, messageId: 'boundedTuples' });
              }
            }

            if (
              checks.explicitItems &&
              !hasItemConstraint(properties, scope, scopeManager)
            ) {
              context.report({ node: schema, messageId: 'explicitItems' });
            }

            if (checks.typedItems) {
              const items = itemsProperty
                ? itemsProperty.value.type === 'ArrayExpression'
                  ? itemsProperty.value.elements
                      .filter(
                        (element): element is NonNullable<typeof element> =>
                          element !== null && element.type !== 'SpreadElement',
                      )
                      .map((element) =>
                        resolveObjectExpression(element, scopeManager),
                      )
                      .filter(
                        (element): element is ObjectExpression =>
                          element !== null,
                      )
                  : [
                      resolveObjectExpression(
                        itemsProperty.value,
                        scopeManager,
                      ),
                    ].filter(
                      (element): element is ObjectExpression =>
                        element !== null,
                    )
                : [];
              for (const item of items) {
                const itemProperties = getObjectProperties(item, scopeManager);
                if (
                  itemProperties &&
                  itemProperties.size > 0 &&
                  !itemProperties.has('type') &&
                  !hasTypeAlternative(itemProperties)
                ) {
                  context.report({ node: item, messageId: 'typedItems' });
                }
              }
            }
          }

          for (const child of getChildSchemas(
            properties,
            scopeManager,
            'policy',
          )) {
            visitSchema(child.schema);
          }
        };

        if (schemaValue.type === 'ObjectExpression') {
          visitSchema(schemaValue, true);
          return;
        }
        for (const element of schemaValue.elements) {
          const resolvedElement = resolveObjectExpression(
            element!,
            scopeManager,
          );
          if (resolvedElement) {
            visitSchema(resolvedElement);
          }
        }
      },
    };
  },
};

export default rule;
