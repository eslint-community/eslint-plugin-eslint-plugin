// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/no-matching-violation-suggest-message-ids.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('no-matching-violation-suggest-message-ids', rule, {
  valid: [
    {
      code: `
        module.exports = {
          meta: { messages: { violation: 'violation' } },

          create(context) {
            context.report({ 
              node, 
              messageId: 'violation',
            });
          }
        };`,
      name: 'no suggestions',
    },
    {
      code: `
        module.exports = {
          meta: { messages: { violation: 'violation', suggestion: 'suggestion' } },

          create(context) {
            context.report({ 
              node, 
              messageId: 'violation',
              suggest: [{ messageId: 'suggestion' }],
            });
          }
        };`,
      name: 'different messageIds',
    },
    {
      code: `
        module.exports = {
          meta: { messages: { violation: 'violation' } },

          create(context) {
            notContext.report({ 
              node, 
              messageId: 'violation',
              suggest: [{ messageId: 'violation' }],
            });
          }
        };`,
      name: 'report function not from context',
    },
    {
      code: `
        module.exports = {
          meta: { messages: { violation: 'violation' } },

          create(context) {
            context.notReport({ 
              node, 
              messageId: 'violation',
              suggest: [{ messageId: 'violation' }],
            });
          }
        };`,
      name: 'context function other than report',
    },
    {
      code: `
        const suggestionMessageId = 'suggestion';

        module.exports = {
          meta: { messages: { violation: 'violation', suggestion: 'suggestion' } },

          create(context) {
            context.report({ 
              node,
              messageId: 'violation',
              suggest: [{ messageId: suggestionMessageId }],
            });
          }
        };`,
      name: 'suggestion messageId from external variable',
    },
    {
      code: `
        module.exports = {
          meta: { messages: { violation: 'violation' } },

          create(context) {}
        };
        
        context.report({ 
          messageId: 'violation',
          suggest: [{ messageId: 'violation' }],
        });`,
      name: 'report outside of a rule',
    },
    {
      code: `
        module.exports = {
          meta: { messages: { violation: 'violation', otherViolation: 'other violation', suggestion: 'suggestion' } },

          create(context) {
            context.report({ 
              node,
              messageId: Math.random() > 0.5 ? 'violation' : 'otherViolation',
              suggest: [{
                messageId: 'suggestion',
              }],
            });
          }
        };`,
      name: 'conditional violation messageId',
    },
    {
      code: `
        module.exports = {
          meta: { messages: { violation: 'violation', suggestion: 'suggestion', otherSuggestion: 'other suggestion' } },

          create(context) {
            context.report({ 
              node,
              messageId: 'violation',
              suggest: [{
                messageId: Math.random() > 0.5 ? 'suggestion' : 'otherSuggestion',
              }],
            });
          }
        };`,
      name: 'conditional suggestion messageId',
    },
  ],

  invalid: [
    {
      code: `
        module.exports = {
          meta: { messages: { violation: 'violation' } },

          create(context) {
            context.report({ 
              node, 
              messageId: 'violation',
              suggest: [{ messageId: 'violation' }],
            });
          }
        };`,
      errors: [
        {
          messageId: 'matchingMessageId',
          data: { messageId: 'violation' },
          type: 'Literal',
          line: 9,
          column: 38,
          endColumn: 49,
        },
      ],
      name: 'matching messageId',
    },
    {
      code: `
        const suggestionMessageId = 'violation';

        module.exports = {
          meta: { messages: { violation: 'violation' } },

          create(context) {
            context.report({ 
              node, 
              messageId: 'violation',
              suggest: [{ messageId: suggestionMessageId }],
            });
          }
        };`,
      errors: [
        {
          messageId: 'matchingMessageId',
          data: { messageId: 'violation' },
          type: 'Literal',
          line: 2,
          column: 37,
          endColumn: 48,
        },
      ],
      name: 'suggestion messageId from external variable',
    },
    {
      code: `
        module.exports = {
          meta: { messages: { violation: 'violation', otherViolation: 'other violation' } },

          create(context) {
            context.report({ 
              node,
              messageId: Math.random() > 0.5 ? 'violation' : 'otherViolation',
              suggest: [{
                messageId: 'violation',
              }],
            });
          }
        };`,
      errors: [
        {
          messageId: 'matchingMessageId',
          data: { messageId: 'violation' },
          type: 'Literal',
          line: 10,
          column: 28,
          endColumn: 39,
        },
      ],
      name: 'conditional violation messageId',
    },
    {
      code: `
        module.exports = {
          meta: { messages: { violation: 'violation', suggestion: 'suggestion' } },

          create(context) {
            context.report({ 
              node,
              messageId: 'violation',
              suggest: [{
                messageId: Math.random() > 0.5 ? 'suggestion' : 'violation',
              }],
            });
          }
        };`,
      errors: [
        {
          messageId: 'matchingMessageId',
          data: { messageId: 'violation' },
          type: 'Literal',
          line: 10,
          column: 65,
          endColumn: 76,
        },
      ],
      name: 'conditional suggestion messageId',
    },
  ],
});
