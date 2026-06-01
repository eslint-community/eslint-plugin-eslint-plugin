// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/require-error-positions.ts';
import { RuleTester } from 'eslint';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('require-error-positions', rule, {
  valid: [
    `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {code: 'foo', output: 'bar', errors: [{line: 1, column: 2, endColumn: 3, endLine: 4}]},
  ]
});
    `,
    `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {code: 'foo', output: 'bar', 'errors': [{'line': 1, 'column': 2, 'endColumn': 3, 'endLine': 4}]},
  ]
});
    `,
    `
const errorPositions = { line: 1, column: 2, endColumn: 3, endLine: 4 };

new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {code: 'foo', output: 'bar', errors: [{messageId: 'bar', ...errorPositions}]},
  ]
});
    `,
    `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {code: 'foo', output: 'bar', errors: []},
  ]
});
    `,
    `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {code: 'foo', output: 'bar'},
  ]
});
    `,
  ],
  invalid: [
    {
      code: `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {code: 'foo', output: 'bar', errors: [{messageId: 'bizz'}]},
  ]
});
      `,
      errors: [
        {
          messageId: 'locationsMissing',
          line: 5,
          column: 43,
          endColumn: 62,
          endLine: 5,
        },
      ],
    },
    {
      code: `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {
      code: 'foo',
      output: 'bar',
      errors: [{messageId: 'bizz', column: 2, endColumn: 3, endLine: 4}],
    },
  ]
});
      `,
      errors: [
        {
          messageId: 'locationsMissing',
          column: 16,
          endColumn: 72,
          endLine: 8,
          line: 8,
        },
      ],
    },
    {
      code: `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {
      code: 'foo',
      output: 'bar',
      errors: [{messageId: 'bizz', line: 1, endColumn: 3, endLine: 4}],
    },
  ]
});
      `,
      errors: [
        {
          messageId: 'locationsMissing',
          column: 16,
          endColumn: 70,
          endLine: 8,
          line: 8,
        },
      ],
    },
    {
      code: `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {
      code: 'foo',
      output: 'bar',
      errors: [{messageId: 'bizz', line: 1, column: 2, endLine: 4}],
    },
  ]
});
      `,
      errors: [
        {
          messageId: 'locationsMissing',
          column: 16,
          endColumn: 67,
          endLine: 8,
          line: 8,
        },
      ],
    },
    {
      code: `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {
      code: 'foo',
      output: 'bar',
      errors: [{messageId: 'bizz', line: 1, column: 2, endColumn: 3}],
    },
  ]
});
      `,
      errors: [
        {
          messageId: 'locationsMissing',
          column: 16,
          endColumn: 69,
          endLine: 8,
          line: 8,
        },
      ],
    },
    {
      code: `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {
      code: 'foo',
      output: 'bar',
      errors: [
        {messageId: 'titi', line: 1, column: 2, endColumn: 3, endLine: 4},
        {messageId: 'toto', column: 2, endColumn: 3, endLine: 4},
        {messageId: 'tata', line: 1, column: 2, endColumn: 3, endLine: 4},
      ],
    },
  ]
});
      `,
      errors: [
        {
          messageId: 'locationsMissing',
          column: 9,
          endColumn: 65,
          endLine: 10,
          line: 10,
        },
      ],
    },
    {
      code: `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {
      code: 'foo',
      output: 'bar',
      errors: [
        {messageId: 'bizz', line: 1, column: 2, endColumn: 3, endLine: 4},
      ],
    },
    {
      code: 'foo',
      output: 'bar',
      errors: [
        {messageId: 'bizz', column: 2, endColumn: 3, endLine: 4},
      ],
    },
    {
      code: 'foo',
      output: 'bar',
      errors: [
        {messageId: 'bizz', line: 1, column: 2, endColumn: 3, endLine: 4},
      ],
    },
  ]
});
      `,
      errors: [
        {
          messageId: 'locationsMissing',
          column: 9,
          endColumn: 65,
          endLine: 16,
          line: 16,
        },
      ],
    },
    {
      code: `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {code: 'foo', output: 'bar', errors: [{...errorInfo}]},
  ]
});
      `,
      errors: [
        {
          messageId: 'locationsMissing',
          column: 43,
          endColumn: 57,
          endLine: 5,
          line: 5,
        },
      ],
    },
    {
      code: `
const positions = { line: 1, column: 2 };

new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {code: 'foo', output: 'bar', errors: [{messageId: 'bizz', ...positions}]},
  ]
});
      `,
      errors: [
        {
          messageId: 'locationsMissing',
          column: 43,
          endColumn: 76,
          endLine: 7,
          line: 7,
        },
      ],
    },
    {
      code: `
new RuleTester().run('foo', bar, {
  valid: [],
  invalid: [
    {code: 'foo', output: 'bar', errors: ['errorMessage']},
  ]
});
      `,
      errors: [
        {
          messageId: 'locationsMissing',
          column: 43,
          endColumn: 57,
          endLine: 5,
          line: 5,
        },
      ],
    },
  ],
});
