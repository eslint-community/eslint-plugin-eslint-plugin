import { RuleTester } from 'eslint';

import rule from '../../../lib/rules/test-case-name-property.ts';

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

const alwaysError = {
  messageId: 'nameRequiredAlways',
};

const objectsError = {
  messageId: 'nameRequiredObjects',
};

const objectsWithConfigError = {
  messageId: 'nameRequiredObjectsWithConfig',
};

const ruleTester = new RuleTester({
  languageOptions: { sourceType: 'commonjs' },
});
ruleTester.run('test-case-name-property', rule, {
  valid: [
    // default (object-with-config)
    getTestCases(['"foo"']),
    getTestCases(['"foo"', '"bar"']),
    getTestCases(['"foo"', '"bar"', '{ code: "foo" }']),
    getTestCases(['{ code: "foo" }', '{ code: "bar", name: "my test" }']),
    getTestCases([
      '{ code: "foo" }',
      '{ code: "foo", name: "my test", options: ["bar"] }',
      '{ code: "bar", name: "my other test" }',
    ]),
    getTestCases([
      '{ code: "foo" }',
      '{ code: "foo", name: "my test", settings: { setting1: "bar" } }',
      '{ code: "bar", name: "my other test" }',
    ]),
    getTestCases([
      '{ code: "foo", name: "my test", options: ["bar"], settings: { setting1: "bar" } }',
    ]),
    getTestCases([], ['{ code: "foo", errors: ["some error"] }']),
    getTestCases(
      [],
      [
        '{ code: "foo", errors: ["some error"] }',
        '{ code: "bar", name: "my test", errors: ["some error"]  }',
      ],
    ),
    getTestCases(
      [],
      [
        '{ code: "foo", errors: ["some error"] }',
        '{ code: "foo", name: "my test", options: ["bar"], errors: ["some error"] }',
        '{ code: "bar", name: "my other test", errors: ["some error"] }',
      ],
    ),
    getTestCases(
      [],
      [
        '{ code: "foo", errors: ["some error"] }',
        '{ code: "foo", name: "my test", settings: { setting1: "bar" } }',
        '{ code: "bar", name: "my other test", errors: ["some error"] }',
      ],
    ),
    getTestCases(
      [],
      [
        '{ code: "foo", name: "my test", options: ["bar"], settings: { setting1: "bar" }, errors: ["some error"] }',
      ],
    ),

    // object-with-config
    {
      code: getTestCases(['"foo"']),
      options: [{ require: 'objects-with-config' }],
      name: 'shorthand string (valid | require: objects-with-config)',
    },
    {
      code: getTestCases(['"foo"', '"bar"']),
      options: [{ require: 'objects-with-config' }],
      name: 'shorthand strings (valid | require: objects-with-config)',
    },
    {
      code: getTestCases(['"foo"', '"bar"', '{ code: "foo" }']),
      options: [{ require: 'objects-with-config' }],
      name: 'object without config (valid | require: objects-with-config)',
    },
    {
      code: getTestCases([
        '{ code: "foo" }',
        '{ code: "bar", name: "my test" }',
      ]),
      options: [{ require: 'objects-with-config' }],
      name: 'object with name and no config (valid | require: objects-with-config)',
    },
    {
      code: getTestCases([
        '{ code: "foo" }',
        '{ code: "foo", name: "my test", options: ["bar"] }',
        '{ code: "bar", name: "my other test" }',
      ]),
      options: [{ require: 'objects-with-config' }],
      name: 'object with options (valid | require: objects-with-config)',
    },
    {
      code: getTestCases([
        '{ code: "foo" }',
        '{ code: "foo", name: "my test", settings: { setting1: "bar" } }',
        '{ code: "bar", name: "my other test" }',
      ]),
      options: [{ require: 'objects-with-config' }],
      name: 'object with settings (valid | require: objects-with-config)',
    },
    {
      code: getTestCases([
        '{ code: "foo", name: "my test", options: ["bar"], settings: { setting1: "bar" } }',
      ]),
      options: [{ require: 'objects-with-config' }],
      name: 'object with options and settings (valid | require: objects-with-config)',
    },
    {
      code: getTestCases([], ['{ code: "foo", errors: ["some error"] }']),
      options: [{ require: 'objects-with-config' }],
      name: 'object without config (invalid | require: objects-with-config)',
    },
    {
      code: getTestCases(
        [],
        [
          '{ code: "foo", errors: ["some error"] }',
          '{ code: "bar", name: "my test", errors: ["some error"] }',
        ],
      ),
      options: [{ require: 'objects-with-config' }],
      name: 'object with name and no config (invalid | require: objects-with-config)',
    },
    {
      code: getTestCases(
        [],
        [
          '{ code: "foo", errors: ["some error"] }',
          '{ code: "foo", name: "my test", options: ["bar"], errors: ["some error"] }',
          '{ code: "bar", name: "my other test", errors: ["some error"] }',
        ],
      ),
      options: [{ require: 'objects-with-config' }],
      name: 'object with options (invalid | require: objects-with-config)',
    },
    {
      code: getTestCases(
        [],
        [
          '{ code: "foo", errors: ["some error"] }',
          '{ code: "foo", name: "my test", settings: { setting1: "bar" }, errors: ["some error"] }',
          '{ code: "bar", name: "my other test", errors: ["some error"] }',
        ],
      ),
      options: [{ require: 'objects-with-config' }],
      name: 'object with settings (invalid | require: objects-with-config)',
    },
    {
      code: getTestCases(
        [],
        [
          '{ code: "foo", name: "my test", options: ["bar"], settings: { setting1: "bar" }, errors: ["some error"] }',
        ],
      ),
      options: [{ require: 'objects-with-config' }],
      name: 'object with options and settings (invalid | require: objects-with-config)',
    },

    // objects
    {
      code: getTestCases(['"foo"']),
      options: [{ require: 'objects' }],
      name: 'shorthand string (valid | require: objects)',
    },
    {
      code: getTestCases(['"foo"', '"bar"']),
      options: [{ require: 'objects' }],
      name: 'shorthand strings (valid | require: objects)',
    },
    {
      code: getTestCases(['"foo"', '{ code: "bar", name: "my test" }']),
      options: [{ require: 'objects' }],
      name: 'object without config (valid | require: objects)',
    },
    {
      code: getTestCases([
        '{ code: "foo", name: "my first test" }',
        '{ code: "foo", name: "my second test", options: ["bar"] }',
        '{ code: "bar", name: "my third test" }',
      ]),
      options: [{ require: 'objects' }],
      name: 'object with options (valid | require: objects)',
    },
    {
      code: getTestCases([
        '{ code: "foo", name: "my first test" }',
        '{ code: "foo", name: "my second test", settings: { setting1: "bar" } }',
        '{ code: "bar", name: "my other test" }',
      ]),
      options: [{ require: 'objects' }],
      name: 'object with settings (valid | require: objects)',
    },
    {
      code: getTestCases([
        '{ code: "foo", name: "my test", options: ["bar"], settings: { setting1: "bar" } }',
      ]),
      options: [{ require: 'objects' }],
      name: 'object with options and settings (valid | require: objects)',
    },
    {
      code: getTestCases(
        [],
        ['{ code: "bar", name: "my test", errors: ["some error"] }'],
      ),
      options: [{ require: 'objects' }],
      name: 'object without config (invalid | require: objects)',
    },
    {
      code: getTestCases(
        [],
        [
          '{ code: "foo", name: "my first test", errors: ["some error"] }',
          '{ code: "foo", name: "my second test", options: ["bar"], errors: ["some error"] }',
          '{ code: "bar", name: "my third test", errors: ["some error"] }',
        ],
      ),
      options: [{ require: 'objects' }],
      name: 'object with options (invalid | require: objects)',
    },
    {
      code: getTestCases(
        [],
        [
          '{ code: "foo", name: "my first test", errors: ["some error"] }',
          '{ code: "foo", name: "my second test", settings: { setting1: "bar" }, errors: ["some error"] }',
          '{ code: "bar", name: "my other test", errors: ["some error"] }',
        ],
      ),
      options: [{ require: 'objects' }],
      name: 'object with settings (invalid | require: objects)',
    },
    {
      code: getTestCases(
        [],
        [
          '{ code: "foo", name: "my test", options: ["bar"], settings: { setting1: "bar" }, errors: ["some error"] }',
        ],
      ),
      options: [{ require: 'objects' }],
      name: 'object with options and settings (invalid | require: objects)',
    },

    // always
    {
      code: getTestCases(['{ code: "bar", name: "my test" }']),
      options: [{ require: 'always' }],
      name: 'object without config (valid | require: always)',
    },
    {
      code: getTestCases([
        '{ code: "foo", name: "my first test" }',
        '{ code: "foo", name: "my second test", options: ["bar"] }',
        '{ code: "bar", name: "my third test" }',
      ]),
      options: [{ require: 'always' }],
      name: 'object with options (valid | require: always)',
    },
    {
      code: getTestCases([
        '{ code: "foo", name: "my first test" }',
        '{ code: "foo", name: "my second test", settings: { setting1: "bar" } }',
        '{ code: "bar", name: "my third test" }',
      ]),
      options: [{ require: 'always' }],
      name: 'object with settings (valid | require: always)',
    },
    {
      code: getTestCases([
        '{ code: "foo", name: "my test", options: ["bar"], settings: { setting1: "bar" } }',
      ]),
      options: [{ require: 'always' }],
      name: 'object with options and settings (valid | require: always)',
    },
    {
      code: getTestCases(
        [],
        ['{ code: "bar", name: "my test", errors: ["some error"] }'],
      ),
      options: [{ require: 'always' }],
      name: 'object without config (invalid | require: always)',
    },
    {
      code: getTestCases(
        [],
        [
          '{ code: "foo", name: "my first test", errors: ["some error"] }',
          '{ code: "foo", name: "my second test", options: ["bar"], errors: ["some error"] }',
          '{ code: "bar", name: "my third test", errors: ["some error"] }',
        ],
      ),
      options: [{ require: 'always' }],
      name: 'object with options (invalid | require: always)',
    },
    {
      code: getTestCases(
        [],
        [
          '{ code: "foo", name: "my first test", errors: ["some error"] }',
          '{ code: "foo", name: "my second test", settings: { setting1: "bar" }, errors: ["some error"] }',
          '{ code: "bar", name: "my third test", errors: ["some error"] }',
        ],
      ),
      options: [{ require: 'always' }],
      name: 'object with settings (invalid | require: always)',
    },
    {
      code: getTestCases(
        [],
        [
          '{ code: "foo", name: "my test", options: ["bar"], settings: { setting1: "bar" }, errors: ["some error"] }',
        ],
      ),
      options: [{ require: 'always' }],
      name: 'object with options and settings (invalid | require: always)',
    },
  ],

  invalid: [
    // default (objects-with-config)
    {
      code: getTestCases(['{ code: "foo", options: ["bar"] }']),
      errors: [objectsWithConfigError],
    },
    {
      code: getTestCases(['{ code: "foo", settings: { setting1: "bar" } }']),
      errors: [objectsWithConfigError],
    },
    {
      code: getTestCases([
        '{ code: "foo", options: ["bar"], settings: { setting1: "bar" } }',
      ]),
      errors: [objectsWithConfigError],
    },
    // (objects-with-config)
    {
      code: getTestCases(['{ code: "foo", options: ["bar"] }']),
      options: [{ require: 'objects-with-config' }],
      errors: [objectsWithConfigError],
      name: 'object with options (require: objects-with-config)',
    },
    {
      code: getTestCases(['{ code: "foo", settings: { setting1: "bar" } }']),
      options: [{ require: 'objects-with-config' }],
      errors: [objectsWithConfigError],
      name: 'object with settings (require: objects-with-config)',
    },
    {
      code: getTestCases([
        '{ code: "foo", options: ["bar"], settings: { setting1: "bar" } }',
      ]),
      options: [{ require: 'objects-with-config' }],
      errors: [objectsWithConfigError],
      name: 'object with options and settings (require: objects-with-config)',
    },
    // (objects)
    {
      code: getTestCases(['{ code: "foo" }']),
      options: [{ require: 'objects' }],
      errors: [objectsError],
      name: 'object without config (require: objects)',
    },
    {
      code: getTestCases(['{ code: "foo", options: ["bar"] }']),
      options: [{ require: 'objects' }],
      errors: [objectsError],
      name: 'object with options (require: objects)',
    },
    {
      code: getTestCases(['{ code: "foo", settings: { setting1: "bar" } }']),
      options: [{ require: 'objects' }],
      errors: [objectsError],
      name: 'object with settings (require: objects)',
    },
    {
      code: getTestCases([
        '{ code: "foo", options: ["bar"], settings: { setting1: "bar" } }',
      ]),
      options: [{ require: 'objects' }],
      errors: [objectsError],
      name: 'object with options and settings (require: objects)',
    },
    // (always)
    {
      code: getTestCases(['"foo"']),
      options: [{ require: 'always' }],
      errors: [alwaysError],
      name: 'shorthand string (require: always)',
    },
    {
      code: getTestCases(['{ code: "foo" }']),
      options: [{ require: 'always' }],
      errors: [alwaysError],
      name: 'object without config (require: always)',
    },
    {
      code: getTestCases(['{ code: "foo", options: ["bar"] }']),
      options: [{ require: 'always' }],
      errors: [alwaysError],
      name: 'object with options (require: always)',
    },
    {
      code: getTestCases(['{ code: "foo", settings: { setting1: "bar" } }']),
      options: [{ require: 'always' }],
      errors: [alwaysError],
      name: 'object with settings (require: always)',
    },
    {
      code: getTestCases([
        '{ code: "foo", options: ["bar"], settings: { setting1: "bar" } }',
      ]),
      options: [{ require: 'always' }],
      errors: [alwaysError],
      name: 'object with options and settings (require: always)',
    },
  ],
});
