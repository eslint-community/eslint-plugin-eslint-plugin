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

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require rules to implement a `meta.docs.url` property',
      category: 'Rules',
      recommended: false,
      url: 'https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-docs-url.md',
    },
    fixable: 'code',
    schema: [{
      type: 'object',
      properties: {
        pattern: { type: 'string' },
      },
      additionalProperties: false,
    }],
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
  create (context) {
    const options = context.options[0] || {};
    const sourceCode = context.getSourceCode();
    const filename = context.getFilename();
    const ruleName = filename === '<input>' ? undefined : path.basename(filename, path.extname(filename));
    const expectedUrl = !options.pattern || !ruleName
      ? undefined
      : options.pattern.replace(/{{\s*name\s*}}/g, ruleName);

    /**
     * Check whether a given URL is the expected URL.
     * @param {string} url The URL to check.
     * @returns {boolean} `true` if the node is the expected URL.
     */
    function isExpectedUrl (url) {
      return Boolean(
        typeof url === 'string' &&
        (
          expectedUrl === undefined ||
          url === expectedUrl
        )
      );
    }

    return {
      Program () {
        const info = util.getRuleInfo(sourceCode);
        if (info === null) {
          return;
        }

        const metaNode = info.meta;
        const docsPropNode =
          metaNode &&
          metaNode.properties &&
          metaNode.properties.find(p => p.type === 'Property' && util.getKeyName(p) === 'docs');
        const urlPropNode =
          docsPropNode &&
          docsPropNode.value.properties &&
          docsPropNode.value.properties.find(p => p.type === 'Property' && util.getKeyName(p) === 'url');

        const staticValue = urlPropNode ? getStaticValue(urlPropNode.value, context.getScope()) : undefined;
        if (urlPropNode && !staticValue) {
          // Ignore non-static values since we can't determine what they look like.
          return;
        }

        if (isExpectedUrl(staticValue && staticValue.value)) {
          return;
        }

        context.report({
          node: (urlPropNode && urlPropNode.value) || (docsPropNode && docsPropNode.value) || metaNode || info.create,

          messageId:
            !urlPropNode ? 'missing' :
              // eslint-disable-next-line unicorn/no-nested-ternary
              !expectedUrl ? 'wrongType' :
                /* otherwise */ 'mismatch',

          data: {
            expectedUrl,
          },

          fix (fixer) {
            if (!expectedUrl) {
              return null;
            }

            const urlString = JSON.stringify(expectedUrl);
            if (urlPropNode) {
              if (urlPropNode.value.type === 'Literal' || (urlPropNode.value.type === 'Identifier' && urlPropNode.value.name === 'undefined')) {
                return fixer.replaceText(urlPropNode.value, urlString);
              }
            } else if (docsPropNode && docsPropNode.value.type === 'ObjectExpression') {
              return util.insertProperty(fixer, docsPropNode.value, `url: ${urlString}`, sourceCode);
            } else if (!docsPropNode && metaNode && metaNode.type === 'ObjectExpression') {
              return util.insertProperty(fixer, metaNode, `docs: {\nurl: ${urlString}\n}`, sourceCode);
            }

            return null;
          },
        });
      },
    };
  },
};
