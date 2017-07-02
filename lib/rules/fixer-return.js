/**
 * @fileoverview enforces fixer function always return a value
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

// const utils = require('../utils');
const astUtils = require('../ast-utils.js');
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Expected fixer function to always return a value.',
      category: 'Possible Errors',
      recommended: false,
    },
    fixable: null,
  },

  create (context) {
    const message = 'Expected fixer function to always return a value.';
    let funcInfo = {
      upper: null,
      codePath: null,
      hasReturn: false,
      shouldCheck: false,
      node: null,
    };

    /**
     * Checks whether or not the last code path segment is reachable.
     * Then reports this function if the segment is reachable.
     *
     * If the last code path segment is reachable, there are paths which are not
     * returned or thrown.
     *
     * @param {ASTNode} node - A node to check.
     * @returns {void}
     */
    function checkLastSegment (node) {
      if (funcInfo.shouldCheck && funcInfo.codePath.currentSegments.some(segment => segment.reachable)) {
        context.report({
          node,
          loc: (node.id || node).loc.start,
          message,
        });
      }
    }

    return {

      // Stacks this function's information.
      onCodePathStart (codePath, node) {
        const parent = node.parent;

        funcInfo = {
          upper: funcInfo,
          codePath,
          hasReturn: false,
          shouldCheck:
            node.type === 'FunctionExpression' &&
            node.body.type === 'BlockStatement' &&
            // check if it is naming fix
            astUtils.getStaticPropertyName(parent) === 'fix',
          node,
        };
      },

      // Pops this function's information.
      onCodePathEnd () {
        funcInfo = funcInfo.upper;
      },

      // Checks the return statement is valid.
      ReturnStatement (node) {
        if (funcInfo.shouldCheck) {
          funcInfo.hasReturn = true;

          if (!node.argument) {
            context.report({
              node,
              message,
            });
          }
        }
      },

      // Reports a given function if the last path is reachable.
      'FunctionExpression:exit': checkLastSegment,
    };
  },
};
