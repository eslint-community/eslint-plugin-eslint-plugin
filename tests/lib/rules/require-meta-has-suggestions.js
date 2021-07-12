'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/require-meta-has-suggestions');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run('require-meta-has-suggestions', rule, {
  valid: [
    'module.exports = context => {};',
    // No suggestions reported, no violations reported, no meta object.
    `
      module.exports = {
        create(context) {}
      };
    `,
    // No suggestions reported, no violations reported, empty meta object.
    `
      module.exports = {
        meta: {},
        create(context) {}
      };
    `,
    // No suggestions reported, violation reported, empty meta object.
    `
      module.exports = {
        meta: {},
        create(context) {
          context.report({node, message});
        }
      };
    `,
    // No suggestions reported, no suggestion property, non-object style of reporting.
    `
    module.exports = {
      meta: {},
      create(context) {
        context.report(node, message);
      }
    };
    `,
    // No suggestions reported (empty suggest array), no suggestion property.
    `
    module.exports = {
      meta: {},
      create(context) {
        context.report({node, message, suggest:[]});
      }
    };
    `,
    // No suggestions reported (empty suggest array in variable), no suggestion property.
    `
    const SUGGESTIONS = [];
    module.exports = {
      meta: {},
      create(context) {
        context.report({node, message, suggest: SUGGESTIONS});
      }
    };
    `,
    // No suggestions reported, hasSuggestions property set to false.
    `
    module.exports = {
      meta: { hasSuggestions: false },
      create(context) {
        context.report({node, message});
      }
    };
    `,
    // No suggestions reported, hasSuggestions property set to `null`.
    `
    module.exports = {
      meta: { hasSuggestions: null },
      create(context) {
        context.report({node, message});
      }
    };
    `,
    // No suggestions reported, hasSuggestions property set to `undefined`.
    `
    module.exports = {
      meta: { hasSuggestions: undefined },
      create(context) {
        context.report({node, message});
      }
    };
    `,
    // No suggestions reported, hasSuggestions property set to false (as variable).
    `
    const hasSuggestions = false;
    module.exports = {
      meta: { hasSuggestions },
      create(context) {
        context.report({node, message});
      }
    };
    `,
    // Provides suggestions, has hasSuggestions property.
    `
      module.exports = {
        meta: { hasSuggestions: true },
        create(context) {
          context.report({node, message, suggest: [{}]});
        }
      };
    `,
    // Provides suggestions, has hasSuggestions property (as variable).
    `
      const hasSuggestions = true;
      module.exports = {
        meta: { hasSuggestions },
        create(context) {
          context.report({node, message, suggest: [{}]});
        }
      };
    `,
    // Provides *dynamic* suggestions, has hasSuggestions property.
    `
      module.exports = {
        meta: { hasSuggestions: true },
        create(context) {
          context.report({node, message, suggest: getSuggestions()});
        }
      };
    `,
    // Provides suggestions, has hasSuggestions property with no static value available.
    `
      module.exports = {
        meta: { hasSuggestions: getHasSuggestions() },
        create(context) {
          context.report({node, message, suggest: [{}]});
        }
      };
    `,
    // Provides suggestions, has hasSuggestions property in variable with no static value available
    `
      const hasSuggestions = getHasSuggestions();
      module.exports = {
        meta: { hasSuggestions },
        create(context) {
          context.report({node, message, suggest: [{}]});
        }
      };
    `,
    // Does not provide suggestions, has hasSuggestions property with no static value available
    `
      module.exports = {
        meta: { hasSuggestions: getHasSuggestions() },
        create(context) {
          context.report({node, message});
        }
      };
    `,
    // Spread syntax.
    {
      code: `
        const meta = {};
        module.exports = {
          ...meta,
          meta: {},
          create(context) { context.report(node, message, data, fix); }
        };
      `,
      parserOptions: {
        ecmaVersion: 9,
      },
    },
  ],

  invalid: [
    {
      // Reports suggestions, no meta object, violation should be on `create` function.
      code: `
        module.exports = {
          create(context) { context.report({node, message, suggest: [{}]}); }
        };
      `,
      output: null,
      errors: [{ messageId: 'shouldBeSuggestable', type: 'FunctionExpression', line: 3, column: 17, endLine: 3, endColumn: 78 }],
    },
    {
      // Reports suggestions, no hasSuggestions property, violation should be on `meta` object, empty meta object.
      code: `
        module.exports = {
          meta: {},
          create(context) { context.report({node, message, suggest: [{}]}); }
        };
      `,
      output: `
        module.exports = {
          meta: { hasSuggestions: true },
          create(context) { context.report({node, message, suggest: [{}]}); }
        };
      `,
      errors: [{ messageId: 'shouldBeSuggestable', type: 'ObjectExpression', line: 3, column: 17, endLine: 3, endColumn: 19 }],
    },
    {
      // Reports suggestions, no hasSuggestions property, violation should be on `meta` object, non-empty meta object.
      code: `
        module.exports = {
          meta: { foo: 'bar' },
          create(context) { context.report({node, message, suggest: [{}]}); }
        };
      `,
      output: `
        module.exports = {
          meta: { hasSuggestions: true, foo: 'bar' },
          create(context) { context.report({node, message, suggest: [{}]}); }
        };
      `,
      errors: [{ messageId: 'shouldBeSuggestable', type: 'ObjectExpression', line: 3, column: 17, endLine: 3, endColumn: 31 }],
    },
    {
      // Reports suggestions (in variable), no hasSuggestions property, violation should be on `meta` object.
      code: `
        const SUGGESTIONS = [{}];
        module.exports = {
          meta: {},
          create(context) { context.report({node, message, suggest: SUGGESTIONS}); }
        };
      `,
      output: `
        const SUGGESTIONS = [{}];
        module.exports = {
          meta: { hasSuggestions: true },
          create(context) { context.report({node, message, suggest: SUGGESTIONS}); }
        };
      `,
      errors: [{ messageId: 'shouldBeSuggestable', type: 'ObjectExpression', line: 4, column: 17, endLine: 4, endColumn: 19 }],
    },
    {
      // Reports suggestions, hasSuggestions property set to false, violation should be on `false`
      code: `
        module.exports = {
          meta: { hasSuggestions: false },
          create(context) { context.report({node, message, suggest: [{}]}); }
        };
      `,
      output: `
        module.exports = {
          meta: { hasSuggestions: true },
          create(context) { context.report({node, message, suggest: [{}]}); }
        };
      `,
      errors: [{ messageId: 'shouldBeSuggestable', type: 'Literal', line: 3, column: 35, endLine: 3, endColumn: 40 }],
    },
    {
      // Reports suggestions, hasSuggestions property set to `null`, violation should be on `null`
      code: `
        module.exports = {
          meta: { hasSuggestions: null },
          create(context) { context.report({node, message, suggest: [{}]}); }
        };
      `,
      output: `
        module.exports = {
          meta: { hasSuggestions: true },
          create(context) { context.report({node, message, suggest: [{}]}); }
        };
      `,
      errors: [{ messageId: 'shouldBeSuggestable', type: 'Literal', line: 3, column: 35, endLine: 3, endColumn: 39 }],
    },
    {
      // Reports suggestions, hasSuggestions property set to `undefined`, violation should be on `undefined`
      code: `
        module.exports = {
          meta: { hasSuggestions: undefined },
          create(context) { context.report({node, message, suggest: [{}]}); }
        };
      `,
      output: `
        module.exports = {
          meta: { hasSuggestions: true },
          create(context) { context.report({node, message, suggest: [{}]}); }
        };
      `,
      errors: [{ messageId: 'shouldBeSuggestable', type: 'Identifier', line: 3, column: 35, endLine: 3, endColumn: 44 }],
    },
    {
      // Reports suggestions, hasSuggestions property set to false (as variable), violation should be on variable
      code: `
        const hasSuggestions = false;
        module.exports = {
          meta: { hasSuggestions },
          create(context) { context.report({node, message, suggest: [{}]}); }
        };
      `,
      output: null,
      errors: [{ messageId: 'shouldBeSuggestable', type: 'Identifier', line: 4, column: 19, endLine: 4, endColumn: 33 }],
    },
    {
      // Does not report suggestions, hasSuggestions property set to true, violation should be on `true`
      code: `
        module.exports = {
          meta: { hasSuggestions: true },
          create(context) { context.report({node, message}); }
        };
      `,
      output: null,
      errors: [{ messageId: 'shouldNotBeSuggestable', type: 'Literal', line: 3, column: 35, endLine: 3, endColumn: 39 }],
    },
  ],
});
