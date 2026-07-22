/**
 * @fileoverview Disallow incomplete rule options schemas.
 * @author morgan-coded
 */
import { getStaticValue } from '@eslint-community/eslint-utils';
import type { Rule, Scope } from 'eslint';
import type { Node, ObjectExpression, Property } from 'estree';

import {
  evaluateObjectProperties,
  getKeyName,
  getMetaSchemaNode,
  getMetaSchemaNodeProperty,
  getRuleInfo,
  hasUnresolvedObjectSpread,
} from '../utils.ts';

const defaultChecks = {
  rootEmptySchema: true,
  rootBareArraySchema: true,
  rootWrongOptionsType: true,
  rootObjectKeywordNoop: true,
  objectAdditionalPropertiesExplicit: true,
  tupleAdditionalItems: true,
  arrayItems: true,
  arrayItemType: true,
};

type Checks = typeof defaultChecks;
type ObjectProperties = Map<string, Property>;

const annotations = new Set([
  '$comment',
  '$id',
  '$schema',
  'default',
  'deprecated',
  'description',
  'examples',
  'id',
  'readOnly',
  'title',
  'writeOnly',
]);

const knownKeywords = new Set([
  ...annotations,
  '$anchor',
  '$defs',
  '$dynamicAnchor',
  '$dynamicRef',
  '$recursiveAnchor',
  '$recursiveRef',
  '$ref',
  '$vocabulary',
  'additionalItems',
  'additionalProperties',
  'allOf',
  'anyOf',
  'const',
  'contains',
  'contentEncoding',
  'contentMediaType',
  'contentSchema',
  'definitions',
  'dependencies',
  'dependentRequired',
  'dependentSchemas',
  'disallow',
  'divisibleBy',
  'else',
  'enum',
  'exclusiveMaximum',
  'exclusiveMinimum',
  'extends',
  'format',
  'if',
  'items',
  'maxContains',
  'maximum',
  'maxItems',
  'maxLength',
  'maxProperties',
  'minContains',
  'minimum',
  'minItems',
  'minLength',
  'minProperties',
  'multipleOf',
  'not',
  'oneOf',
  'pattern',
  'patternProperties',
  'prefixItems',
  'properties',
  'propertyNames',
  'required',
  'then',
  'type',
  'unevaluatedItems',
  'unevaluatedProperties',
  'uniqueItems',
]);

const typeAlternativeKeywords = new Set([
  '$ref',
  '$dynamicRef',
  '$recursiveRef',
  'allOf',
  'anyOf',
  'const',
  'enum',
  'if',
  'not',
  'oneOf',
]);

const arrayApplicableKeywords = new Set([
  '$dynamicRef',
  '$recursiveRef',
  '$ref',
  'allOf',
  'anyOf',
  'const',
  'contains',
  'else',
  'enum',
  'if',
  'items',
  'maxContains',
  'maxItems',
  'minContains',
  'minItems',
  'not',
  'oneOf',
  'prefixItems',
  'then',
  'type',
  'unevaluatedItems',
  'uniqueItems',
]);

const directSchemaKeywords = [
  'additionalItems',
  'additionalProperties',
  'contains',
  'contentSchema',
  'else',
  'if',
  'not',
  'propertyNames',
  'then',
  'unevaluatedItems',
  'unevaluatedProperties',
];

const arraySchemaKeywords = ['allOf', 'anyOf', 'oneOf', 'prefixItems'];
const mapSchemaKeywords = [
  '$defs',
  'definitions',
  'dependentSchemas',
  'patternProperties',
  'properties',
];

function getObjectProperties(
  node: ObjectExpression,
  scopeManager: Scope.ScopeManager,
): ObjectProperties | null {
  if (hasUnresolvedObjectSpread(node, scopeManager)) {
    return null;
  }

  const properties = new Map<string, Property>();
  for (const property of evaluateObjectProperties(node, scopeManager)) {
    if (property.type !== 'Property' || property.computed) {
      return null;
    }
    const key = getKeyName(property);
    if (key === null) {
      return null;
    }
    properties.set(key, property);
  }
  return properties;
}

function isStaticallyInspectable(
  node: Node,
  scope: Scope.Scope,
  scopeManager: Scope.ScopeManager,
  visited = new Set<Node>(),
): boolean {
  if (visited.has(node)) {
    return true;
  }
  visited.add(node);

  if (node.type === 'Literal') {
    return true;
  }
  if (node.type === 'ObjectExpression') {
    const properties = getObjectProperties(node, scopeManager);
    return (
      properties !== null &&
      [...properties.values()].every((property) =>
        isStaticallyInspectable(property.value, scope, scopeManager, visited),
      )
    );
  }
  if (node.type === 'ArrayExpression') {
    return node.elements.every(
      (element) =>
        element !== null &&
        element.type !== 'SpreadElement' &&
        isStaticallyInspectable(element, scope, scopeManager, visited),
    );
  }
  if (
    node.type === 'CallExpression' ||
    node.type === 'ConditionalExpression' ||
    node.type === 'LogicalExpression'
  ) {
    return false;
  }
  return getStaticValue(node, scope) !== null;
}

function getPropertyStaticValue(
  property: Property | undefined,
  scope: Scope.Scope,
): unknown {
  return property ? getStaticValue(property.value, scope)?.value : undefined;
}

function hasType(
  properties: ObjectProperties,
  expectedType: string,
  scope: Scope.Scope,
): boolean {
  const value = getPropertyStaticValue(properties.get('type'), scope);
  return (
    value === expectedType ||
    (Array.isArray(value) && value.includes(expectedType))
  );
}

function hasUnknownKeyword(properties: ObjectProperties): boolean {
  return [...properties.keys()].some((key) => !knownKeywords.has(key));
}

function hasTypeAlternative(properties: ObjectProperties): boolean {
  return [...typeAlternativeKeywords].some((key) => properties.has(key));
}

function getArrayElements(property: Property | undefined): Node[] | null {
  if (!property || property.value.type !== 'ArrayExpression') {
    return null;
  }
  return property.value.elements.filter(
    (element): element is NonNullable<typeof element> =>
      element !== null && element.type !== 'SpreadElement',
  );
}

function hasItemConstraint(
  properties: ObjectProperties,
  scopeManager: Scope.ScopeManager,
  seen = new Set<ObjectExpression>(),
): boolean {
  if (properties.has('items') || properties.has('prefixItems')) {
    return true;
  }
  if (
    ['$ref', '$dynamicRef', '$recursiveRef', 'if', 'not'].some((key) =>
      properties.has(key),
    )
  ) {
    return true;
  }

  const allOf = getArrayElements(properties.get('allOf'));
  if (
    allOf?.some((branch) => {
      if (branch.type !== 'ObjectExpression' || seen.has(branch)) {
        return false;
      }
      const branchProperties = getObjectProperties(branch, scopeManager);
      if (!branchProperties) {
        return true;
      }
      const nextSeen = new Set(seen).add(branch);
      return hasItemConstraint(branchProperties, scopeManager, nextSeen);
    })
  ) {
    return true;
  }

  for (const keyword of ['anyOf', 'oneOf']) {
    const branches = getArrayElements(properties.get(keyword));
    if (
      branches &&
      branches.length > 0 &&
      branches.every((branch) => {
        if (branch.type !== 'ObjectExpression' || seen.has(branch)) {
          return false;
        }
        const branchProperties = getObjectProperties(branch, scopeManager);
        if (!branchProperties) {
          return true;
        }
        const nextSeen = new Set(seen).add(branch);
        return hasItemConstraint(branchProperties, scopeManager, nextSeen);
      })
    ) {
      return true;
    }
  }
  return false;
}

function getChildSchemas(
  properties: ObjectProperties,
  scopeManager: Scope.ScopeManager,
): ObjectExpression[] {
  const children: ObjectExpression[] = [];
  const addObject = (node: Node) => {
    if (node.type === 'ObjectExpression') {
      children.push(node);
    }
  };

  for (const keyword of directSchemaKeywords) {
    const property = properties.get(keyword);
    if (property) {
      addObject(property.value);
    }
  }

  const items = properties.get('items');
  if (items?.value.type === 'ArrayExpression') {
    for (const element of items.value.elements) {
      if (element && element.type !== 'SpreadElement') {
        addObject(element);
      }
    }
  } else if (items) {
    addObject(items.value);
  }

  const extendsProperty = properties.get('extends');
  if (extendsProperty?.value.type === 'ArrayExpression') {
    for (const element of extendsProperty.value.elements) {
      if (element && element.type !== 'SpreadElement') {
        addObject(element);
      }
    }
  } else if (extendsProperty) {
    addObject(extendsProperty.value);
  }

  for (const keyword of arraySchemaKeywords) {
    for (const element of getArrayElements(properties.get(keyword)) ?? []) {
      addObject(element);
    }
  }

  for (const keyword of mapSchemaKeywords) {
    const property = properties.get(keyword);
    if (property?.value.type !== 'ObjectExpression') {
      continue;
    }
    const mapProperties = getObjectProperties(property.value, scopeManager);
    if (!mapProperties) {
      continue;
    }
    for (const child of mapProperties.values()) {
      addObject(child.value);
    }
  }

  const dependencies = properties.get('dependencies');
  if (dependencies?.value.type === 'ObjectExpression') {
    const dependencyProperties = getObjectProperties(
      dependencies.value,
      scopeManager,
    );
    if (dependencyProperties) {
      for (const child of dependencyProperties.values()) {
        if (child.value.type !== 'ArrayExpression') {
          addObject(child.value);
        }
      }
    }
  }

  return children;
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow incomplete rule options schemas',
      category: 'Rules',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-incomplete-schema.md',
    },
    schema: [
      {
        type: 'object',
        properties: {
          checks: {
            type: 'object',
            description: 'Which schema completeness checks to enforce.',
            properties: {
              rootEmptySchema: {
                type: 'boolean',
                description: 'Whether to reject an empty object-form schema.',
              },
              rootBareArraySchema: {
                type: 'boolean',
                description:
                  'Whether to reject an object-form schema that only asserts an array type.',
              },
              rootWrongOptionsType: {
                type: 'boolean',
                description:
                  'Whether to reject an object-form schema that excludes arrays.',
              },
              rootObjectKeywordNoop: {
                type: 'boolean',
                description:
                  'Whether to reject an object-form schema with no array-applicable keyword.',
              },
              objectAdditionalPropertiesExplicit: {
                type: 'boolean',
                description:
                  'Whether object schemas must state an additionalProperties policy.',
              },
              tupleAdditionalItems: {
                type: 'boolean',
                description:
                  'Whether tuple schemas must prevent unconstrained additional items.',
              },
              arrayItems: {
                type: 'boolean',
                description:
                  'Whether array schemas must constrain their items.',
              },
              arrayItemType: {
                type: 'boolean',
                description:
                  'Whether array item schemas must constrain their type.',
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
      emptySchema:
        '`meta.schema: {}` does not validate any rule options; use `false` to opt out explicitly.',
      bareArraySchema:
        'This schema allows every rule-options array; add constraints or use `false` to opt out.',
      wrongOptionsType:
        'An object-form `meta.schema` must validate the rule-options array.',
      ineffectiveRootSchema:
        'This schema has no keyword that can constrain the rule-options array.',
      missingAdditionalProperties:
        'State an explicit `additionalProperties` policy for this object schema.',
      unboundedTuple:
        'Bound tuple items with `additionalItems: false` or an equivalent `maxItems`.',
      missingItems: 'Specify an `items` schema for this array.',
      missingItemType:
        'Specify the item type or a recognized type-constraining alternative.',
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

        const visitSchema = (
          schema: ObjectExpression,
          seen: Set<ObjectExpression>,
        ) => {
          if (seen.has(schema)) {
            return;
          }
          seen.add(schema);

          const properties = getObjectProperties(schema, scopeManager);
          if (!properties) {
            return;
          }

          if (
            hasType(properties, 'object', scope) &&
            checks.objectAdditionalPropertiesExplicit &&
            !properties.has('additionalProperties')
          ) {
            context.report({
              node: schema,
              messageId: 'missingAdditionalProperties',
            });
          }

          if (hasType(properties, 'array', scope)) {
            const itemsProperty = properties.get('items');
            if (itemsProperty?.value.type === 'ArrayExpression') {
              const additionalItems = getPropertyStaticValue(
                properties.get('additionalItems'),
                scope,
              );
              const maxItems = getPropertyStaticValue(
                properties.get('maxItems'),
                scope,
              );
              if (
                checks.tupleAdditionalItems &&
                additionalItems !== false &&
                (!Number.isInteger(maxItems) ||
                  (maxItems as number) > itemsProperty.value.elements.length)
              ) {
                context.report({
                  node: schema,
                  messageId: 'unboundedTuple',
                });
              }
            }

            if (
              checks.arrayItems &&
              !hasItemConstraint(properties, scopeManager)
            ) {
              context.report({ node: schema, messageId: 'missingItems' });
            }

            if (checks.arrayItemType) {
              const items = itemsProperty
                ? itemsProperty.value.type === 'ArrayExpression'
                  ? itemsProperty.value.elements.filter(
                      (element): element is ObjectExpression =>
                        element?.type === 'ObjectExpression',
                    )
                  : itemsProperty.value.type === 'ObjectExpression'
                    ? [itemsProperty.value]
                    : []
                : [];
              for (const item of items) {
                const itemProperties = getObjectProperties(item, scopeManager);
                if (
                  itemProperties &&
                  !itemProperties.has('type') &&
                  !hasTypeAlternative(itemProperties) &&
                  !hasUnknownKeyword(itemProperties)
                ) {
                  context.report({
                    node: item,
                    messageId: 'missingItemType',
                  });
                }
              }
            }
          }

          for (const child of getChildSchemas(properties, scopeManager)) {
            visitSchema(child, seen);
          }
        };

        const seen = new Set<ObjectExpression>();
        if (schemaValue.type === 'ObjectExpression') {
          const rootProperties = getObjectProperties(schemaValue, scopeManager);
          if (!rootProperties) {
            return;
          }

          const keys = [...rootProperties.keys()];
          const assertionKeys = keys.filter((key) => !annotations.has(key));
          let rootDefect:
            | 'emptySchema'
            | 'bareArraySchema'
            | 'wrongOptionsType'
            | 'ineffectiveRootSchema'
            | null = null;
          let rootCheck: keyof Checks | null = null;

          if (keys.length === 0) {
            rootDefect = 'emptySchema';
            rootCheck = 'rootEmptySchema';
          } else if (
            getPropertyStaticValue(rootProperties.get('type'), scope) ===
              'array' &&
            assertionKeys.length === 1 &&
            assertionKeys[0] === 'type'
          ) {
            rootDefect = 'bareArraySchema';
            rootCheck = 'rootBareArraySchema';
          } else if (
            rootProperties.has('type') &&
            !hasType(rootProperties, 'array', scope)
          ) {
            rootDefect = 'wrongOptionsType';
            rootCheck = 'rootWrongOptionsType';
          } else if (
            !hasUnknownKeyword(rootProperties) &&
            !assertionKeys.some((key) => arrayApplicableKeywords.has(key))
          ) {
            rootDefect = 'ineffectiveRootSchema';
            rootCheck = 'rootObjectKeywordNoop';
          }

          if (rootDefect && rootCheck) {
            if (checks[rootCheck]) {
              context.report({ node: schemaValue, messageId: rootDefect });
            }
            return;
          }
          visitSchema(schemaValue, seen);
          return;
        }

        for (const element of schemaValue.elements) {
          if (element?.type === 'ObjectExpression') {
            visitSchema(element, seen);
          }
        }
      },
    };
  },
};

export default rule;
