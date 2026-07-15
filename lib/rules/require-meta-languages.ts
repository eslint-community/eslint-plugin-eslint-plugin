/**
 * @fileoverview require rules to implement a `meta.languages` property
 * @author morgan-coded
 */
import { getStaticValue } from '@eslint-community/eslint-utils';
import type { Rule } from 'eslint';

import {
  evaluateObjectProperties,
  getKeyName,
  getRuleInfo,
  hasUnresolvedObjectSpread,
} from '../utils.ts';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require rules to implement a `meta.languages` property',
      category: 'Rules',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-languages.md',
    },
    fixable: undefined,
    schema: [],
    messages: {
      missing: '`meta.languages` is required.',
      empty: '`meta.languages` should not be empty.',
      invalid: '`meta.languages` should be an array of strings.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const ruleInfo = getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    return {
      Program(ast) {
        const scope = sourceCode.getScope(ast);
        const { scopeManager } = sourceCode;

        const metaNode = ruleInfo.meta;
        const metaProperties = evaluateObjectProperties(metaNode, scopeManager);
        const languagesNode = metaProperties
          .filter((p) => p.type === 'Property')
          .find((p) => getKeyName(p) === 'languages');

        if (!languagesNode) {
          if (hasUnresolvedObjectSpread(metaNode, scopeManager)) {
            return;
          }
          context.report({
            node: metaNode || ruleInfo.create,
            messageId: 'missing',
          });
          return;
        }

        const staticValue = getStaticValue(languagesNode.value, scope);
        if (!staticValue) {
          // Ignore non-static values since we can't determine what they look like.
          return;
        }

        const value = staticValue.value;
        if (
          !Array.isArray(value) ||
          value.some((element) => typeof element !== 'string')
        ) {
          context.report({ node: languagesNode.value, messageId: 'invalid' });
          return;
        }

        if (value.length === 0) {
          context.report({ node: languagesNode.value, messageId: 'empty' });
        }
      },
    };
  },
};

export default rule;
