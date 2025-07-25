/**
 * @fileoverview require using placeholders for dynamic report messages
 * @author Teddy Katz
 */

import { findVariable } from '@eslint-community/eslint-utils';

import {
  collectReportViolationAndSuggestionData,
  getContextIdentifiers,
  getReportInfo,
} from '../utils.js';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require using placeholders for dynamic report messages',
      category: 'Rules',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/prefer-placeholders.md',
    },
    fixable: null,
    schema: [],
    messages: {
      usePlaceholders:
        'Use report message placeholders instead of string concatenation.',
    },
  },

  create(context) {
    let contextIdentifiers;

    const sourceCode = context.sourceCode;
    const { scopeManager } = sourceCode;

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      Program(ast) {
        contextIdentifiers = getContextIdentifiers(scopeManager, ast);
      },
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          contextIdentifiers.has(node.callee.object) &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'report'
        ) {
          const reportInfo = getReportInfo(node, context);

          if (!reportInfo) {
            return;
          }

          const reportMessagesAndDataArray =
            collectReportViolationAndSuggestionData(reportInfo).filter(
              (obj) => obj.message,
            );
          for (let { message: messageNode } of reportMessagesAndDataArray) {
            if (messageNode.type === 'Identifier') {
              // See if we can find the variable declaration.

              const variable = findVariable(
                scopeManager.acquire(messageNode) || scopeManager.globalScope,
                messageNode,
              );

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

              messageNode = variable.defs[0].node.init;
            }

            if (
              (messageNode.type === 'TemplateLiteral' &&
                messageNode.expressions.length > 0) ||
              (messageNode.type === 'BinaryExpression' &&
                messageNode.operator === '+')
            ) {
              context.report({
                node: messageNode,
                messageId: 'usePlaceholders',
              });
            }
          }
        }
      },
    };
  },
};

export default rule;
