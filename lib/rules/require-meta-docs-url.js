/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 */

'use strict';

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

const path = require('path');
const util = require('../utils');
const { getStaticValue } = require('eslint-utils');

// -----------------------------------------------------------------------------
// Rule Definition
// -----------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
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
          pattern: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      mismatch: '`meta.docs.url` property must be `{{expectedUrl}}`.',
      missing: '`meta.docs.url` property is missing.',
      wrongType: '`meta.docs.url` property must be a string.',
    },
  },

  /**
   * Creates AST event handlers for require-meta-docs-url.
   * @param {RuleContext} context - The rule context.
   * @returns {Object} AST event handlers.
   */
  create(context) {
    const options = context.options[0] || {};
    const filename = context.getFilename();
    const ruleName =
      filename === '<input>'
        ? undefined
        : path.basename(filename, path.extname(filename));
    const expectedUrl =
      !options.pattern || !ruleName
        ? undefined
        : options.pattern.replace(/{{\s*name\s*}}/g, ruleName);

    /**
     * Check whether a given URL is the expected URL.
     * @param {string} url The URL to check.
     * @returns {boolean} `true` if the node is the expected URL.
     */
    function isExpectedUrl(url) {
      return Boolean(
        typeof url === 'string' &&
          (expectedUrl === undefined || url === expectedUrl)
      );
    }

    const sourceCode = context.getSourceCode();
    const ruleInfo = util.getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    return {
      Program() {
        const { scopeManager } = sourceCode;

        const metaNode = ruleInfo.meta;
        const docsPropNode = util
          .evaluateObjectProperties(metaNode, scopeManager)
          .find((p) => p.type === 'Property' && util.getKeyName(p) === 'docs');
        const urlPropNode = util
          .evaluateObjectProperties(
            docsPropNode && docsPropNode.value,
            scopeManager
          )
          .find((p) => p.type === 'Property' && util.getKeyName(p) === 'url');

        const staticValue = urlPropNode
          ? getStaticValue(urlPropNode.value, context.getScope())
          : undefined;
        if (urlPropNode && !staticValue) {
          // Ignore non-static values since we can't determine what they look like.
          return;
        }

        if (isExpectedUrl(staticValue && staticValue.value)) {
          return;
        }

        context.report({
          node:
            (urlPropNode && urlPropNode.value) ||
            (docsPropNode && docsPropNode.value) ||
            metaNode ||
            ruleInfo.create,

          // eslint-disable-next-line unicorn/no-negated-condition -- actually more clear like this
          messageId: !urlPropNode
            ? 'missing'
            : // eslint-disable-next-line unicorn/no-nested-ternary,unicorn/no-negated-condition -- this is fine for now
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
                (urlPropNode.value.type === 'Identifier' &&
                  urlPropNode.value.name === 'undefined')
              ) {
                return fixer.replaceText(urlPropNode.value, urlString);
              }
            } else if (
              docsPropNode &&
              docsPropNode.value.type === 'ObjectExpression'
            ) {
              return util.insertProperty(
                fixer,
                docsPropNode.value,
                `url: ${urlString}`,
                sourceCode
              );
            } else if (
              !docsPropNode &&
              metaNode &&
              metaNode.type === 'ObjectExpression'
            ) {
              return util.insertProperty(
                fixer,
                metaNode,
                `docs: {\nurl: ${urlString}\n}`,
                sourceCode
              );
            }

            return null;
          },
        });
      },
    };
  },
};
