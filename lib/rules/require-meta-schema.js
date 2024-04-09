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
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-schema.md',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          requireSchemaPropertyWhenOptionless: {
            type: 'boolean',
            default: true,
            description:
              'Whether the rule should require the `meta.schema` property to be specified (with `schema: []`) for rules that have no options.',
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
    const sourceCode = context.sourceCode || context.getSourceCode(); // TODO: just use context.sourceCode when dropping eslint < v9
    const { scopeManager } = sourceCode;
    const ruleInfo = utils.getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    let contextIdentifiers;
    const metaNode = ruleInfo.meta;
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

        if (
          value.type === 'Literal' ||
          (value.type === 'Identifier' && value.name === 'undefined')
        ) {
          context.report({ node: value, messageId: 'wrongType' });
        }
      },

      'Program:exit'() {
        if (!schemaNode && requireSchemaPropertyWhenOptionless) {
          context.report({
            node: metaNode || ruleInfo.create,
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
            node: schemaNode || metaNode || ruleInfo.create,
            messageId: 'foundOptionsUsage',
          });
        }
      },
    };
  },
};
