/**
 * @fileoverview Disallows usage of deprecated methods on source code objects
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/no-deprecated-sourcecode-methods.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('no-deprecated-sourcecode-methods', rule, {
  valid: [
    `
      module.exports = {
        create(context) {
          const sourceCode = context.sourceCode;
          sourceCode.getText(node);
          sourceCode.getLines();
          sourceCode.getFirstToken(node);
        }
      }
    `,
    `
      module.exports = {
        create(context) {
          context.getSourceCode().getText(node);
        }
      }
    `,
    // Variable not coming from `context.getSourceCode()` is ignored.
    `
      module.exports = {
        create(context) {
          const sourceCode = getSourceCode();
          sourceCode.getSource(node);
          return {};
        }
      }
    `,
    `module.exports = {};`, // Not a rule.
  ],

  invalid: [
    {
      code: `
        module.exports = {
          create(context) {
            const sourceCode = context.getSourceCode();
            return {
              Program(ast) {
                sourceCode.getSource(ast);
              }
            }
          }
        }
      `,
      output: `
        module.exports = {
          create(context) {
            const sourceCode = context.getSourceCode();
            return {
              Program(ast) {
                sourceCode.getText(ast);
              }
            }
          }
        }
      `,
      errors: [
        {
          message:
            'Use `sourceCode.getText` instead of `sourceCode.getSource`.',
          type: 'MemberExpression',
          column: 17,
          endColumn: 37,
          endLine: 7,
          line: 7,
        },
      ],
    },
    {
      code: `
        module.exports = context => {
          const sc = context.getSourceCode();
          sc.getSourceLines();
          return {};
        }
      `,
      output: `
        module.exports = context => {
          const sc = context.getSourceCode();
          sc.getLines();
          return {};
        }
      `,
      errors: [
        {
          message: 'Use `sc.getLines` instead of `sc.getSourceLines`.',
          type: 'MemberExpression',
          column: 11,
          endColumn: 28,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      // Multiple deprecated methods.
      code: `
        module.exports = {
          create(context) {
            const sourceCode = context.getSourceCode();
            sourceCode.getSource(node);
            sourceCode.getSourceLines();
          }
        }
      `,
      output: `
        module.exports = {
          create(context) {
            const sourceCode = context.getSourceCode();
            sourceCode.getText(node);
            sourceCode.getLines();
          }
        }
      `,
      errors: [
        {
          message:
            'Use `sourceCode.getText` instead of `sourceCode.getSource`.',
          type: 'MemberExpression',
          column: 13,
          endColumn: 33,
          endLine: 5,
          line: 5,
        },
        {
          message:
            'Use `sourceCode.getLines` instead of `sourceCode.getSourceLines`.',
          type: 'MemberExpression',
          column: 13,
          endColumn: 38,
          endLine: 6,
          line: 6,
        },
      ],
    },
  ],
});
