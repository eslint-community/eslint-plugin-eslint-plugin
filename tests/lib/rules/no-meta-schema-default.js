// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/no-meta-schema-default.js';
import { RuleTester } from '../../utils/eslint-rule-tester.js';

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});

ruleTester.run('no-meta-schema-default', rule, {
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
              properties: null,
              additionalProperties: false
            }
          ],
        },
        create() {}
      }
    `,
    `
      const schemaProperties = Object.freeze({});

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
                default: [],
              },
            ],
          },
          create() {}
        };
      `,
      errors: [
        {
          messageId: 'foundDefault',
          line: 8,
          column: 17,
          endLine: 8,
          endColumn: 24,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {
            schema: [
              {
                elements: { type: 'string', default: 'foo' },
                type: 'array',
              },
            ],
          },
          create() {}
        };
      `,
      errors: [
        {
          messageId: 'foundDefault',
          line: 6,
          column: 45,
          endLine: 6,
          endColumn: 52,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {
            schema: {
              anyOf: [
                {
                  elements: { type: 'string' },
                  type: 'array',
                  default: [],
                },
                {
                  type: 'string',
                  default: 'foo',
                }
              ],
            },
          },
          create() {}
        };
      `,
      errors: [
        {
          messageId: 'foundDefault',
          line: 9,
          column: 19,
          endLine: 9,
          endColumn: 26,
        },
        {
          messageId: 'foundDefault',
          line: 13,
          column: 19,
          endLine: 13,
          endColumn: 26,
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
                properties: {
                  foo: { type: 'string', default: 'bar' },
                  baz: { type: 'number', default: 42 },
                },
              },
            ]
          },
          create() {}
        };
      `,
      errors: [
        {
          messageId: 'foundDefault',
          line: 8,
          column: 42,
          endLine: 8,
          endColumn: 49,
        },
        {
          messageId: 'foundDefault',
          line: 9,
          column: 42,
          endLine: 9,
          endColumn: 49,
        },
      ],
    },
  ],
});
