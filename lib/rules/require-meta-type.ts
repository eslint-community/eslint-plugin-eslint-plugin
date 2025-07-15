/**
 * @fileoverview require rules to implement a `meta.type` property
 * @author 薛定谔的猫<weiran.zsd@outlook.com>
 */
import { getStaticValue } from '@eslint-community/eslint-utils';
import type { Rule } from 'eslint';

import { evaluateObjectProperties, getKeyName, getRuleInfo } from '../utils.js';

const VALID_TYPES = new Set(['problem', 'suggestion', 'layout']);

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require rules to implement a `meta.type` property',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-type.md',
    },
    fixable: undefined,
    schema: [],
    messages: {
      missing:
        '`meta.type` is required (must be either `problem`, `suggestion`, or `layout`).',
      unexpected:
        '`meta.type` must be either `problem`, `suggestion`, or `layout`.',
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
        const typeNode = evaluateObjectProperties(metaNode, scopeManager)
          .filter((p) => p.type === 'Property')
          .find((p) => getKeyName(p) === 'type');

        if (!typeNode) {
          context.report({
            node: metaNode || ruleInfo.create,
            messageId: 'missing',
          });
          return;
        }

        const staticValue = getStaticValue(typeNode.value, scope);
        if (!staticValue) {
          // Ignore non-static values since we can't determine what they look like.
          return;
        }

        if (!VALID_TYPES.has(staticValue.value as string)) {
          context.report({ node: typeNode.value, messageId: 'unexpected' });
        }
      },
    };
  },
};

export default rule;
