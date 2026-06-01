/**
 * @fileoverview prefer using `replaceText()` instead of `replaceTextRange()`
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/prefer-replace-text.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('prefer-placeholders', rule, {
  valid: [
    `
      module.exports = {
        create(context) {
          context.report({
            fix(fixer) {
              return fixer.replaceTextRange([start, end], '');
            }
          });
        }
      };
    `,
    `
      module.exports = {
        create(context) {
          context.report({
            fix(fixer) {
              return fixer.replaceTextRange([node1[0], node2[1]], '');
            }
          });
        }
      };
    `,
    `
      module.exports = {
        create(context) {}
      };
    `,
    `
      fixer.replaceTextRange([node.range[0], node.range[1]], '');
    `,

    // Suggestion
    `
      module.exports = {
        create(context) {
          context.report({
            suggest: [
              {
                fix(fixer) {
                  return fixer.replaceTextRange([start, end], '');
                }
              }
            ]
          });
        }
      };
    `,
    `module.exports = {};`, // Not a rule.
  ],

  invalid: [
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              fix(fixer) {
                return fixer.replaceTextRange([node.range[0], node.range[1]], '');
              }
            });
          }
        };
    `,
      errors: [
        {
          messageId: 'useReplaceText',
          type: 'CallExpression',
          column: 24,
          endColumn: 82,
          endLine: 6,
          line: 6,
        },
      ],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              fix: function(fixer) {
                return fixer.replaceTextRange([node.range[0], node.range[1]], '');
              }
            });
          }
        };
    `,
      errors: [
        {
          messageId: 'useReplaceText',
          type: 'CallExpression',
          column: 24,
          endColumn: 82,
          endLine: 6,
          line: 6,
        },
      ],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              fix: function(fixer) {
                if (foo) {return fixer.replaceTextRange([node.range[0], node.range[1]], '')}
              }
            });
          }
        };
    `,
      errors: [
        {
          messageId: 'useReplaceText',
          type: 'CallExpression',
          column: 34,
          endColumn: 92,
          endLine: 6,
          line: 6,
        },
      ],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              fix: fixer => fixer.replaceTextRange([node.range[0], node.range[1]], '')
            });
          }
        };
    `,
      errors: [
        {
          messageId: 'useReplaceText',
          type: 'CallExpression',
          column: 29,
          endColumn: 87,
          endLine: 5,
          line: 5,
        },
      ],
    },
    {
      code: `
        module.exports = {
          create(context) {
            context.report({
              fix(fixer) {
                return fixer.replaceTextRange([node.start, node.end], '');
              }
            });
          }
        };
    `,
      errors: [
        {
          messageId: 'useReplaceText',
          type: 'CallExpression',
          column: 24,
          endColumn: 74,
          endLine: 6,
          line: 6,
        },
      ],
    },

    {
      // Suggestion fixer
      code: `
        module.exports = {
          create(context) {
            context.report({
              suggest: [
                {
                  fix(fixer) {
                    return fixer.replaceTextRange([node.range[0], node.range[1]], '');
                  }
                }
              ]
            });
          }
        };
    `,
      errors: [
        {
          messageId: 'useReplaceText',
          type: 'CallExpression',
          column: 28,
          endColumn: 86,
          endLine: 8,
          line: 8,
        },
      ],
    },
    {
      // `create` in variable.
      code: `
        const create = function(context) {
          context.report({
            fix(fixer) {
              return fixer.replaceTextRange([node.range[0], node.range[1]], '');
            }
          });
        };
        module.exports = { create };
    `,
      errors: [
        {
          messageId: 'useReplaceText',
          type: 'CallExpression',
          column: 22,
          endColumn: 80,
          endLine: 5,
          line: 5,
        },
      ],
    },
  ],
});
