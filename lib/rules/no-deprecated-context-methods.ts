/**
 * @fileoverview Disallows usage of deprecated methods on rule context objects
 * @author Teddy Katz
 */
import type { Rule } from 'eslint';
import type { Identifier, MemberExpression } from 'estree';

import { getContextIdentifiers } from '../utils.js';

const DEPRECATED_PASSTHROUGHS = {
  getSource: 'getText',
  getSourceLines: 'getLines',
  getAllComments: 'getAllComments',
  getNodeByRangeIndex: 'getNodeByRangeIndex',
  getComments: 'getComments',
  getCommentsBefore: 'getCommentsBefore',
  getCommentsAfter: 'getCommentsAfter',
  getCommentsInside: 'getCommentsInside',
  getJSDocComment: 'getJSDocComment',
  getFirstToken: 'getFirstToken',
  getFirstTokens: 'getFirstTokens',
  getLastToken: 'getLastToken',
  getLastTokens: 'getLastTokens',
  getTokenAfter: 'getTokenAfter',
  getTokenBefore: 'getTokenBefore',
  getTokenByRangeStart: 'getTokenByRangeStart',
  getTokens: 'getTokens',
  getTokensAfter: 'getTokensAfter',
  getTokensBefore: 'getTokensBefore',
  getTokensBetween: 'getTokensBetween',
} satisfies Record<string, string>;

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'disallow usage of deprecated methods on rule context objects',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-deprecated-context-methods.md',
    },
    fixable: 'code',
    schema: [],
    messages: {
      newFormat:
        'Use `{{contextName}}.getSourceCode().{{replacement}}` instead of `{{contextName}}.{{original}}`.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      'Program:exit'(ast) {
        [...getContextIdentifiers(sourceCode.scopeManager, ast)]
          .filter(
            (contextId) =>
              contextId.parent.type === 'MemberExpression' &&
              contextId === contextId.parent.object &&
              contextId.parent.property.type === 'Identifier' &&
              contextId.parent.property.name in DEPRECATED_PASSTHROUGHS,
          )
          .forEach((contextId) => {
            const parentPropertyName = (
              (contextId.parent as MemberExpression).property as Identifier
            ).name as keyof typeof DEPRECATED_PASSTHROUGHS;
            return context.report({
              node: contextId.parent,
              messageId: 'newFormat',
              data: {
                contextName: contextId.name,
                original: parentPropertyName,
                replacement: DEPRECATED_PASSTHROUGHS[parentPropertyName],
              },
              fix: (fixer) => [
                fixer.insertTextAfter(contextId, '.getSourceCode()'),
                fixer.replaceText(
                  (contextId.parent as MemberExpression).property,
                  DEPRECATED_PASSTHROUGHS[parentPropertyName],
                ),
              ],
            });
          });
      },
    };
  },
};

export default rule;
