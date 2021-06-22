/**
 * @fileoverview Require fixer function to return a fix
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils');
const { getStaticValue } = require('eslint-utils');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require fixer function to return a fix',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingFix: 'Fixer function never returned a fix.',
    },
  },

  create (context) {
    let funcInfo = {
      upper: null,
      codePath: null,
      hasReturnWithFixer: false,
      hasYieldWithFixer: false,
      shouldCheck: false,
      node: null,
    };
    let contextIdentifiers;

    /**
     * As we exit the fix() function, ensure we have returned or yielded a real fix by this point.
     * If not, report the function as a violation.
     *
     * @param {ASTNode} node - A node to check.
     * @returns {void}
     */
    function checkLastSegment (node) {
      if (
        funcInfo.shouldCheck &&
        (
          (node.generator && !funcInfo.hasYieldWithFixer) || // Generator function never yielded a fix
          (!node.generator && !funcInfo.hasReturnWithFixer) // Non-generator function never returned a fix
        )
      ) {
        context.report({
          node,
          loc: (node.id || node).loc.start,
          messageId: 'missingFix',
        });
      }
    }

    /**
     * Check if a returned/yielded node is likely to be a fix or not.
     * A fix is an object created by fixer.replaceText() for example and returned by the fix function.
     * @param {ASTNode} node - node to check
     * @param {Context} context
     * @returns {boolean}
     */
    function isFix (node) {
      if (node.type === 'ArrayExpression' && node.elements.length === 0) {
        // An empty array is not a fix.
        return false;
      }

      const staticValue = getStaticValue(node, context.getScope());
      if (!staticValue) {
        // If we can't find a static value, assume it's a real fix value.
        return true;
      }

      if (Array.isArray(staticValue.value)) {
        // If the static value is an array, then consider it a fix since fixes could have been added to it after creation.
        return true;
      }

      // Any other static values (booleans, numbers, etc) are not fixes.
      return false;
    }

    return {
      Program (node) {
        contextIdentifiers = utils.getContextIdentifiers(context, node);
      },

      // Stacks this function's information.
      onCodePathStart (codePath, node) {
        const parent = node.parent;

        // Whether we are inside the fixer function we care about.
        const shouldCheck = node.type === 'FunctionExpression' &&
          parent.parent.type === 'ObjectExpression' &&
          parent.parent.parent.type === 'CallExpression' &&
          contextIdentifiers.has(parent.parent.parent.callee.object) &&
          parent.parent.parent.callee.property.name === 'report' &&
          utils.getReportInfo(parent.parent.parent.arguments).fix === node;

        funcInfo = {
          upper: funcInfo,
          codePath,
          hasYieldWithFixer: false,
          hasReturnWithFixer: false,
          shouldCheck,
          node,
        };
      },

      // Pops this function's information.
      onCodePathEnd () {
        funcInfo = funcInfo.upper;
      },

      // Yield in generators
      YieldExpression (node) {
        if (funcInfo.shouldCheck && node.argument && isFix(node.argument)) {
          funcInfo.hasYieldWithFixer = true;
        }
      },

      // Checks the return statement is valid.
      ReturnStatement (node) {
        if (funcInfo.shouldCheck && node.argument && isFix(node.argument)) {
          funcInfo.hasReturnWithFixer = true;
        }
      },

      // Ensure the current fixer function returned or yielded a fix.
      'FunctionExpression:exit': checkLastSegment,
    };
  },
};
