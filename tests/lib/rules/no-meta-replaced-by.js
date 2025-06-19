/**
 * @fileoverview Disallows the usage of `meta.replacedBy` property
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-meta-replaced-by');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const valid = [
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
  {
    code: `
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
    errors: 0,
  },
];

const invalid = [
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
    errors: [{ messageId: 'useNewFormat' }],
  },
];

const testToESM = (test) => {
  if (typeof test === 'string') {
    return test.replace('module.exports =', 'export default');
  }

  const code = test.code.replace('module.exports =', 'export default');

  return {
    ...test,
    code,
  };
};

new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
}).run('no-meta-replaced-by', rule, {
  valid,
  invalid,
});

new RuleTester({
  languageOptions: { sourceType: 'module' },
}).run('no-meta-replaced-by', rule, {
  valid: valid.map(testToESM),
  invalid: invalid.map(testToESM),
});
