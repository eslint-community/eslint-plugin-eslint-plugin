/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 */
import path from 'node:path';

import { getStaticValue } from '@eslint-community/eslint-utils';
import type { Rule } from 'eslint';

import {
  getMetaDocsProperty,
  getRuleInfo,
  insertProperty,
  isUndefinedIdentifier,
} from '../utils.js';

// -----------------------------------------------------------------------------
// Rule Definition
// -----------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require rules to implement a `meta.docs.url` property',
      category: 'Rules',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-docs-url.md',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description:
              "A pattern to enforce rule's document URL. It replaces `{{name}}` placeholder by each rule name. The rule name is the basename of each rule file. Omitting this allows any URL.",
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{}],
    messages: {
      mismatch: '`meta.docs.url` property must be `{{expectedUrl}}`.',
      missing: '`meta.docs.url` property is missing.',
      wrongType: '`meta.docs.url` property must be a string.',
    },
  },

  /**
   * Creates AST event handlers for require-meta-docs-url.
   * @param context - The rule context.
   * @returns AST event handlers.
   */
  create(context) {
    const options = context.options[0] || {};
    const filename = context.filename;
    const ruleName =
      filename === '<input>'
        ? undefined
        : path.basename(filename, path.extname(filename));
    const expectedUrl =
      !options.pattern || !ruleName
        ? undefined
        : options.pattern.replaceAll(/{{\s*name\s*}}/g, ruleName);

    /**
     * Check whether a given URL is the expected URL.
     * @param url The URL to check.
     * @returns `true` if the node is the expected URL.
     */
    function isExpectedUrl(url: string | undefined | null): boolean {
      return Boolean(
        typeof url === 'string' &&
          (expectedUrl === undefined || url === expectedUrl),
      );
    }

    const sourceCode = context.sourceCode;
    const ruleInfo = getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    return {
      Program(ast) {
        const scope = sourceCode.getScope(ast);
        const { scopeManager } = sourceCode;

        const {
          docsNode,
          metaNode,
          metaPropertyNode: urlPropNode,
        } = getMetaDocsProperty('url', ruleInfo, scopeManager);

        const staticValue = urlPropNode
          ? getStaticValue(urlPropNode.value, scope)
          : undefined;
        if (urlPropNode && !staticValue) {
          // Ignore non-static values since we can't determine what they look like.
          return;
        }

        if (
          staticValue &&
          typeof staticValue.value === 'string' &&
          isExpectedUrl(staticValue.value)
        ) {
          return;
        }

        context.report({
          node:
            (urlPropNode && urlPropNode.value) ||
            (docsNode && docsNode.value) ||
            metaNode ||
            ruleInfo.create,

          // eslint-disable-next-line unicorn/no-negated-condition -- actually more clear like this
          messageId: !urlPropNode
            ? 'missing'
            : // eslint-disable-next-line unicorn/no-negated-condition -- this is fine for now
              !expectedUrl
              ? 'wrongType'
              : /* otherwise */ 'mismatch',

          data: {
            expectedUrl,
          },

          fix(fixer) {
            if (!expectedUrl) {
              return null;
            }

            const urlString = JSON.stringify(expectedUrl);
            if (urlPropNode) {
              if (
                urlPropNode.value.type === 'Literal' ||
                isUndefinedIdentifier(urlPropNode.value)
              ) {
                return fixer.replaceText(urlPropNode.value, urlString);
              }
            } else if (docsNode && docsNode.value.type === 'ObjectExpression') {
              return insertProperty(
                fixer,
                docsNode.value,
                `url: ${urlString}`,
                sourceCode,
              );
            } else if (
              !docsNode &&
              metaNode &&
              metaNode.type === 'ObjectExpression'
            ) {
              return insertProperty(
                fixer,
                metaNode,
                `docs: {\nurl: ${urlString}\n}`,
                sourceCode,
              );
            }

            return null;
          },
        });
      },
    };
  },
};

export default rule;
