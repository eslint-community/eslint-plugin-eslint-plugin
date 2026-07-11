/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

import { RuleTester } from 'eslint';
import rule from '../../../lib/rules/require-meta-docs-url.ts';

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const tester = new RuleTester({
  languageOptions: {
    sourceType: 'commonjs',
  },
});

tester.run('require-meta-docs-url', rule, {
  valid: [
    'foo()', // No rule.
    'module.exports = {};', // No rule.
    `
      const docs = require('./rule.docs.js');
      module.exports = {
        meta: { docs },
        create() {}
      };
    `,
    `
      const docs = require('./rule.docs.js');
      module.exports = {
        meta: { docs: { ...docs } },
        create() {}
      };
    `,
    {
      code: `
        import docs from './rule.docs.js';
        export default {
          meta: { docs },
          create() {}
        };
      `,
      languageOptions: { sourceType: 'module' },
    },
    `
      const baseRule = require('./base-rule.js');
      module.exports = {
        meta: { docs: baseRule.meta.docs },
        create() {}
      };
    `,
    `
      const baseRule = require('./base-rule.js');
      module.exports = {
        meta: { docs: { ...baseRule.meta.docs } },
        create() {}
      };
    `,
    `
      module.exports = {
        meta: { docs: getDocs() },
        create() {}
      };
    `,
    `
      module.exports.meta = {docs: {url: ""}}
      module.exports.create = function() {}
    `,
    `
      module.exports = {
        meta: {docs: {url: ""}},
        create() {}
      }
    `,
    `
      module.exports = {
        ["meta"]: {["docs"]: {["url"]: ""}},
        create() {}
      }
    `,
    {
      code: `
        // If filename is not provided, don't check the value.
        module.exports = {
          meta: {docs: {url: ""}},
          create() {}
        }
      `,
      options: [
        {
          pattern: 'path/to/{{name}}.md',
        },
      ],
      name: "no filename (pattern: 'path/to/{{name}}.md')",
    },
    {
      filename: 'test-rule',
      code: `
        module.exports = {
          meta: {docs: {url: "path/to/test-rule.md"}},
          create() {}
        }
      `,
      options: [
        {
          pattern: 'path/to/{{name}}.md',
        },
      ],
      name: "matching path (pattern: 'path/to/{{name}}.md')",
    },
    {
      // CJS file extension
      filename: 'test-rule.cjs',
      code: `
        module.exports = {
          meta: {docs: {url: "path/to/test-rule.md"}},
          create() {}
        }
      `,
      options: [{ pattern: 'path/to/{{name}}.md' }],
      name: "matching path with cjs extension (pattern: 'path/to/{{name}}.md')",
    },
    {
      // ESM
      filename: 'test-rule',
      code: `
        export default {
          meta: {docs: {url: "path/to/test-rule.md"}},
          create() {}
        }
      `,
      options: [
        {
          pattern: 'path/to/{{name}}.md',
        },
      ],
      languageOptions: { sourceType: 'module' },
      name: "ESM (pattern: 'path/to/{{name}}.md')",
    },
    {
      // TypeScript
      filename: 'rules/test-rule.ts',
      code: `
        export default {
          meta: {docs: {url: "path/to/test-rule.md"}},
          create() {}
        }
      `,
      options: [{ pattern: 'path/to/{{name}}.md' }],
      languageOptions: { sourceType: 'module' },
      name: "TypeScript (pattern: 'path/to/{{name}}.md')",
    },
    {
      // `url` in variable.
      filename: 'test-rule',
      code: `
        const url = "path/to/test-rule.md";
        module.exports = {
          meta: {docs: {url}},
          create() {}
        }
      `,
      options: [
        {
          pattern: 'path/to/{{name}}.md',
        },
      ],
      name: "url in variable (pattern: 'path/to/{{name}}.md')",
    },
    {
      // Can't determine `url` value statically.
      filename: 'test-rule',
      code: `
        module.exports = {
          meta: {docs: {url: foo }},
          create() {}
        }
      `,
      options: [
        {
          pattern: 'path/to/{{name}}.md',
        },
      ],
      name: "undefined variable reference (pattern: 'path/to/{{name}}.md')",
    },
    {
      // Can't determine `url` value statically.
      filename: 'test-rule',
      code: `
        module.exports = {
          meta: {docs: {url: getUrl() }},
          create() {}
        }
      `,
      options: [
        {
          pattern: 'path/to/{{name}}.md',
        },
      ],
      name: "undefined function (pattern: 'path/to/{{name}}.md')",
    },
    {
      // Spread.
      filename: 'test-rule',
      code: `
        const extraDocs = { url: "path/to/test-rule.md" };
        const extraMeta = { docs: { ...extraDocs } };
        module.exports = {
          meta: { ...extraMeta },
          create() {}
        }
      `,
      options: [{ pattern: 'path/to/{{name}}.md' }],
      name: "spread (pattern: 'path/to/{{name}}.md')",
    },
  ],

  invalid: [
    {
      code: `
        module.exports = function(context) { return {}; }
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'FunctionExpression',
          column: 26,
          endColumn: 58,
          endLine: 2,
          line: 2,
        },
      ],
    },
    {
      // No `meta`. Violation on `create`.
      code: 'module.exports = { create() {} }',
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'FunctionExpression',
          column: 26,
          endColumn: 31,
          endLine: 1,
          line: 1,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta,
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'Identifier',
          column: 11,
          endColumn: 15,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: 100,
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'Literal',
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {},
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {
            fixable: null
          },
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 12,
          endLine: 5,
          line: 3,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {
            fixable: null,
          },
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 12,
          endLine: 5,
          line: 3,
        },
      ],
    },
    {
      code: `
        const docs = {};
        module.exports = {
          meta: {
            docs
          },
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'Identifier',
          column: 13,
          endColumn: 17,
          endLine: 5,
          line: 5,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {
            docs: {}
          },
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 19,
          endColumn: 21,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {
            docs: {
              description: ""
            }
          },
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 19,
          endColumn: 14,
          endLine: 6,
          line: 4,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {
            docs: {
              description: "",
            }
          },
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 19,
          endColumn: 14,
          endLine: 6,
          line: 4,
        },
      ],
    },
    {
      code: `
        module.exports = {
          meta: {
            docs: {
              url: 100,
            }
          },
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'Literal',
          column: 20,
          endColumn: 23,
          endLine: 5,
          line: 5,
        },
      ],
    },
    {
      // `url` is null
      code: `
        module.exports = {
          meta: {
            docs: { url: null }
          },
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'Literal',
          column: 26,
          endColumn: 30,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      // `url` is undefined
      code: `
        module.exports = {
          meta: {
            docs: { url: undefined }
          },
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'Identifier',
          column: 26,
          endColumn: 35,
          endLine: 4,
          line: 4,
        },
      ],
    },
    {
      // `url` in variable.
      code: `
        const url = 100;
        module.exports = {
          meta: {
            docs: { url }
          },
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'wrongType',
          type: 'Identifier',
          column: 21,
          endColumn: 24,
          endLine: 5,
          line: 5,
        },
      ],
    },
    {
      code: `
        const url = {};
        module.exports = {
          meta: {
            docs: {
              ...url
            }
          },
          create() {}
        }
      `,
      output: null,
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 19,
          endColumn: 14,
          endLine: 7,
          line: 5,
        },
      ],
    },

    // -------------------------------------------------------------------------
    // pattern option without filename
    // -------------------------------------------------------------------------
    {
      code: `
        module.exports = function(context) { return {}; }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'FunctionExpression',
          column: 26,
          endColumn: 58,
          endLine: 2,
          line: 2,
        },
      ],
      name: "missing meta (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      code: `
        module.exports = {
          meta,
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'Identifier',
          column: 11,
          endColumn: 15,
          endLine: 3,
          line: 3,
        },
      ],
      name: "meta as variable (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      code: `
        module.exports = {
          meta: 100,
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'Literal',
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
        },
      ],
      name: "meta set to number (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      code: `
        module.exports = {
          meta: {},
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
        },
      ],
      name: "empty meta (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      code: `
        module.exports = {
          meta: {
            fixable: null
          },
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 12,
          endLine: 5,
          line: 3,
        },
      ],
      name: "missing docs with other prop having no trailing comma (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      code: `
        module.exports = {
          meta: {
            fixable: null,
          },
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 12,
          endLine: 5,
          line: 3,
        },
      ],
      name: "missing docs (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      code: `
        const docs = {};
        module.exports = {
          meta: {
            docs
          },
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'Identifier',
          column: 13,
          endColumn: 17,
          endLine: 5,
          line: 5,
        },
      ],
      name: "docs as variable (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      code: `
        module.exports = {
          meta: {
            docs: {}
          },
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 19,
          endColumn: 21,
          endLine: 4,
          line: 4,
        },
      ],
      name: "docs as empty object (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      code: `
        module.exports = {
          meta: {
            docs: {
              description: ""
            }
          },
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 19,
          endColumn: 14,
          endLine: 6,
          line: 4,
        },
      ],
      name: "missing url with other prop as string (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      code: `
        module.exports = {
          meta: {
            docs: {
              description: "",
            }
          },
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 19,
          endColumn: 14,
          endLine: 6,
          line: 4,
        },
      ],
      name: "missing url with other prop as string with trailing comma (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      code: `
        module.exports = {
          meta: {
            docs: {
              url: 100,
            }
          },
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'wrongType',
          type: 'Literal',
          column: 20,
          endColumn: 23,
          endLine: 5,
          line: 5,
        },
      ],
      name: "url as number (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      code: `
        const url = {};
        module.exports = {
          meta: {
            docs: {
              ...url
            }
          },
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 19,
          endColumn: 14,
          endLine: 7,
          line: 5,
        },
      ],
      name: "spread url variable (pattern: 'plugin-name/{{ name }}.md')",
    },

    // -------------------------------------------------------------------------
    // pattern option with filename
    // -------------------------------------------------------------------------
    {
      filename: 'test.js',
      code: `
        module.exports = function(context) { return {}; }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'FunctionExpression',
          column: 26,
          endColumn: 58,
          endLine: 2,
          line: 2,
        },
      ],
      name: "missing meta with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      filename: 'test.js',
      code: `
        module.exports = {
          meta,
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'Identifier',
          column: 11,
          endColumn: 15,
          endLine: 3,
          line: 3,
        },
      ],
      name: "meta as variable with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      filename: 'test.js',
      code: `
        module.exports = {
          meta: 100,
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'Literal',
          column: 17,
          endColumn: 20,
          endLine: 3,
          line: 3,
        },
      ],
      name: "meta set to number with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      filename: 'test.js',
      code: `
        module.exports = {
          meta: {},
          create() {}
        }
      `,
      output: `
        module.exports = {
          meta: {
docs: {
url: "plugin-name/test.md"
}
},
          create() {}
        }
      `,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
        },
      ],
      name: "empty meta with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      // URL missing, spreads present.
      filename: 'test.js',
      code: `
        const extraDocs = { };
        const extraMeta = { docs: { ...extraDocs } };
        module.exports = {
          meta: { ...extraMeta },
          create() {}
        }
      `,
      output: `
        const extraDocs = { };
        const extraMeta = { docs: { ...extraDocs,
url: "plugin-name/test.md" } };
        module.exports = {
          meta: { ...extraMeta },
          create() {}
        }
      `,
      options: [{ pattern: 'plugin-name/{{ name }}.md' }],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 35,
          endColumn: 51,
          endLine: 3,
          line: 3,
        },
      ],
      name: "missing url inside spreads (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      // URL wrong inside spreads.
      filename: 'test.js',
      code: `
        const extraDocs = { url: 'wrong' };
        const extraMeta = { docs: { ...extraDocs } };
        module.exports = {
          meta: { ...extraMeta },
          create() {}
        }
      `,
      output: `
        const extraDocs = { url: "plugin-name/test.md" };
        const extraMeta = { docs: { ...extraDocs } };
        module.exports = {
          meta: { ...extraMeta },
          create() {}
        }
      `,
      options: [{ pattern: 'plugin-name/{{ name }}.md' }],
      errors: [
        {
          messageId: 'mismatch',
          type: 'Literal',
          column: 34,
          endColumn: 41,
          endLine: 2,
          line: 2,
        },
      ],
      name: "url wrong inside spreads (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      // CJS file extension
      filename: 'test.cjs',
      code: `
        module.exports = {
          meta: {},
          create() {}
        }
      `,
      output: `
        module.exports = {
          meta: {
docs: {
url: "plugin-name/test.md"
}
},
          create() {}
        }
      `,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
        },
      ],
      name: "empty meta with filename and cjs extension (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      // ESM
      filename: 'test.js',
      code: `
        export default {
          meta: {},
          create() {}
        }
      `,
      output: `
        export default {
          meta: {
docs: {
url: "plugin-name/test.md"
}
},
          create() {}
        }
      `,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      languageOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
        },
      ],
      name: "empty meta with filename and esm (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      // TypeScript
      filename: 'test.ts',
      code: `
        export default {
          meta: {},
          create() {}
        }
      `,
      output: `
        export default {
          meta: {
docs: {
url: "plugin-name/test.md"
}
},
          create() {}
        }
      `,
      options: [{ pattern: 'plugin-name/{{ name }}.md' }],
      languageOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 19,
          endLine: 3,
          line: 3,
        },
      ],
      name: "empty meta with filename and TypeScript (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      filename: 'test.js',
      code: `
        module.exports = {
          meta: {
            fixable: null
          },
          create() {}
        }
      `,
      output: `
        module.exports = {
          meta: {
            fixable: null,
docs: {
url: "plugin-name/test.md"
}
          },
          create() {}
        }
      `,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 12,
          endLine: 5,
          line: 3,
        },
      ],
      name: "missing docs with other prop having no trailing comma > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      filename: 'test.js',
      code: `
        module.exports = {
          meta: {
            fixable: null,
          },
          create() {}
        }
      `,
      output: `
        module.exports = {
          meta: {
            fixable: null,
docs: {
url: "plugin-name/test.md"
},
          },
          create() {}
        }
      `,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 17,
          endColumn: 12,
          endLine: 5,
          line: 3,
        },
      ],
      name: "missing docs > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      filename: 'test.js',
      code: `
        const docs = {};
        module.exports = {
          meta: {
            docs
          },
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'Identifier',
          column: 13,
          endColumn: 17,
          endLine: 5,
          line: 5,
        },
      ],
      name: "docs as variable > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      filename: 'test.js',
      code: `
        module.exports = {
          meta: {
            docs: {}
          },
          create() {}
        }
      `,
      output: `
        module.exports = {
          meta: {
            docs: {
url: "plugin-name/test.md"
}
          },
          create() {}
        }
      `,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 19,
          endColumn: 21,
          endLine: 4,
          line: 4,
        },
      ],
      name: "docs as empty object > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      filename: 'test.js',
      code: `
        module.exports = {
          meta: {
            docs: {
              description: ""
            }
          },
          create() {}
        }
      `,
      output: `
        module.exports = {
          meta: {
            docs: {
              description: "",
url: "plugin-name/test.md"
            }
          },
          create() {}
        }
      `,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 19,
          endColumn: 14,
          endLine: 6,
          line: 4,
        },
      ],
      name: "missing url with other prop as string > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      filename: 'test.js',
      code: `
        module.exports = {
          meta: {
            docs: {
              description: "",
            }
          },
          create() {}
        }
      `,
      output: `
        module.exports = {
          meta: {
            docs: {
              description: "",
url: "plugin-name/test.md",
            }
          },
          create() {}
        }
      `,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 19,
          endColumn: 14,
          endLine: 6,
          line: 4,
        },
      ],
      name: "missing url with other prop as string with trailing comma > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      filename: 'test.js',
      code: `
        module.exports = {
          meta: {
            docs: {
              url: 100,
            }
          },
          create() {}
        }
      `,
      output: `
        module.exports = {
          meta: {
            docs: {
              url: "plugin-name/test.md",
            }
          },
          create() {}
        }
      `,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          message: '`meta.docs.url` property must be `plugin-name/test.md`.',
          type: 'Literal',
          column: 20,
          endColumn: 23,
          endLine: 5,
          line: 5,
        },
      ],
      name: "url as number > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      // `url` in variable, can't autofix it.
      filename: 'test.js',
      code: `
        const url = 'wrong-url';
        module.exports = {
          meta: {
            docs: { url }
          },
          create() {}
        }
      `,
      output: null,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          message: '`meta.docs.url` property must be `plugin-name/test.md`.',
          type: 'Identifier',
          column: 21,
          endColumn: 24,
          endLine: 5,
          line: 5,
        },
      ],
      name: "url in variable > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      // `url` is `null`.
      filename: 'test.js',
      code: `
        module.exports = {
          meta: {
            docs: { url: null }
          },
          create() {}
        }
      `,
      output: `
        module.exports = {
          meta: {
            docs: { url: "plugin-name/test.md" }
          },
          create() {}
        }
      `,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          message: '`meta.docs.url` property must be `plugin-name/test.md`.',
          type: 'Literal',
          column: 26,
          endColumn: 30,
          endLine: 4,
          line: 4,
        },
      ],
      name: "url is null > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      // `url` is `undefined`.
      filename: 'test.js',
      code: `
        module.exports = {
          meta: {
            docs: { url: undefined }
          },
          create() {}
        }
      `,
      output: `
        module.exports = {
          meta: {
            docs: { url: "plugin-name/test.md" }
          },
          create() {}
        }
      `,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          message: '`meta.docs.url` property must be `plugin-name/test.md`.',
          type: 'Identifier',
          column: 26,
          endColumn: 35,
          endLine: 4,
          line: 4,
        },
      ],
      name: "url is undefined > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      filename: 'test.js',
      code: `
        const url = {};
        module.exports = {
          meta: {
            docs: {
              ...url
            }
          },
          create() {}
        }
      `,
      output: `
        const url = {};
        module.exports = {
          meta: {
            docs: {
              ...url,
url: "plugin-name/test.md"
            }
          },
          create() {}
        }
      `,
      options: [
        {
          pattern: 'plugin-name/{{ name }}.md',
        },
      ],
      errors: [
        {
          messageId: 'missing',
          type: 'ObjectExpression',
          column: 19,
          endColumn: 14,
          endLine: 7,
          line: 5,
        },
      ],
      name: "spread url variable > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      // Function rule in variable.
      filename: 'test.js',
      code: `const rule = function(context) { return {}; }; module.exports = rule;`,
      output: null,
      options: [{ pattern: 'plugin-name/{{ name }}.md' }],
      errors: [
        {
          message: '`meta.docs.url` property is missing.',
          type: 'FunctionExpression',
          column: 14,
          endColumn: 46,
          endLine: 1,
          line: 1,
        },
      ],
      name: "function rule in variable > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
    {
      // Object rule in variable.
      filename: 'test.js',
      code: `const rule = { create: function(context) { return {}; }, meta: {} }; module.exports = rule;`,
      output: `const rule = { create: function(context) { return {}; }, meta: {
docs: {
url: "plugin-name/test.md"
}
} }; module.exports = rule;`,
      options: [{ pattern: 'plugin-name/{{ name }}.md' }],
      errors: [
        {
          message: '`meta.docs.url` property is missing.',
          type: 'ObjectExpression',
          column: 64,
          endColumn: 66,
          endLine: 1,
          line: 1,
        },
      ],
      name: "object rule in variable > with filename (pattern: 'plugin-name/{{ name }}.md')",
    },
  ],
});
