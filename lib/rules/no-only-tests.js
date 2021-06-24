'use strict';

const utils = require('../utils');

/**
 * Checks if the given token is a comma token or not.
 * From: https://github.com/eslint/eslint/blob/master/lib/rules/utils/ast-utils.js
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a comma token.
 */
function isCommaToken (token) {
  return token.value === ',' && token.type === 'Punctuator';
}

/**
 * Checks if the given token is an opening brace token or not.
 * From: https://github.com/eslint/eslint/blob/master/lib/rules/utils/ast-utils.js
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is an opening brace token.
 */
function isOpeningBraceToken (token) {
  return token.value === '{' && token.type === 'Punctuator';
}

/**
 * Checks if the given token is a closing brace token or not.
 * From: https://github.com/eslint/eslint/blob/master/lib/rules/utils/ast-utils.js
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a closing brace token.
 */
function isClosingBraceToken (token) {
  return token.value === '}' && token.type === 'Punctuator';
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow the test case property `only`',
      category: 'Tests',
      recommended: false,
    },
    schema: [],
    messages: {
      foundOnly:
        'The test case property `only` can be used during development, but should not be checked-in, since it prevents all the tests from running.',
      removeOnly: 'Remove `only`.',
    },
    hasSuggestions: true,
  },

  create (context) {
    return {
      Program (ast) {
        for (const testRun of utils.getTestInfo(context, ast)) {
          for (const test of [...testRun.valid, ...testRun.invalid]) {
            if (test.type === 'ObjectExpression') {
              // Test case object: { code: 'const x = 123;', ... }

              const onlyProperty = test.properties.find(
                property =>
                  property.key.type === 'Identifier' &&
                  property.key.name === 'only' &&
                  property.value.type === 'Literal' &&
                  property.value.value
              );

              if (onlyProperty) {
                context.report({
                  node: onlyProperty,
                  messageId: 'foundOnly',
                  suggest: [
                    {
                      messageId: 'removeOnly',
                      *fix (fixer) {
                        const sourceCode = context.getSourceCode();

                        const tokenBefore = sourceCode.getTokenBefore(onlyProperty);
                        const tokenAfter = sourceCode.getTokenAfter(onlyProperty);
                        if (
                          (isCommaToken(tokenBefore) && isCommaToken(tokenAfter)) || // In middle of properties
                          (isOpeningBraceToken(tokenBefore) && isCommaToken(tokenAfter)) // At beginning of properties
                        ) {
                          yield fixer.remove(tokenAfter); // Remove extra comma.
                        }
                        if (isCommaToken(tokenBefore) && isClosingBraceToken(tokenAfter)) { // At end of properties
                          yield fixer.remove(tokenBefore); // Remove extra comma.
                        }

                        yield fixer.remove(onlyProperty);
                      },
                    },
                  ],
                });
              }
            } else if (
              test.type === 'CallExpression' &&
              test.callee.type === 'MemberExpression' &&
              test.callee.object.type === 'Identifier' &&
              test.callee.object.name === 'RuleTester' &&
              test.callee.property.type === 'Identifier' &&
              test.callee.property.name === 'only'
            ) {
              // RuleTester.only('const x = 123;');
              context.report({ node: test.callee, messageId: 'foundOnly' });
            }
          }
        }
      },
    };
  },
};
