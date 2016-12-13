/**
 * @fileoverview disallow use of the deprecated context.report() API
 * @author Teddy Katz
 */

'use strict';

const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'disallow use of the deprecated context.report() API',
      category: 'Rules',
      recommended: true,
    },
    fixable: 'code',  // or "code" or "whitespace"
    schema: [],
  },

  create (context) {
    const sourceCode = context.getSourceCode();
    const ruleInfo = utils.getRuleInfo(sourceCode.ast);

    if (!ruleInfo || !ruleInfo.create.params.length) {
      return {};
    }

    if (ruleInfo.create.params[0].type !== 'Identifier') {
      // TODO: Make the rule detect `module.exports = { create({report}) { report(foo, bar); } };`
      return {};
    }

    const contextIdentifiers = new WeakSet();

        // ----------------------------------------------------------------------
        // Public
        // ----------------------------------------------------------------------

    return {
      [ruleInfo.create.type] (node) {
        if (node === ruleInfo.create) {
          context.getDeclaredVariables(node)
            .find(variable => variable.name === node.params[0].name)
            .references
            .map(ref => ref.identifier)
            .forEach(identifier => contextIdentifiers.add(identifier));
        }
      },
      CallExpression (node) {
        if (
          node.callee.type === 'MemberExpression' &&
          contextIdentifiers.has(node.callee.object) &&
          node.callee.property.type === 'Identifier' && node.callee.property.name === 'report' &&
          node.arguments.length > 1
        ) {
          context.report({
            node,
            message: 'Use the new-style context.report() API.',
            fix (fixer) {
              const openingParen = sourceCode.getTokenBefore(node.arguments[0]);
              const closingParen = sourceCode.getLastToken(node);
              const keyNames = node.arguments.length === 5
                ? ['node', 'loc', 'message', 'data', 'fix']
                : ['node', 'message', 'data', 'fix'];

              return fixer.replaceTextRange(
                [openingParen.range[1], closingParen.range[0]],
                '{' + node.arguments.map((arg, index) => `${keyNames[index]}: ${sourceCode.getText(arg)}`).join(', ') + '}'
              );
            },
          });
        }
      },
    };
  },
};
