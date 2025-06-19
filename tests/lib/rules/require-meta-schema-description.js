// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/require-meta-schema-description.js';
import { RuleTester } from '../../utils/eslint-rule-tester.js';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('require-meta-schema-description', rule, {
  valid: [
    ``,
    `
module.exports = {};
`,
    `
module.exports = {
  create() {}
};
`,
    `
module.exports = {
  meta: {
    schema: false,
  },
  create() {}
};
`,
    `
module.exports = {
  meta: {
    schema: [false],
  },
  create() {}
};
`,
    `
module.exports = {
  meta: {
    schema: [
      {
        description: 'Elements to allow.',
        elements: { type: 'string' },
        type: 'array',
      },
    ],
  },
};
`,
    `
const descriptionKey = 'description';

module.exports = {
  meta: {
    schema: [
      {
        [descriptionKey]: 'Elements to allow.',
        elements: { type: 'string' },
        type: 'array',
      },
    ],
  },
};
`,
    `
module.exports = {
  meta: {
    schema: [
      {
        description: 'Elements to allow.',
        elements: { type: 'string' },
        type: 'array',
      },
    ],
  },
  create() {}
};
`,
    `
module.exports = {
meta: {
schema: [
  {
    ['description']: 'Elements to allow.',
    elements: { type: 'string' },
    type: 'array',
  },
],
},
create() {}
};
`,
    `
module.exports = {
  meta: {
    schema: [
      {
        oneOf: [
          {
            description: 'Elements to allow.',
            elements: { type: 'string' },
            type: 'array',
          }
        ],
      },
    ],
  },
  create() {}
};
`,
    `
module.exports = {
  meta: {
    schema: [
      {
        type: 'object',
        $defs: {
          directiveConfigSchema: {
            oneOf: [
              {
                type: 'boolean',
                default: true,
              },
            ],
          },
        },
        additionalProperties: false,
        properties: {
          'ts-check': {
            $ref: '#/items/0/$defs/directiveConfigSchema',
            description: 'Whether to report @ts-check comments.',
          },
        },
      },
    ],
  },
  create() {}
};
`,
    `
module.exports = {
  meta: {
    schema: [
      {
        type: 'object',
        properties: null,
        additionalProperties: false
      }
    ],
  },
  create() {}
}
  `,
    `
const DEFAULT_OPTIONS = Object.freeze({});

module.exports = {
  meta: {
    schema: [
      {
        type: 'object',
        properties: {
          ...schemaProperties,
        },
      }
    ],
  },
  create() {}
}
  `,
    `
module.exports = {
  meta: {
    schema: [
      {
        type: 'object',
        properties: Object.fromEntries(
          Object.keys(DEFAULT_OPTIONS).map((code) => [
            code,
            { type: 'boolean' }
          ])
        ),
        additionalProperties: false
      }
    ],
  },
  create() {}
}
    `,
  ],

  invalid: [
    {
      code: `
module.exports = {
  meta: {
    schema: [
      {
        elements: { type: 'string' },
        type: 'array',
      },
    ],
  },
  create() {}
};
`,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 8,
          line: 5,
          messageId: 'missingDescription',
        },
      ],
    },
    {
      code: `
module.exports = {
  meta: {
    schema: [
      {
        [unknownKey]: 'Computed.',
        elements: { type: 'string' },
        type: 'array',
      },
    ],
  },
  create() {}
};
`,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 9,
          line: 5,
          messageId: 'missingDescription',
        },
      ],
    },
    {
      code: `
module.exports = {
  meta: {
    schema: [
      {
        [unknownKey()]: 'Computed.',
        elements: { type: 'string' },
        type: 'array',
      },
    ],
  },
  create() {}
};
`,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 9,
          line: 5,
          messageId: 'missingDescription',
        },
      ],
    },
    {
      code: `
const otherKey = 'other';

module.exports = {
  meta: {
    schema: [
      {
        [otherKey]: 'Computed.',
        elements: { type: 'string' },
        type: 'array',
      },
    ],
  },
  create() {}
};
`,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 11,
          line: 7,
          messageId: 'missingDescription',
        },
      ],
    },
    {
      code: `
module.exports = {
  meta: {
    schema: [
      {
        ['de' + 'scription']: 'Dynamic.',
        elements: { type: 'string' },
        type: 'array',
      },
    ],
  },
  create() {}
};
`,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 9,
          line: 5,
          messageId: 'missingDescription',
        },
      ],
    },
    {
      code: `
module.exports = {
  meta: {
    schema: [
      {
        properties: {
          something: {
            type: 'string',
          }
        },
        type: 'object',
      },
    ],
  },
  create() {}
};
`,
      errors: [
        {
          column: 22,
          endColumn: 12,
          endLine: 9,
          line: 7,
          messageId: 'missingDescription',
        },
      ],
    },
    {
      code: `
module.exports = {
  meta: {
    schema: [
      {
        oneOf: [
          {
            elements: { type: 'string' },
            type: 'array',
          }
        ],
      },
    ],
  },
  create() {}
};
`,
      errors: [
        {
          column: 11,
          endColumn: 12,
          endLine: 10,
          line: 7,
          messageId: 'missingDescription',
        },
      ],
    },
    {
      code: `
module.exports = {
  meta: {
    schema: [
      {
        type: 'object',
        $defs: {
          directiveConfigSchema: {
            oneOf: [
              {
                type: 'boolean',
                default: true,
              },
            ],
          },
        },
        additionalProperties: false,
        properties: {
          'ts-check': {
            $ref: '#/items/0/$defs/directiveConfigSchema',
          },
        },
      },
    ],
  },
  create() {}
};
`,
      errors: [
        {
          column: 23,
          endColumn: 12,
          endLine: 21,
          line: 19,
          messageId: 'missingDescription',
        },
      ],
    },
  ],
});
