/**
 * @fileoverview Disallows the usage of `meta.replacedBy` property
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/no-meta-replaced-by.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const valid: string[] = [
  'module.exports = {};',
  `
    module.exports = {
      create(context) {},
    };
  `,
  `
    module.exports = {
      meta: {},
      create(context) {},
    };
  `,
  `
    module.exports = {
      meta: {
        deprecated: true,
      },
      create(context) {},
    };
  `,
  `
      module.exports = {
        meta: {
          deprecated: {
            replacedBy: [
              {
                rule: {
                  name: 'foo',
                },
              },
            ],
          },
        },
        create(context) {},
      };
    `,
];

const invalid: RuleTester.InvalidTestCase[] = [
  {
    code: `
      module.exports = {
        meta: {
          replacedBy: ['the-new-rule'],
        },
        create(context) {},
      };
    `,
    errors: [
      {
        messageId: 'useNewFormat',
        line: 4,
        endLine: 4,
        column: 11,
        endColumn: 39,
        suggestions: [
          {
            messageId: 'moveToDeprecated',
            output: `
      module.exports = {
        meta: {
          deprecated: { replacedBy: [{ rule: { name: 'the-new-rule' } }] },
        },
        create(context) {},
      };
    `,
          },
        ],
      },
    ],
  },
  {
    code: `
      const meta = {
        replacedBy: null,
      };

      module.exports = {
        meta,
        create(context) {},
      };
    `,
    errors: [
      {
        messageId: 'useNewFormat',
        line: 3,
        endLine: 3,
        column: 9,
        endColumn: 25,
        suggestions: [
          {
            messageId: 'moveToDeprecated',
            output: `
      const meta = {
        deprecated: { replacedBy: null },
      };

      module.exports = {
        meta,
        create(context) {},
      };
    `,
          },
        ],
      },
    ],
  },
  {
    code: `
      const spread = {
        replacedBy: null,
      };

      module.exports = {
        meta: {
          ...spread,
        },
        create(context) {},
      };
    `,
    errors: [
      {
        messageId: 'useNewFormat',
        suggestions: [],
        column: 9,
        endColumn: 25,
        endLine: 3,
        line: 3,
      },
    ],
  },
  {
    // Static string array → rich format
    code: `
      module.exports = {
        meta: {
          replacedBy: ['foo', 'bar'],
        },
        create(context) {},
      };
    `,
    errors: [
      {
        messageId: 'useNewFormat',
        line: 4,
        endLine: 4,
        column: 11,
        endColumn: 37,
        suggestions: [
          {
            messageId: 'moveToDeprecated',
            output: `
      module.exports = {
        meta: {
          deprecated: { replacedBy: [{ rule: { name: 'foo' } }, { rule: { name: 'bar' } }] },
        },
        create(context) {},
      };
    `,
          },
        ],
      },
    ],
  },
  {
    // Non-static value → verbatim
    code: `
      module.exports = {
        meta: {
          replacedBy: SOME_VALUE,
        },
        create(context) {},
      };
    `,
    errors: [
      {
        messageId: 'useNewFormat',
        line: 4,
        endLine: 4,
        column: 11,
        endColumn: 33,
        suggestions: [
          {
            messageId: 'moveToDeprecated',
            output: `
      module.exports = {
        meta: {
          deprecated: { replacedBy: SOME_VALUE },
        },
        create(context) {},
      };
    `,
          },
        ],
      },
    ],
  },
  {
    // deprecated: true (replacedBy in middle)
    code: `
      module.exports = {
        meta: {
          type: 'problem',
          deprecated: true,
          replacedBy: ['the-new-rule'],
          schema: [],
        },
        create(context) {},
      };
    `,
    errors: [
      {
        messageId: 'useNewFormat',
        line: 6,
        endLine: 6,
        column: 11,
        endColumn: 39,
        suggestions: [
          {
            messageId: 'moveToDeprecated',
            output: `
      module.exports = {
        meta: {
          type: 'problem',
          deprecated: { replacedBy: [{ rule: { name: 'the-new-rule' } }] },
          schema: [],
        },
        create(context) {},
      };
    `,
          },
        ],
      },
    ],
  },
  {
    // deprecated: true (replacedBy last property — leading comma removal)
    code: `
      module.exports = {
        meta: {
          deprecated: true,
          replacedBy: ['the-new-rule'],
        },
        create(context) {},
      };
    `,
    errors: [
      {
        messageId: 'useNewFormat',
        line: 5,
        endLine: 5,
        column: 11,
        endColumn: 39,
        suggestions: [
          {
            messageId: 'moveToDeprecated',
            output: `
      module.exports = {
        meta: {
          deprecated: { replacedBy: [{ rule: { name: 'the-new-rule' } }] },
        },
        create(context) {},
      };
    `,
          },
        ],
      },
    ],
  },
  {
    // deprecated: {}
    code: `
      module.exports = {
        meta: {
          deprecated: {},
          replacedBy: ['the-new-rule'],
        },
        create(context) {},
      };
    `,
    errors: [
      {
        messageId: 'useNewFormat',
        line: 5,
        endLine: 5,
        column: 11,
        endColumn: 39,
        suggestions: [
          {
            messageId: 'moveToDeprecated',
            output: `
      module.exports = {
        meta: {
          deprecated: {
replacedBy: [{ rule: { name: 'the-new-rule' } }]
},
        },
        create(context) {},
      };
    `,
          },
        ],
      },
    ],
  },
  {
    // deprecated: { availableUntil }
    code: `
      module.exports = {
        meta: {
          deprecated: { availableUntil: null },
          replacedBy: ['the-new-rule'],
        },
        create(context) {},
      };
    `,
    errors: [
      {
        messageId: 'useNewFormat',
        line: 5,
        endLine: 5,
        column: 11,
        endColumn: 39,
        suggestions: [
          {
            messageId: 'moveToDeprecated',
            output: `
      module.exports = {
        meta: {
          deprecated: { availableUntil: null,
replacedBy: [{ rule: { name: 'the-new-rule' } }] },
        },
        create(context) {},
      };
    `,
          },
        ],
      },
    ],
  },
  {
    // existing deprecated.replacedBy → no suggestion
    code: `
      module.exports = {
        meta: {
          deprecated: {
            replacedBy: [{ rule: { name: 'already' } }],
          },
          replacedBy: ['the-new-rule'],
        },
        create(context) {},
      };
    `,
    errors: [
      {
        messageId: 'useNewFormat',
        line: 7,
        endLine: 7,
        column: 11,
        endColumn: 39,
        suggestions: [],
      },
    ],
  },
  {
    // deprecated: false → no suggestion
    code: `
      module.exports = {
        meta: {
          deprecated: false,
          replacedBy: ['the-new-rule'],
        },
        create(context) {},
      };
    `,
    errors: [
      {
        messageId: 'useNewFormat',
        line: 5,
        endLine: 5,
        column: 11,
        endColumn: 39,
        suggestions: [],
      },
    ],
  },
];

type ValidTest = (typeof valid)[number];
type InvalidTest = (typeof invalid)[number];
type TestCase = ValidTest | InvalidTest;

function testToESM(test: ValidTest): ValidTest;
function testToESM(test: InvalidTest): InvalidTest;
function testToESM(test: TestCase): TestCase {
  if (typeof test === 'string') {
    return test.replace('module.exports =', 'export default');
  }

  const code = test.code.replace('module.exports =', 'export default');
  const errors = Array.isArray(test.errors)
    ? test.errors.map((error) => {
        if (typeof error === 'string') {
          return error;
        }
        if (!('suggestions' in error) || !error.suggestions) {
          return error;
        }
        return {
          ...error,
          suggestions: error.suggestions.map((suggestion) => {
            if (typeof suggestion === 'string' || !('output' in suggestion)) {
              return suggestion;
            }
            return {
              ...suggestion,
              output:
                typeof suggestion.output === 'string'
                  ? suggestion.output.replace(
                      'module.exports =',
                      'export default',
                    )
                  : suggestion.output,
            };
          }),
        };
      })
    : test.errors;

  return {
    ...test,
    code,
    ...(errors === undefined ? {} : { errors }),
  };
}

new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
}).run('no-meta-replaced-by', rule, {
  valid,
  invalid,
});

new RuleTester({
  languageOptions: { sourceType: 'module' },
}).run('no-meta-replaced-by', rule, {
  valid: valid.map((testCase) => testToESM(testCase)),
  invalid: invalid.map((testCase) => testToESM(testCase)),
});
