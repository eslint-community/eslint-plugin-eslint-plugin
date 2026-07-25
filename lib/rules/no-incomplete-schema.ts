/**
 * @fileoverview Disallow incomplete rule options schemas.
 * @author morgan-coded
 */
import { findVariable, getStaticValue } from '@eslint-community/eslint-utils';
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
type ChildSchema = {
  checkPositionalNoop: boolean;
  schema: ObjectExpression;
};
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

// ESLint 9.39.5's node_modules/eslint/lib/shared/ajv.js constructs ajv@6
// with the draft-04 meta-schema and schemaId: "auto". Its runtime keyword
// behavior is draft-07, so these newer-draft keywords are known but ignored:
// they must neither receive constraint credit nor be traversed.
const ignoredByAjv6Keywords = new Set([
  '$dynamicRef',
  '$recursiveRef',
  'contentSchema',
  'dependentRequired',
  'dependentSchemas',
  'maxContains',
  'minContains',
  'prefixItems',
  'unevaluatedItems',
  'unevaluatedProperties',
]);

const knownKeywords = new Set([
  ...annotations,
  '$anchor',
  '$defs',
  '$dynamicAnchor',
  '$recursiveAnchor',
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
  'definitions',
  'dependencies',
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
  'maximum',
  'maxItems',
  'maxLength',
  'maxProperties',
  'minimum',
  'minItems',
  'minLength',
  'minProperties',
  'multipleOf',
  'not',
  'oneOf',
  'pattern',
  'patternProperties',
  'properties',
  'propertyNames',
  'required',
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

const directSchemaKeywords = [
  'additionalItems',
  'additionalProperties',
  'contains',
  'propertyNames',
];

const arraySchemaKeywords = ['allOf', 'anyOf', 'oneOf'];
const mapSchemaKeywords = [
  '$defs',
  'definitions',
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

function resolveObjectExpression(
  node: Node,
  scopeManager: Scope.ScopeManager,
  visited = new Set<Node>(),
): ObjectExpression | null {
  if (node.type === 'ObjectExpression') {
    return node;
  }
  if (node.type !== 'Identifier' || visited.has(node)) {
    return null;
  }
  visited.add(node);

  const variable = findVariable(
    scopeManager.acquire(node) || scopeManager.globalScope!,
    node,
  );
  const definition = variable?.defs[0]?.node;
  if (definition?.type !== 'VariableDeclarator' || definition.init === null) {
    return null;
  }
  return resolveObjectExpression(definition.init, scopeManager, visited);
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

function hasOnlyArrayType(
  properties: ObjectProperties,
  scope: Scope.Scope,
): boolean {
  const value = getPropertyStaticValue(properties.get('type'), scope);
  return (
    value === 'array' ||
    (Array.isArray(value) && value.length === 1 && value[0] === 'array')
  );
}

function hasUnknownKeyword(properties: ObjectProperties): boolean {
  return [...properties.keys()].some(
    (key) => !knownKeywords.has(key) && !ignoredByAjv6Keywords.has(key),
  );
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
  scope: Scope.Scope,
  scopeManager: Scope.ScopeManager,
  seen = new Set<ObjectExpression>(),
): boolean {
  const items = properties.get('items');
  if (items && getStaticValue(items.value, scope)?.value !== true) {
    return true;
  }
  if (['$ref', 'if', 'not'].some((key) => properties.has(key))) {
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
      return hasItemConstraint(branchProperties, scope, scopeManager, nextSeen);
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
        return hasItemConstraint(
          branchProperties,
          scope,
          scopeManager,
          nextSeen,
        );
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
): ChildSchema[] {
  const children: ChildSchema[] = [];
  const addObject = (node: Node, checkPositionalNoop = false) => {
    if (node.type === 'ObjectExpression') {
      children.push({ checkPositionalNoop, schema: node });
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
        addObject(element, true);
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
          checkPositionalNoop = false,
        ) => {
          if (seen.has(schema)) {
            return;
          }
          seen.add(schema);

          const properties = getObjectProperties(schema, scopeManager);
          if (!properties) {
            return;
          }

          if (checkPositionalNoop) {
            const keys = [...properties.keys()];
            const assertionKeys = keys.filter((key) => !annotations.has(key));
            if (keys.length === 0 && checks.rootEmptySchema) {
              context.report({ node: schema, messageId: 'emptySchema' });
              return;
            }
            if (assertionKeys.length === 0 && checks.rootObjectKeywordNoop) {
              context.report({
                node: schema,
                messageId: 'ineffectiveRootSchema',
              });
              return;
            }
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
                checks.tupleAdditionalItems &&
                additionalItems !== false &&
                !hasAdditionalItemsSchema &&
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
              !hasItemConstraint(properties, scope, scopeManager)
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
            visitSchema(child.schema, seen, child.checkPositionalNoop);
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
            hasOnlyArrayType(rootProperties, scope) &&
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

          if (rootDefect && rootCheck && checks[rootCheck]) {
            context.report({ node: schemaValue, messageId: rootDefect });
            return;
          }
          visitSchema(schemaValue, seen);
          return;
        }

        for (const element of schemaValue.elements) {
          if (element && element.type !== 'SpreadElement') {
            const resolvedElement = resolveObjectExpression(
              element,
              scopeManager,
            );
            if (resolvedElement) {
              visitSchema(resolvedElement, seen, true);
            }
          }
        }
      },
    };
  },
};

export default rule;
