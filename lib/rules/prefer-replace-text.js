/**
 * @fileoverview prefer using replaceText instead of replaceTextRange.
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

const utils = require('../utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'prefer using replaceText instead of replaceTextRange.',
      category: 'Rules',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
  },

  create (context) {
    const sourceCode = context.getSourceCode();
    const message = 'prefer using replaceText instead of replaceTextRange.';
    let funcInfo = {
      upper: null,
      codePath: null,
      shouldCheck: false,
      node: null,
    };
    let contextIdentifiers;

    return {
      Program (node) {
        contextIdentifiers = utils.getContextIdentifiers(context, node);
      },

      // Stacks this function's information.
      onCodePathStart (codePath, node) {
        const parent = node.parent;
        const shouldCheck = node.type === 'FunctionExpression' &&
          parent.parent.type === 'ObjectExpression' &&
          parent.parent.parent.type === 'CallExpression' &&
          contextIdentifiers.has(parent.parent.parent.callee.object) &&
          parent.parent.parent.callee.property.name === 'report' &&
          utils.getReportInfo(parent.parent.parent.arguments).fix === node;

        funcInfo = {
          upper: funcInfo,
          codePath,
          shouldCheck,
          node,
        };
      },

      // Pops this function's information.
      onCodePathEnd () {
        funcInfo = funcInfo.upper;
      },

      // Checks the return statement is valid.
      'CallExpression[arguments.length>1]' (node) {
        if (funcInfo.shouldCheck &&
          node.callee.property.name === 'replaceTextRange') {
          const arg = node.arguments[0];
          if ((arg.type === 'MemberExpression' && arg.property.name === 'range')
            || (
              arg.type === 'ArrayExpression' && arg.elements.length === 2 &&
              arg.elements[0].type === 'MemberExpression' && arg.elements[0].type === 'MemberExpression' && sourceCode.getText(arg.elements[0].object) === sourceCode.getText(arg.elements[1].object))
          ) {
            context.report({
              node,
              message,
            });
          }
        }
      },
    };
  },
};
