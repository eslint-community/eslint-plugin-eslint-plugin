import { findVariable, getStaticValue } from '@eslint-community/eslint-utils';
import type { Scope } from 'eslint';
import type { Node, ObjectExpression, Property } from 'estree';

import {
  evaluateObjectProperties,
  getKeyName,
  hasUnresolvedObjectSpread,
} from '../utils.ts';

export type ChildSchema = {
  checkPositionalNoop: boolean;
  schema: ObjectExpression;
};
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
// behavior is draft-07, so these newer-draft keywords are known but ignored.
export const ignoredByAjv6Keywords = new Set([
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

export function resolveObjectExpression(
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

export function getPropertyStaticValue(
  property: Property | undefined,
  scope: Scope.Scope,
): unknown {
  return property ? getStaticValue(property.value, scope)?.value : undefined;
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

  const items = properties.get('items');
  if (items?.value.type === 'ArrayExpression') {
    for (const element of items.value.elements) {
      addObject(element!, true);
    }
  } else if (items) {
    addObject(items.value);
  }

  const extendsProperty = properties.get('extends');
  if (extendsProperty?.value.type === 'ArrayExpression') {
    for (const element of extendsProperty.value.elements) {
      addObject(element!);
    }
  } else if (extendsProperty) {
    addObject(extendsProperty.value);
  }

  for (const keyword of ['allOf', 'anyOf', 'oneOf']) {
    for (const element of getArrayElements(properties.get(keyword)) ?? []) {
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
    if (property?.value.type !== 'ObjectExpression') {
      continue;
    }
    const mapProperties = getObjectProperties(property.value, scopeManager)!;
    for (const child of mapProperties.values()) {
      addObject(child.value);
    }
  }

  const dependencies = properties.get('dependencies');
  if (dependencies?.value.type === 'ObjectExpression') {
    const dependencyProperties = getObjectProperties(
      dependencies.value,
      scopeManager,
    )!;
    for (const child of dependencyProperties.values()) {
      if (child.value.type !== 'ArrayExpression') {
        addObject(child.value);
      }
    }
  }

  return children;
}
