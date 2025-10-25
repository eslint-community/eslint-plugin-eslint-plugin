import { RuleTester } from 'eslint';

import rule from '../../../lib/rules/unique-test-case-names.ts';

/**
 * Returns the code for some valid test cases
 * @param cases The code representation of valid test cases
 * @returns Code representing the test cases
 */
function getTestCases(valid: string[], invalid: string[] = []): string {
  return `
    new RuleTester().run('foo', bar, {
      valid: [
        ${valid.join(',\n        ')},
      ],
      invalid: [
        ${invalid.join(',\n        ')},
      ]
    });
  `;
}

const errorBuffer = 3; // Lines before the test cases start

const error = (line?: number) => ({
  messageId: 'notUnique',
  ...(typeof line === 'number' ? { line } : {}),
});

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'module' },
});
ruleTester.run('unique-test-case-names', rule, {
  valid: [
    {
      code: getTestCases(['"foo"', '"bar"', '"baz"']),
      name: 'only shorthand strings',
    },
    {
      code: getTestCases(['"foo"', '"foo"', '"foo"']),
      name: 'redundant shorthand strings',
    },
    {
      code: getTestCases(['"foo"', '"bar"', '{ code: "foo" }']),
      name: 'shorthand strings and object without name',
    },
    {
      code: getTestCases([
        '{ code: "foo" }',
        '{ code: "bar", name: "my test" }',
      ]),
      name: 'object without name and with name',
    },
    {
      code: getTestCases([
        '{ code: "foo", name: "my test" }',
        '{ code: "bar", name: "my other test" }',
      ]),
      name: 'object with unique names',
    },
    {
      code: getTestCases(['foo']),
      name: 'non-string, non-object test case (identifier)',
    },
    {
      code: getTestCases(['foo()']),
      name: 'non-string, non-object test case (function)',
    },
  ],

  invalid: [
    {
      code: getTestCases([
        '{ code: "foo", name: "my test" }',
        '{ code: "bar", name: "my other test" }',
        '{ code: "baz", name: "my test" }',
        '{ code: "bla", name: "my other test" }',
      ]),
      errors: [error(errorBuffer + 3), error(errorBuffer + 4)],
      name: 'object with non-unique names',
    },
  ],
});
