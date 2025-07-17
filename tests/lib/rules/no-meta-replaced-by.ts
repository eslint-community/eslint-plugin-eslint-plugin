/**
 * @fileoverview Disallows the usage of `meta.replacedBy` property
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import rule from '../../../lib/rules/no-meta-replaced-by.js';
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

  return {
    ...test,
    code,
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
