import { findVariable, getStaticValue } from '@eslint-community/eslint-utils';
import type { Scope } from 'eslint';
import type { ArrayExpression, Node, ObjectExpression, Property } from 'estree';

import {
  evaluateObjectProperties,
  getKeyName,
  hasUnresolvedObjectSpread,
} from '../utils.ts';

export type ChildSchema = {
  checkPositionalNoop: boolean;
  schema: ObjectExpression;
};
export type ChildSchemaTraversalPolicy = 'correctness' | 'policy';
export type ObjectProperties = Map<string, Property>;

export const annotations = new Set([
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
// behavior is draft-07. This list is the single partition source: a key
// cannot appear in both known classes, and every absent key is unknown.
export type KeywordClassification = 'effective' | 'inert' | 'unknown';
type KnownKeywordClassification = Exclude<KeywordClassification, 'unknown'>;

const keywordClassificationEntries = [
  ['$anchor', 'effective'],
  ['$comment', 'effective'],
  ['$defs', 'effective'],
  ['$dynamicAnchor', 'effective'],
  ['$dynamicRef', 'inert'],
  ['$id', 'effective'],
  ['$recursiveAnchor', 'effective'],
  ['$recursiveRef', 'inert'],
  ['$ref', 'effective'],
  ['$schema', 'effective'],
  ['$vocabulary', 'effective'],
  ['additionalItems', 'effective'],
  ['additionalProperties', 'effective'],
  ['allOf', 'effective'],
  ['anyOf', 'effective'],
  ['const', 'effective'],
  ['contains', 'effective'],
  ['contentEncoding', 'effective'],
  ['contentMediaType', 'effective'],
  ['contentSchema', 'inert'],
  ['default', 'effective'],
  ['definitions', 'effective'],
  ['dependencies', 'effective'],
  ['dependentRequired', 'inert'],
  ['dependentSchemas', 'inert'],
  ['deprecated', 'effective'],
  ['description', 'effective'],
  ['disallow', 'inert'],
  ['discriminator', 'inert'],
  ['divisibleBy', 'inert'],
  ['elements', 'inert'],
  ['else', 'effective'],
  ['enum', 'effective'],
  ['examples', 'effective'],
  ['exclusiveMaximum', 'effective'],
  ['exclusiveMinimum', 'effective'],
  ['extends', 'inert'],
  ['format', 'effective'],
  ['id', 'effective'],
  ['if', 'effective'],
  ['items', 'effective'],
  ['maximum', 'effective'],
  ['maxContains', 'inert'],
  ['maxItems', 'effective'],
  ['maxLength', 'effective'],
  ['maxProperties', 'effective'],
  ['minimum', 'effective'],
  ['minContains', 'inert'],
  ['minItems', 'effective'],
  ['minLength', 'effective'],
  ['minProperties', 'effective'],
  ['multipleOf', 'effective'],
  ['not', 'effective'],
  ['oneOf', 'effective'],
  ['optionalProperties', 'inert'],
  ['pattern', 'effective'],
  ['patternProperties', 'effective'],
  ['prefixItems', 'inert'],
  ['properties', 'effective'],
  ['propertyNames', 'effective'],
  ['readOnly', 'effective'],
  ['required', 'effective'],
  ['then', 'effective'],
  ['title', 'effective'],
  ['type', 'effective'],
  ['unevaluatedItems', 'inert'],
  ['unevaluatedProperties', 'inert'],
  ['uniqueItems', 'effective'],
  ['values', 'inert'],
  ['writeOnly', 'effective'],
] as const satisfies readonly (readonly [string, KnownKeywordClassification])[];

const keywordClassifications = new Map<string, KnownKeywordClassification>(
  keywordClassificationEntries,
);
if (keywordClassifications.size !== keywordClassificationEntries.length) {
  throw new Error('Meta-schema keyword classifications must be unique.');
}

export const effectiveKeywords = new Set(
  keywordClassificationEntries
    .filter(([, classification]) => classification === 'effective')
    .map(([keyword]) => keyword),
);

export const inertKeywords = new Set(
  keywordClassificationEntries
    .filter(([, classification]) => classification === 'inert')
    .map(([keyword]) => keyword),
);

export function classifyMetaSchemaKeyword(
  keyword: string,
): KeywordClassification {
  return keywordClassifications.get(keyword) ?? 'unknown';
}

export function getObjectProperties(
  node: ObjectExpression,
  scopeManager: Scope.ScopeManager,
): ObjectProperties | null {
  if (hasUnresolvedObjectSpread(node, scopeManager)) {
    return null;
  }

  const properties = new Map<string, Property>();
  for (const property of evaluateObjectProperties(
    node,
    scopeManager,
  ) as Property[]) {
    if (property.computed) {
      return null;
    }
    properties.set(getKeyName(property)!, property);
  }
  return properties;
}

export function isStaticallyInspectable(
  node: Node,
  scope: Scope.Scope,
  scopeManager: Scope.ScopeManager,
): boolean {
  if (node.type === 'Literal') {
    return true;
  }
  if (node.type === 'ObjectExpression') {
    const properties = getObjectProperties(node, scopeManager);
    return (
      properties !== null &&
      [...properties.values()].every((property) =>
        isStaticallyInspectable(property.value, scope, scopeManager),
      )
    );
  }
  if (node.type === 'ArrayExpression') {
    return node.elements.every(
      (element) =>
        element !== null &&
        element.type !== 'SpreadElement' &&
        isStaticallyInspectable(element, scope, scopeManager),
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

function resolveExpression(
  node: Node,
  scopeManager: Scope.ScopeManager,
  visited: Set<Node>,
): Node | null {
  if (node.type !== 'Identifier') {
    return node;
  }
  if (visited.has(node)) {
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
  return resolveExpression(definition.init, scopeManager, visited);
}

export function resolveObjectExpression(
  node: Node,
  scopeManager: Scope.ScopeManager,
): ObjectExpression | null {
  const resolved = resolveExpression(node, scopeManager, new Set());
  return resolved?.type === 'ObjectExpression' ? resolved : null;
}

export function resolveArrayExpression(
  node: Node,
  scopeManager: Scope.ScopeManager,
): ArrayExpression | null {
  const resolved = resolveExpression(node, scopeManager, new Set());
  return resolved?.type === 'ArrayExpression' ? resolved : null;
}

export function getPropertyStaticValue(
  property: Property | undefined,
  scope: Scope.Scope,
): unknown {
  return property ? getStaticValue(property.value, scope)?.value : undefined;
}

export function hasInertKeywordUse(
  properties: ObjectProperties,
  scope: Scope.Scope,
): boolean {
  const allOf = getPropertyStaticValue(properties.get('allOf'), scope);
  return (
    [...inertKeywords].some((keyword) => properties.has(keyword)) ||
    getPropertyStaticValue(properties.get('required'), scope) === true ||
    (Array.isArray(allOf) && allOf.length === 0)
  );
}

export function hasType(
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

export function hasOnlyArrayType(
  properties: ObjectProperties,
  scope: Scope.Scope,
): boolean {
  const value = getPropertyStaticValue(properties.get('type'), scope);
  return (
    value === 'array' ||
    (Array.isArray(value) && value.length === 1 && value[0] === 'array')
  );
}

export function getArrayElements(
  property: Property | undefined,
): Node[] | null {
  if (!property || property.value.type !== 'ArrayExpression') {
    return null;
  }
  return property.value.elements.filter(
    (element): element is NonNullable<typeof element> =>
      element !== null && element.type !== 'SpreadElement',
  );
}

export function getChildSchemas(
  properties: ObjectProperties,
  scopeManager: Scope.ScopeManager,
  policy: ChildSchemaTraversalPolicy,
): ChildSchema[] {
  const children: ChildSchema[] = [];
  const addObject = (node: Node, checkPositionalNoop = false) => {
    const schema = resolveObjectExpression(node, scopeManager);
    if (schema) {
      children.push({ checkPositionalNoop, schema });
    }
  };

  for (const keyword of [
    'additionalItems',
    'additionalProperties',
    'contains',
    'propertyNames',
  ]) {
    const property = properties.get(keyword);
    if (property) {
      addObject(property.value);
    }
  }

  if (policy === 'correctness') {
    for (const keyword of ['else', 'if', 'not', 'then']) {
      const property = properties.get(keyword);
      if (property) {
        addObject(property.value);
      }
    }
  }

  const items = properties.get('items');
  const itemSchemas = items
    ? resolveArrayExpression(items.value, scopeManager)
    : null;
  if (itemSchemas) {
    for (const element of itemSchemas.elements) {
      addObject(element!, true);
    }
  } else if (items) {
    addObject(items.value);
  }

  for (const keyword of ['allOf', 'anyOf', 'oneOf']) {
    const property = properties.get(keyword);
    const schemas = property
      ? resolveArrayExpression(property.value, scopeManager)
      : null;
    for (const element of schemas?.elements ?? []) {
      if (!element || element.type === 'SpreadElement') {
        continue;
      }
      addObject(element);
    }
  }

  for (const keyword of [
    '$defs',
    'definitions',
    'patternProperties',
    'properties',
  ]) {
    const property = properties.get(keyword);
    if (!property) {
      continue;
    }
    const map = resolveObjectExpression(property.value, scopeManager);
    if (!map) {
      continue;
    }
    const mapProperties = getObjectProperties(map, scopeManager);
    if (!mapProperties) {
      continue;
    }
    for (const child of mapProperties.values()) {
      addObject(child.value);
    }
  }

  const dependencies = properties.get('dependencies');
  if (dependencies) {
    const dependencyMap = resolveObjectExpression(
      dependencies.value,
      scopeManager,
    );
    const dependencyProperties = dependencyMap
      ? getObjectProperties(dependencyMap, scopeManager)
      : null;
    if (!dependencyProperties) {
      return children;
    }
    for (const child of dependencyProperties.values()) {
      if (child.value.type !== 'ArrayExpression') {
        addObject(child.value);
      }
    }
  }

  return children;
}
