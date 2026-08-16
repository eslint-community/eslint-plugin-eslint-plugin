/**
 * @fileoverview Disallows usage of deprecated methods on rule context objects
 * @author Teddy Katz
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/no-deprecated-context-methods.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('no-deprecated-context-methods', rule, {
  valid: [
    `
      module.exports = {
        create(context) {
          context.getSourceCode();
        }
      }
    `,
    `
    module.exports = context => {
      const sourceCode = context.getSourceCode();
      sourceCode.getFirstToken();
      return {};
    }
    `,
    `module.exports = {};`, // Not a rule.
    `
      module.exports = {
        create(context) {
          const sourceCode = context.sourceCode;
          sourceCode.getScope(node);
          sourceCode.getAncestors(node);
          sourceCode.getDeclaredVariables(node);
          sourceCode.markVariableAsUsed('foo', node);
          sourceCode.parserServices;
        }
      }
    `,
  ],

  invalid: [
    {
      code: `
        module.exports = {
          create(context) {
            return {
              Program(ast) {
                context.getSource(ast);
              }
            }
          }
        }
      `,
      output: `
        module.exports = {
          create(context) {
            return {
              Program(ast) {
                context.getSourceCode().getText(ast);
              }
            }
          }
        }
      `,
      errors: [
        {
          message:
            'Use `context.getSourceCode().getText` instead of `context.getSource`.',
          type: 'MemberExpression',
          column: 17,
          endColumn: 34,
          endLine: 6,
          line: 6,
        },
      ],
    },
    {
      code: `
        module.exports = myRuleContext => {
          myRuleContext.getFirstToken; return {};
        }
      `,
      output: `
        module.exports = myRuleContext => {
          myRuleContext.getSourceCode().getFirstToken; return {};
        }
      `,
      errors: [
        {
          message:
            'Use `myRuleContext.getSourceCode().getFirstToken` instead of `myRuleContext.getFirstToken`.',
          type: 'MemberExpression',
          column: 11,
          endColumn: 38,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      // `create` in variable.
      code: `
        const create = function(context) { return { Program(ast) { context.getSource(ast); } } };
        module.exports = { create };
      `,
      output: `
        const create = function(context) { return { Program(ast) { context.getSourceCode().getText(ast); } } };
        module.exports = { create };
      `,
      errors: [
        {
          message:
            'Use `context.getSourceCode().getText` instead of `context.getSource`.',
          type: 'MemberExpression',
          column: 68,
          endColumn: 85,
          endLine: 2,
          line: 2,
        },
      ],
    },
    {
      // Scope-related deprecated methods.
      code: `
        module.exports = {
          create(context) {
            context.getAncestors();
            context.getDeclaredVariables(node);
            context.getScope();
            context.markVariableAsUsed('foo');
          }
        }
      `,
      output: `
        module.exports = {
          create(context) {
            context.getSourceCode().getAncestors();
            context.getSourceCode().getDeclaredVariables(node);
            context.getSourceCode().getScope();
            context.getSourceCode().markVariableAsUsed('foo');
          }
        }
      `,
      errors: [
        {
          message:
            'Use `context.getSourceCode().getAncestors` instead of `context.getAncestors`.',
          type: 'MemberExpression',
          column: 13,
          endColumn: 33,
          endLine: 4,
          line: 4,
        },
        {
          message:
            'Use `context.getSourceCode().getDeclaredVariables` instead of `context.getDeclaredVariables`.',
          type: 'MemberExpression',
          column: 13,
          endColumn: 41,
          endLine: 5,
          line: 5,
        },
        {
          message:
            'Use `context.getSourceCode().getScope` instead of `context.getScope`.',
          type: 'MemberExpression',
          column: 13,
          endColumn: 29,
          endLine: 6,
          line: 6,
        },
        {
          message:
            'Use `context.getSourceCode().markVariableAsUsed` instead of `context.markVariableAsUsed`.',
          type: 'MemberExpression',
          column: 13,
          endColumn: 39,
          endLine: 7,
          line: 7,
        },
      ],
    },
    {
      // The deprecated `parserServices` property.
      code: `
        module.exports = {
          create(context) {
            const parserServices = context.parserServices;
          }
        }
      `,
      output: `
        module.exports = {
          create(context) {
            const parserServices = context.sourceCode.parserServices;
          }
        }
      `,
      errors: [
        {
          message:
            'Use `context.sourceCode.parserServices` instead of `context.parserServices`.',
          type: 'MemberExpression',
          column: 36,
          endColumn: 58,
          endLine: 4,
          line: 4,
        },
      ],
    },
  ],
});
