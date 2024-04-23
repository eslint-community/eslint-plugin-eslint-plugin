/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

'use strict';

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

const RuleTester = require('../eslint-rule-tester').RuleTester;
const rule = require('../../../lib/rules/require-meta-docs-url');

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
    },
  ],

  invalid: [
    {
      code: `
        module.exports = function(context) { return {}; }
      `,
      output: null,
      errors: [{ messageId: 'missing', type: 'FunctionExpression' }],
    },
    {
      // No `meta`. Violation on `create`.
      code: 'module.exports = { create() {} }',
      output: null,
      errors: [{ messageId: 'missing', type: 'FunctionExpression' }],
    },
    {
      code: `
        module.exports = {
          meta,
          create() {}
        }
      `,
      output: null,
      errors: [{ messageId: 'missing', type: 'Identifier' }],
    },
    {
      code: `
        module.exports = {
          meta: 100,
          create() {}
        }
      `,
      output: null,
      errors: [{ messageId: 'missing', type: 'Literal' }],
    },
    {
      code: `
        module.exports = {
          meta: {},
          create() {}
        }
      `,
      output: null,
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
    {
      code: `
        module.exports = {
          meta: {
            docs
          },
          create() {}
        }
      `,
      output: null,
      errors: [{ messageId: 'missing', type: 'Identifier' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'wrongType', type: 'Literal' }],
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
      errors: [{ messageId: 'wrongType', type: 'Literal' }],
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
      errors: [{ messageId: 'wrongType', type: 'Identifier' }],
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
      errors: [{ messageId: 'wrongType', type: 'Identifier' }],
    },
    {
      code: `
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'FunctionExpression' }],
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
      errors: [{ messageId: 'missing', type: 'Identifier' }],
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
      errors: [{ messageId: 'missing', type: 'Literal' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
    {
      code: `
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
      errors: [{ messageId: 'missing', type: 'Identifier' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'wrongType', type: 'Literal' }],
    },
    {
      code: `
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'FunctionExpression' }],
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
      errors: [{ messageId: 'missing', type: 'Identifier' }],
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
      errors: [{ messageId: 'missing', type: 'Literal' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'mismatch', type: 'Literal' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
    },
    {
      filename: 'test.js',
      code: `
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
      errors: [{ messageId: 'missing', type: 'Identifier' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
        },
      ],
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
        },
      ],
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
        },
      ],
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
        },
      ],
    },
    {
      filename: 'test.js',
      code: `
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
      errors: [{ messageId: 'missing', type: 'ObjectExpression' }],
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
        },
      ],
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
        },
      ],
    },
  ],
});
