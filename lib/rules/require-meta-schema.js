'use strict';

const { findVariable } = require('eslint-utils');
const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require rules to implement a `meta.schema` property',
      category: 'Rules',
      recommended: false, // TODO: enable it in a major release.
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          exceptRange: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      foundOptionsUsage: '`meta.schema` has no schema defined but rule has options.',
      missing: '`meta.schema` is required (use [] if rule has no schema).',
      wrongType: '`meta.schema` should be an array or object (use [] if rule has no schema).',
    },
  },

  create (context) {
    const sourceCode = context.getSourceCode();
    const { scopeManager } = sourceCode;
    const info = utils.getRuleInfo(sourceCode);
    if (info === null || info.meta === null) {
      return {};
    }

    let contextIdentifiers;
    let hasEmptySchema = false;
    let schemaNode;

    return {
      Program (ast) {
        contextIdentifiers = utils.getContextIdentifiers(context, ast);

        const metaNode = info.meta;
        schemaNode =
          metaNode &&
          metaNode.properties &&
          metaNode.properties.find(p => p.type === 'Property' && utils.getKeyName(p) === 'schema');

        if (!schemaNode) {
          context.report({
            node: metaNode,
            messageId: 'missing',
            fix (fixer) {
              return utils.insertProperty(fixer, metaNode, 'schema: []', sourceCode);
            },
          });
          return;
        }

        let { value } = schemaNode;
        if (value.type === 'Identifier' && value.name !== 'undefined') {
          const variable = findVariable(
            scopeManager.acquire(value) || scopeManager.globalScope,
            value
          );

          // If we can't find the declarator, we have to assume it's in correct type
          if (
            !variable ||
            !variable.defs ||
            !variable.defs[0] ||
            !variable.defs[0].node ||
            variable.defs[0].node.type !== 'VariableDeclarator' ||
            !variable.defs[0].node.init
          ) {
            return;
          }

          value = variable.defs[0].node.init;
        }

        if (
          (value.type === 'ArrayExpression' && value.elements.length === 0) ||
          (value.type === 'ObjectExpression' && value.properties.length === 0)
        ) {
          // Schema is explicitly defined as having no options.
          hasEmptySchema = true;
        }

        if (!['ArrayExpression', 'ObjectExpression'].includes(value.type)) {
          context.report({ node: value, messageId: 'wrongType' });
        }
      },

      MemberExpression (node) {
        // Check if `context.options` was used when no options were defined in `meta.schema`.
        if (
          hasEmptySchema &&
          node.object.type === 'Identifier' &&
          contextIdentifiers.has(node.object) &&
          node.property.type === 'Identifier' &&
          node.property.name === 'options'
        ) {
          context.report({ node: schemaNode, messageId: 'foundOptionsUsage' });
        }
      },
    };
  },
};
