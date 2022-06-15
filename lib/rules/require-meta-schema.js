'use strict';

const { findVariable } = require('eslint-utils');
const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require rules to implement a `meta.schema` property',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-schema.md',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          requireSchemaPropertyWhenOptionless: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      addEmptySchema: 'Add empty schema indicating the rule has no options.',
      foundOptionsUsage:
        '`meta.schema` has no schema defined but rule has options.',
      missing: '`meta.schema` is required (use [] if rule has no schema).',
      wrongType:
        '`meta.schema` should be an array or object (use [] if rule has no schema).',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const { scopeManager } = sourceCode;
    const info = utils.getRuleInfo(sourceCode);
    if (info === null) {
      return {};
    }

    let contextIdentifiers;
    const metaNode = info.meta;
    let schemaNode;

    // Options
    const requireSchemaPropertyWhenOptionless =
      !context.options[0] ||
      context.options[0].requireSchemaPropertyWhenOptionless;

    let hasEmptySchema = false;
    let isUsingOptions = false;

    return {
      Program(ast) {
        contextIdentifiers = utils.getContextIdentifiers(scopeManager, ast);

        schemaNode = utils
          .evaluateObjectProperties(metaNode, scopeManager)
          .find(
            (p) => p.type === 'Property' && utils.getKeyName(p) === 'schema'
          );

        if (!schemaNode) {
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

      'Program:exit'() {
        if (!schemaNode && requireSchemaPropertyWhenOptionless) {
          context.report({
            node: metaNode || info.create,
            messageId: 'missing',
            suggest:
              !isUsingOptions &&
              metaNode &&
              metaNode.type === 'ObjectExpression'
                ? [
                    {
                      messageId: 'addEmptySchema',
                      fix(fixer) {
                        return utils.insertProperty(
                          fixer,
                          metaNode,
                          'schema: []',
                          sourceCode
                        );
                      },
                    },
                  ]
                : [],
          });
        }
      },

      MemberExpression(node) {
        // Check if `context.options` was used when no options were defined in `meta.schema`.
        if (
          (hasEmptySchema || !schemaNode) &&
          node.object.type === 'Identifier' &&
          contextIdentifiers.has(node.object) &&
          node.property.type === 'Identifier' &&
          node.property.name === 'options'
        ) {
          isUsingOptions = true;
          context.report({
            node: schemaNode || metaNode || info.create,
            messageId: 'foundOptionsUsage',
          });
        }
      },
    };
  },
};
