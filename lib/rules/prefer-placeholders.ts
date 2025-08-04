/**
 * @fileoverview require using placeholders for dynamic report messages
 * @author Teddy Katz
 */

import { findVariable } from '@eslint-community/eslint-utils';
import type { Rule } from 'eslint';
import type { Node } from 'estree';

import {
  collectReportViolationAndSuggestionData,
  getContextIdentifiers,
  getReportInfo,
} from '../utils.js';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require using placeholders for dynamic report messages',
      category: 'Rules',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/prefer-placeholders.md',
    },
    fixable: undefined,
    schema: [],
    messages: {
      usePlaceholders:
        'Use report message placeholders instead of string concatenation.',
    },
  },

  create(context) {
    let contextIdentifiers = new Set<Node>();

    const sourceCode = context.sourceCode;
    const { scopeManager } = sourceCode;

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

          const reportMessages = collectReportViolationAndSuggestionData(
            reportInfo,
          ).map((obj) => obj.message);
          for (let messageNode of reportMessages.filter(
            (message) => !!message,
          )) {
            if (messageNode.type === 'Identifier') {
              // See if we can find the variable declaration.

              const variable = findVariable(
                scopeManager.acquire(messageNode) || scopeManager.globalScope!,
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
