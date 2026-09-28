/**
 * @fileoverview Disallows usage of deprecated methods on source code objects
 */
import type { Rule } from 'eslint';
import type { Identifier, MemberExpression } from 'estree';

import { getSourceCodeIdentifiers } from '../utils.ts';

const DEPRECATED_METHODS = {
  getSource: 'getText',
  getSourceLines: 'getLines',
} satisfies Record<string, string>;

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'disallow usage of deprecated methods on source code objects',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-deprecated-sourcecode-methods.md',
    },
    fixable: 'code',
    schema: [],
    messages: {
      newFormat:
        'Use `{{sourceCodeName}}.{{replacement}}` instead of `{{sourceCodeName}}.{{original}}`.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      'Program:exit'(ast) {
        [...getSourceCodeIdentifiers(sourceCode.scopeManager, ast)]
          .filter(
            (sourceCodeId) =>
              sourceCodeId.parent.type === 'MemberExpression' &&
              sourceCodeId === sourceCodeId.parent.object &&
              sourceCodeId.parent.property.type === 'Identifier' &&
              sourceCodeId.parent.property.name in DEPRECATED_METHODS,
          )
          .forEach((sourceCodeId) => {
            const parentPropertyName = (
              (sourceCodeId.parent as MemberExpression).property as Identifier
            ).name as keyof typeof DEPRECATED_METHODS;
            return context.report({
              node: sourceCodeId.parent,
              messageId: 'newFormat',
              data: {
                sourceCodeName: sourceCodeId.name,
                original: parentPropertyName,
                replacement: DEPRECATED_METHODS[parentPropertyName],
              },
              fix: (fixer) =>
                fixer.replaceText(
                  (sourceCodeId.parent as MemberExpression).property,
                  DEPRECATED_METHODS[parentPropertyName],
                ),
            });
          });
      },
    };
  },
};

export default rule;
