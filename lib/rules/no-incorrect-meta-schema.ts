/**
 * @fileoverview Disallow rule options schema constructs that ESLint ignores.
 * @author morgan-coded
 */
import type { Rule, Scope } from 'eslint';
import type { ArrayExpression, Node, ObjectExpression } from 'estree';

import {
  getMetaSchemaNode,
  getMetaSchemaNodeProperty,
  getRuleInfo,
  hasUnresolvedObjectSpread,
} from '../utils.ts';
import {
  annotations,
  classifyMetaSchemaKeyword,
  getChildSchemas,
  getObjectProperties,
  getPropertyStaticValue,
  hasInertKeywordUse,
  hasOnlyArrayType,
  hasType,
  isStaticallyInspectable,
  resolveArrayExpression,
  resolveObjectExpression,
  type ObjectProperties,
} from './meta-schema-utils.ts';

const defaultChecks = {
  emptyRoot: true,
  bareArrayRoot: true,
  nonArrayRootType: true,
  nonConstrainingRoot: true,
  ignoredKeywords: true,
  ignoredRefSiblings: true,
  unresolvedRefs: true,
  ignoredAdditionalItems: true,
  incompatibleTypeKeywords: true,
  impossibleBounds: true,
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

function hasUnknownKeyword(properties: ObjectProperties): boolean {
  return [...properties.keys()].some(
    (key) => classifyMetaSchemaKeyword(key) === 'unknown',
  );
}

const refContainerKeywords = new Set([...annotations, '$defs', 'definitions']);

const typeKeywordGroups = [
  {
    keywords: new Set([
      'additionalItems',
      'contains',
      'items',
      'maxItems',
      'minItems',
      'uniqueItems',
    ]),
    types: new Set(['array']),
  },
  {
    keywords: new Set([
      'additionalProperties',
      'dependencies',
      'maxProperties',
      'minProperties',
      'patternProperties',
      'properties',
      'propertyNames',
      'required',
    ]),
    types: new Set(['object']),
  },
  {
    keywords: new Set([
      'contentEncoding',
      'contentMediaType',
      'format',
      'maxLength',
      'minLength',
      'pattern',
    ]),
    types: new Set(['string']),
  },
  {
    keywords: new Set([
      'exclusiveMaximum',
      'exclusiveMinimum',
      'maximum',
      'minimum',
      'multipleOf',
    ]),
    types: new Set(['integer', 'number']),
  },
];

function hasIgnoredKeyword(
  properties: ObjectProperties,
  scope: Scope.Scope,
): boolean {
  return hasInertKeywordUse(properties, scope);
}

function hasIgnoredRefSibling(properties: ObjectProperties): boolean {
  return (
    properties.has('$ref') &&
    [...properties.keys()].some(
      (key) => key !== '$ref' && !refContainerKeywords.has(key),
    )
  );
}

type ReferenceRoot = ArrayExpression | ObjectExpression;
type ReferenceScope = {
  baseUri: string | null;
  resourceRoot: ReferenceRoot;
};
type ReferenceIndex = Map<string, ObjectExpression>;
type VirtualArraySchemaRoot = {
  schema: ArrayExpression;
};

const referenceResolutionBase = 'resolve://eslint-schema/';

function normalizeReferenceId(uri: string): string {
  return uri.replace(/#\/?$/u, '');
}

function resolveReferenceUri(
  reference: string,
  baseUri: string | null,
): string | null {
  try {
    const base = baseUri
      ? new URL(baseUri, referenceResolutionBase)
      : new URL(referenceResolutionBase);
    const resolved = new URL(reference, base);
    if (
      resolved.protocol === 'resolve:' &&
      resolved.hostname === 'eslint-schema'
    ) {
      const path = resolved.pathname === '/' ? '' : resolved.pathname.slice(1);
      return `${path}${resolved.search}${resolved.hash}`;
    }
    return resolved.href;
  } catch {
    return null;
  }
}

function getDocumentUri(uri: string): string {
  const hashIndex = uri.indexOf('#');
  return hashIndex === -1 ? uri : uri.slice(0, hashIndex);
}

function getUriFragment(uri: string): string {
  const hashIndex = uri.indexOf('#');
  return hashIndex === -1 ? '' : uri.slice(hashIndex);
}

function getSchemaIdentifier(
  properties: ObjectProperties,
  scope: Scope.Scope,
): string | null {
  const dollarId = getPropertyStaticValue(properties.get('$id'), scope);
  const id = getPropertyStaticValue(properties.get('id'), scope);
  if (typeof dollarId === 'string' && dollarId) {
    return dollarId;
  }
  return typeof id === 'string' && id ? id : null;
}

function getReferenceScope(
  schema: ObjectExpression,
  properties: ObjectProperties,
  parent: ReferenceScope,
  scope: Scope.Scope,
): ReferenceScope {
  const identifier = getSchemaIdentifier(properties, scope);
  if (identifier === null) {
    return parent;
  }

  const resolved = resolveReferenceUri(identifier, parent.baseUri);
  if (resolved === null) {
    return parent;
  }
  const fragment = getUriFragment(resolved);
  return {
    baseUri: normalizeReferenceId(resolved),
    resourceRoot:
      fragment === '' || fragment === '#' || fragment === '#/'
        ? schema
        : parent.resourceRoot,
  };
}

const idSingleSchemaKeywords = new Set([
  'additionalItems',
  'additionalProperties',
  'contains',
  'items',
  'not',
  'propertyNames',
]);
const idArraySchemaKeywords = new Set(['allOf', 'anyOf', 'items', 'oneOf']);
const idMapSchemaKeywords = new Set([
  'definitions',
  'dependencies',
  'patternProperties',
  'properties',
]);
const idTraversalSkipKeywords = new Set([
  'const',
  'default',
  'enum',
  'exclusiveMaximum',
  'exclusiveMinimum',
  'format',
  'maxItems',
  'maxLength',
  'maxProperties',
  'maximum',
  'minItems',
  'minLength',
  'minProperties',
  'minimum',
  'multipleOf',
  'pattern',
  'required',
  'uniqueItems',
]);

function buildReferenceIndex(
  root: ReferenceRoot,
  initialScope: ReferenceScope,
  scope: Scope.Scope,
  scopeManager: Scope.ScopeManager,
): ReferenceIndex {
  const index: ReferenceIndex = new Map();
  const visitedScopes = new Map<ObjectExpression, Set<string>>();

  const visit = (schema: ObjectExpression, parent: ReferenceScope) => {
    const properties = getObjectProperties(schema, scopeManager);
    if (!properties) {
      return;
    }
    const referenceScope = getReferenceScope(schema, properties, parent, scope);
    const scopeKey = referenceScope.baseUri ?? '';
    const schemaScopes = visitedScopes.get(schema) ?? new Set<string>();
    if (schemaScopes.has(scopeKey)) {
      return;
    }
    schemaScopes.add(scopeKey);
    visitedScopes.set(schema, schemaScopes);

    const identifier = getSchemaIdentifier(properties, scope);
    if (identifier !== null) {
      const resolved = resolveReferenceUri(identifier, parent.baseUri);
      if (resolved !== null) {
        const key = normalizeReferenceId(resolved);
        if (!index.has(key)) {
          index.set(key, schema);
        }
      }
    }

    for (const [keyword, property] of properties) {
      const array = resolveArrayExpression(property.value, scopeManager);
      if (array) {
        if (idArraySchemaKeywords.has(keyword)) {
          for (const element of array.elements) {
            if (!element || element.type === 'SpreadElement') {
              continue;
            }
            const child = resolveObjectExpression(element, scopeManager);
            if (child) {
              visit(child, referenceScope);
            }
          }
        }
        continue;
      }

      if (idMapSchemaKeywords.has(keyword)) {
        const map = resolveObjectExpression(property.value, scopeManager);
        const mapProperties = map
          ? getObjectProperties(map, scopeManager)
          : null;
        for (const childProperty of mapProperties?.values() ?? []) {
          const child = resolveObjectExpression(
            childProperty.value,
            scopeManager,
          );
          if (child) {
            visit(child, referenceScope);
          }
        }
        continue;
      }

      if (
        idSingleSchemaKeywords.has(keyword) ||
        !idTraversalSkipKeywords.has(keyword)
      ) {
        const child = resolveObjectExpression(property.value, scopeManager);
        if (child) {
          visit(child, referenceScope);
        }
      }
    }
  };

  if (root.type === 'ObjectExpression') {
    visit(root, initialScope);
  } else {
    for (const element of root.elements) {
      if (!element || element.type === 'SpreadElement') {
        continue;
      }
      const child = resolveObjectExpression(element, scopeManager);
      if (child) {
        visit(child, initialScope);
      }
    }
  }

  return index;
}

function resolveJsonPointer(
  fragment: string,
  resourceRoot: ReferenceRoot,
  scopeManager: Scope.ScopeManager,
): boolean {
  if (fragment === '#') {
    return true;
  }
  if (!fragment?.startsWith('#/')) {
    return false;
  }

  let pointer: string;
  try {
    pointer = decodeURIComponent(fragment.slice(2));
  } catch {
    return false;
  }

  let current: Node | VirtualArraySchemaRoot =
    resourceRoot.type === 'ArrayExpression'
      ? { schema: resourceRoot }
      : resourceRoot;
  const segments = pointer.split('/');
  for (const [index, rawSegment] of segments.entries()) {
    const segment = rawSegment.replaceAll('~1', '/').replaceAll('~0', '~');
    if ('schema' in current) {
      if (segment === 'items') {
        current = current.schema;
        continue;
      }
      return (
        index === segments.length - 1 &&
        ['maxItems', 'minItems', 'type'].includes(segment)
      );
    }
    const resolvedObject = resolveObjectExpression(current, scopeManager);
    if (resolvedObject) {
      const properties = getObjectProperties(resolvedObject, scopeManager);
      const property = properties?.get(segment);
      if (!property) {
        return false;
      }
      current = property.value;
      continue;
    }
    const resolvedArray = resolveArrayExpression(current, scopeManager);
    if (resolvedArray && /^\d+$/u.test(segment)) {
      const element: Node | null | undefined =
        resolvedArray.elements[Number(segment)];
      if (!element) {
        return false;
      }
      current = element;
      continue;
    }
    return false;
  }
  return true;
}

function resolveLocalReference(
  reference: string,
  referenceScope: ReferenceScope,
  referenceIndex: ReferenceIndex,
  scopeManager: Scope.ScopeManager,
): boolean {
  const resolved = resolveReferenceUri(reference, referenceScope.baseUri);
  if (resolved === null) {
    return false;
  }
  if (referenceIndex.has(normalizeReferenceId(resolved))) {
    return true;
  }

  const fragment = getUriFragment(resolved) || '#';
  const targetDocument = normalizeReferenceId(getDocumentUri(resolved));
  const currentDocument = normalizeReferenceId(
    getDocumentUri(referenceScope.baseUri ?? ''),
  );
  const resourceRoot =
    targetDocument === currentDocument
      ? referenceScope.resourceRoot
      : referenceIndex.get(targetDocument);
  return resourceRoot
    ? resolveJsonPointer(fragment, resourceRoot, scopeManager)
    : false;
}

function hasUnresolvedRef(
  properties: ObjectProperties,
  referenceScope: ReferenceScope,
  referenceIndex: ReferenceIndex,
  scope: Scope.Scope,
  scopeManager: Scope.ScopeManager,
): boolean {
  const reference = getPropertyStaticValue(properties.get('$ref'), scope);
  return (
    typeof reference === 'string' &&
    !resolveLocalReference(
      reference,
      referenceScope,
      referenceIndex,
      scopeManager,
    )
  );
}

function hasIgnoredAdditionalItems(
  properties: ObjectProperties,
  scope: Scope.Scope,
): boolean {
  return (
    properties.has('additionalItems') &&
    !Array.isArray(getPropertyStaticValue(properties.get('items'), scope))
  );
}

function getDeclaredTypes(
  properties: ObjectProperties,
  scope: Scope.Scope,
): Set<string> | null {
  const value = getPropertyStaticValue(properties.get('type'), scope);
  if (typeof value === 'string') {
    return new Set([value]);
  }
  if (Array.isArray(value) && value.every((type) => typeof type === 'string')) {
    return new Set(value);
  }
  return null;
}

function hasIncompatibleTypeKeyword(
  properties: ObjectProperties,
  scope: Scope.Scope,
): boolean {
  const declaredTypes = getDeclaredTypes(properties, scope);
  if (!declaredTypes) {
    return false;
  }

  for (const group of typeKeywordGroups) {
    const hasKeyword = [...group.keywords].some((keyword) => {
      if (
        keyword === 'required' &&
        getPropertyStaticValue(properties.get(keyword), scope) === true
      ) {
        return false;
      }
      if (
        keyword === 'additionalItems' &&
        hasIgnoredAdditionalItems(properties, scope)
      ) {
        return false;
      }
      return properties.has(keyword);
    });
    if (
      hasKeyword &&
      ![...declaredTypes].some((type) => group.types.has(type))
    ) {
      return true;
    }
  }
  return false;
}

function hasImpossibleBounds(
  properties: ObjectProperties,
  scope: Scope.Scope,
): boolean {
  for (const [minimumKey, maximumKey] of [
    ['minItems', 'maxItems'],
    ['minLength', 'maxLength'],
    ['minProperties', 'maxProperties'],
  ]) {
    const minimum = getPropertyStaticValue(properties.get(minimumKey), scope);
    const maximum = getPropertyStaticValue(properties.get(maximumKey), scope);
    if (
      typeof minimum === 'number' &&
      typeof maximum === 'number' &&
      minimum > maximum
    ) {
      return true;
    }
  }

  const minimum = getPropertyStaticValue(properties.get('minimum'), scope);
  const maximum = getPropertyStaticValue(properties.get('maximum'), scope);
  const exclusiveMinimum = getPropertyStaticValue(
    properties.get('exclusiveMinimum'),
    scope,
  );
  const exclusiveMaximum = getPropertyStaticValue(
    properties.get('exclusiveMaximum'),
    scope,
  );
  const lower =
    typeof exclusiveMinimum === 'number'
      ? { inclusive: false, value: exclusiveMinimum }
      : typeof minimum === 'number'
        ? { inclusive: exclusiveMinimum !== true, value: minimum }
        : null;
  const upper =
    typeof exclusiveMaximum === 'number'
      ? { inclusive: false, value: exclusiveMaximum }
      : typeof maximum === 'number'
        ? { inclusive: exclusiveMaximum !== true, value: maximum }
        : null;

  return (
    lower !== null &&
    upper !== null &&
    (lower.value > upper.value ||
      (lower.value === upper.value && (!lower.inclusive || !upper.inclusive)))
  );
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow rule options schema constructs that ESLint ignores',
      category: 'Rules',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-incorrect-meta-schema.md',
    },
    schema: [
      {
        type: 'object',
        properties: {
          checks: {
            type: 'object',
            description: 'Which ineffective-schema checks to enforce.',
            properties: {
              emptyRoot: {
                type: 'boolean',
                description: 'Whether to reject an empty object-form schema.',
              },
              bareArrayRoot: {
                type: 'boolean',
                description:
                  'Whether to reject an object-form schema that only asserts an array type.',
              },
              nonArrayRootType: {
                type: 'boolean',
                description:
                  'Whether to reject an object-form schema that excludes arrays.',
              },
              nonConstrainingRoot: {
                type: 'boolean',
                description:
                  'Whether to reject an object-form schema with no array-applicable keyword.',
              },
              ignoredKeywords: {
                type: 'boolean',
                description:
                  'Whether to reject keywords ignored by ESLint’s configured Ajv.',
              },
              ignoredRefSiblings: {
                type: 'boolean',
                description:
                  'Whether to reject constraint siblings ignored beside $ref.',
              },
              unresolvedRefs: {
                type: 'boolean',
                description:
                  'Whether to reject references ESLint cannot resolve.',
              },
              ignoredAdditionalItems: {
                type: 'boolean',
                description:
                  'Whether to reject additionalItems when items is not tuple-form.',
              },
              incompatibleTypeKeywords: {
                type: 'boolean',
                description:
                  'Whether to reject keywords incompatible with the declared type.',
              },
              impossibleBounds: {
                type: 'boolean',
                description:
                  'Whether to reject contradictory minimum and maximum bounds.',
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
      emptyRoot:
        '`meta.schema: {}` does not validate any rule options; use `false` to opt out explicitly.',
      bareArrayRoot:
        'This schema allows every rule-options array; add constraints or use `false` to opt out.',
      nonArrayRootType:
        'An object-form `meta.schema` must validate the rule-options array.',
      nonConstrainingRoot:
        'This schema has no keyword that can constrain the rule-options array.',
      ignoredKeywords:
        'This schema uses a keyword that ESLint’s configured Ajv ignores.',
      ignoredRefSiblings:
        'This schema has a `$ref` sibling that ESLint’s configured Ajv ignores.',
      unresolvedRefs:
        'This schema has a `$ref` that ESLint’s configured Ajv cannot resolve.',
      ignoredAdditionalItems:
        '`additionalItems` is ignored unless `items` is tuple-form.',
      incompatibleTypeKeywords:
        'This schema has a keyword that cannot apply to its declared type.',
      impossibleBounds:
        'This schema has minimum and maximum bounds that no value can satisfy.',
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

        const initialReferenceScope: ReferenceScope = {
          baseUri: null,
          resourceRoot: schemaValue,
        };
        const referenceIndex = buildReferenceIndex(
          schemaValue,
          initialReferenceScope,
          scope,
          scopeManager,
        );
        const seen = new Set<ObjectExpression>();
        const visitSchema = (
          schema: ObjectExpression,
          parentReferenceScope: ReferenceScope,
        ) => {
          if (seen.has(schema)) {
            return;
          }
          seen.add(schema);

          const properties = getObjectProperties(schema, scopeManager)!;
          const referenceScope = getReferenceScope(
            schema,
            properties,
            parentReferenceScope,
            scope,
          );

          if (checks.ignoredKeywords && hasIgnoredKeyword(properties, scope)) {
            context.report({ node: schema, messageId: 'ignoredKeywords' });
          }
          if (checks.ignoredRefSiblings && hasIgnoredRefSibling(properties)) {
            context.report({ node: schema, messageId: 'ignoredRefSiblings' });
          }
          if (
            checks.unresolvedRefs &&
            hasUnresolvedRef(
              properties,
              referenceScope,
              referenceIndex,
              scope,
              scopeManager,
            )
          ) {
            context.report({ node: schema, messageId: 'unresolvedRefs' });
          }
          if (properties.has('$ref')) {
            return;
          }
          if (
            checks.ignoredAdditionalItems &&
            hasIgnoredAdditionalItems(properties, scope)
          ) {
            context.report({
              node: schema,
              messageId: 'ignoredAdditionalItems',
            });
          }
          if (
            checks.incompatibleTypeKeywords &&
            hasIncompatibleTypeKeyword(properties, scope)
          ) {
            context.report({
              node: schema,
              messageId: 'incompatibleTypeKeywords',
            });
          }
          if (
            checks.impossibleBounds &&
            hasImpossibleBounds(properties, scope)
          ) {
            context.report({ node: schema, messageId: 'impossibleBounds' });
          }

          for (const child of getChildSchemas(
            properties,
            scopeManager,
            'correctness',
          )) {
            visitSchema(child.schema, referenceScope);
          }
        };

        if (schemaValue.type === 'ObjectExpression') {
          const rootProperties = getObjectProperties(
            schemaValue,
            scopeManager,
          )!;

          const keys = [...rootProperties.keys()];
          const assertionKeys = keys.filter((key) => !annotations.has(key));
          let rootDefect:
            | 'emptyRoot'
            | 'bareArrayRoot'
            | 'nonArrayRootType'
            | 'nonConstrainingRoot'
            | null = null;
          let rootCheck: keyof Checks | null = null;

          if (keys.length === 0) {
            rootDefect = 'emptyRoot';
            rootCheck = 'emptyRoot';
          } else if (
            hasOnlyArrayType(rootProperties, scope) &&
            assertionKeys.length === 1 &&
            assertionKeys[0] === 'type'
          ) {
            rootDefect = 'bareArrayRoot';
            rootCheck = 'bareArrayRoot';
          } else if (
            rootProperties.has('type') &&
            !hasType(rootProperties, 'array', scope)
          ) {
            rootDefect = 'nonArrayRootType';
            rootCheck = 'nonArrayRootType';
          } else if (
            !hasUnknownKeyword(rootProperties) &&
            !assertionKeys.some((key) => arrayApplicableKeywords.has(key))
          ) {
            rootDefect = 'nonConstrainingRoot';
            rootCheck = 'nonConstrainingRoot';
          }

          if (rootDefect && rootCheck && checks[rootCheck]) {
            context.report({ node: schemaValue, messageId: rootDefect });
            return;
          }
          visitSchema(schemaValue, initialReferenceScope);
          return;
        }

        for (const element of schemaValue.elements) {
          const resolvedElement = resolveObjectExpression(
            element!,
            scopeManager,
          );
          if (resolvedElement) {
            visitSchema(resolvedElement, initialReferenceScope);
          }
        }
      },
    };
  },
};

export default rule;
