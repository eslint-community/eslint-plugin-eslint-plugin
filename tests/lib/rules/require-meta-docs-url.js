/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

'use strict';

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/require-meta-docs-url');

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
  },
});

tester.run('require-meta-docs-url', rule, {
  valid: [
    'foo()',
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
      options: [{
        pattern: 'path/to/{{name}}.md',
      }],
    },
    {
      filename: 'test-rule',
      code: `
        module.exports = {
          meta: {docs: {url: "path/to/test-rule.md"}},
          create() {}
        }
      `,
      options: [{
        pattern: 'path/to/{{name}}.md',
      }],
    },
  ],

  invalid: [
    {
      code: `
        module.exports = function() {}
      `,
      output: null,
      errors: ['Rules should export a `meta.docs.url` property.'],
    },
    {
      code: `
        module.exports = {
          meta,
          create() {}
        }
      `,
      output: null,
      errors: ['Rules should export a `meta.docs.url` property.'],
    },
    {
      code: `
        module.exports = {
          meta: 100,
          create() {}
        }
      `,
      output: null,
      errors: ['Rules should export a `meta.docs.url` property.'],
    },
    {
      code: `
        module.exports = {
          meta: {},
          create() {}
        }
      `,
      output: null,
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      errors: ['`meta.docs.url` property must be a string.'],
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
      errors: ['Rules should export a `meta.docs.url` property.'],
    },

    // -------------------------------------------------------------------------
    // pattern option without filename
    // -------------------------------------------------------------------------
    {
      code: `
        module.exports = function() {}
      `,
      output: null,
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
    },
    {
      code: `
        module.exports = {
          meta,
          create() {}
        }
      `,
      output: null,
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
    },
    {
      code: `
        module.exports = {
          meta: 100,
          create() {}
        }
      `,
      output: null,
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
    },
    {
      code: `
        module.exports = {
          meta: {},
          create() {}
        }
      `,
      output: null,
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['`meta.docs.url` property must be a string.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
    },

    // -------------------------------------------------------------------------
    // pattern option with filename
    // -------------------------------------------------------------------------
    {
      filename: 'test.js',
      code: `
        module.exports = function() {}
      `,
      output: null,
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['`meta.docs.url` property must be `plugin-name/test.md`.'],
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
      options: [{
        pattern: 'plugin-name/{{ name }}.md',
      }],
      errors: ['Rules should export a `meta.docs.url` property.'],
    },
  ],
});
