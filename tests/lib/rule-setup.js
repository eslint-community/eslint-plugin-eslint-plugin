'use strict';

const { readdirSync, readFileSync } = require('fs');
const path = require('path');
const assert = require('chai').assert;
const plugin = require('../..');

const RULE_NAMES = Object.keys(plugin.rules);
const RULE_NAMES_RECOMMENDED = new Set(
  Object.keys(plugin.configs.recommended.rules)
);

const MESSAGES = {
  fixable:
    '⚒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#--fix) can automatically fix some of the problems reported by this rule.',
  configRecommended:
    '✔️ The `"extends": "plugin:eslint-plugin/recommended"` property in a configuration file enables this rule.',
  hasSuggestions:
    '💡 Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).',
};

/**
 * @param {string} string - to operate on
 * @returns the string with a capitalized first letter
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Get list of named options from a JSON schema (used for rule schemas).
 * @param {Object|Array} jsonSchema - the JSON schema to check
 * @returns {String[]} list of named options
 */
function getAllNamedOptions(jsonSchema) {
  if (!jsonSchema) {
    return [];
  }

  if (Array.isArray(jsonSchema)) {
    return jsonSchema.flatMap((item) => getAllNamedOptions(item));
  }

  if (jsonSchema.items) {
    return getAllNamedOptions(jsonSchema.items);
  }

  if (jsonSchema.properties) {
    return Object.keys(jsonSchema.properties);
  }

  return [];
}

describe('rule setup is correct', () => {
  it('should have a list of exported rules and rules directory that match', () => {
    const filePath = path.join(__dirname, '..', 'lib', 'rules');
    const files = readdirSync(filePath);

    assert.deepStrictEqual(
      RULE_NAMES,
      files
        .filter((file) => !file.startsWith('.'))
        .map((file) => file.replace('.js', ''))
    );
  });

  describe('rule files', () => {
    for (const ruleName of RULE_NAMES) {
      const rule = plugin.rules[ruleName];
      describe(ruleName, () => {
        it('has the right properties', () => {
          const ALLOWED_CATEGORIES = ['Rules', 'Tests'];
          assert.ok(
            ALLOWED_CATEGORIES.includes(rule.meta.docs.category),
            'has an allowed category'
          );
        });

        it('should have the right contents', () => {
          const filePath = path.join(
            __dirname,
            '..',
            '..',
            'lib',
            'rules',
            `${ruleName}.js`
          );
          const file = readFileSync(filePath, 'utf8');

          assert.ok(
            file.includes("/** @type {import('eslint').Rule.RuleModule} */"),
            'includes jsdoc comment for rule type'
          );
        });
      });
    }
  });

  it('should have tests for all rules', () => {
    const filePath = path.join(__dirname, 'rules');
    const files = readdirSync(filePath);

    assert.deepStrictEqual(
      RULE_NAMES,
      files
        .filter((file) => !file.startsWith('.'))
        .map((file) => file.replace('.js', ''))
    );
  });

  it('should have documentation for all rules', () => {
    const filePath = path.join(__dirname, '..', '..', 'docs', 'rules');
    const files = readdirSync(filePath);

    assert.deepStrictEqual(
      RULE_NAMES,
      files
        .filter((file) => !file.startsWith('.'))
        .map((file) => file.replace('.md', ''))
    );
  });

  describe('rule documentation files', () => {
    for (const ruleName of RULE_NAMES) {
      const rule = plugin.rules[ruleName];
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'docs',
        'rules',
        `${ruleName}.md`
      );
      const fileContents = readFileSync(filePath, 'utf8');
      const lines = fileContents.split('\n');

      describe(ruleName, () => {
        it('should have the right contents (title, notices, etc)', () => {
          // Title
          assert.strictEqual(
            lines[0],
            `# ${capitalizeFirstLetter(
              rule.meta.docs.description
            )} (${ruleName})`,
            'first line has rule description and name'
          );
          assert.strictEqual(lines[1], '', 'second line is blank');

          // Rule Details
          assert.ok(
            fileContents.includes('## Rule Details'),
            'includes "## Rule Details" header'
          );

          // Examples
          assert.ok(
            fileContents.includes(
              'Examples of **incorrect** code for this rule'
            ),
            'includes incorrect examples'
          );
          assert.ok(
            fileContents.includes('Examples of **correct** code for this rule'),
            'includes correct examples'
          );

          // Decide which notices should be shown at the top of the doc.
          const expectedNotices = [];
          const unexpectedNotices = [];
          if (RULE_NAMES_RECOMMENDED.has('eslint-plugin/' + ruleName)) {
            expectedNotices.push('configRecommended');
          } else {
            unexpectedNotices.push('configRecommended');
          }
          if (rule.meta.fixable) {
            expectedNotices.push('fixable');
          } else {
            unexpectedNotices.push('fixable');
          }
          if (rule.meta.hasSuggestions) {
            expectedNotices.push('hasSuggestions');
          } else {
            unexpectedNotices.push('hasSuggestions');
          }

          // Ensure that expected notices are present in the correct order.
          let currentLineNumber = 1;
          for (const expectedNotice of expectedNotices) {
            assert.strictEqual(lines[currentLineNumber], '');
            assert.strictEqual(
              lines[currentLineNumber + 1],
              MESSAGES[expectedNotice]
            );
            currentLineNumber += 2;
          }

          // Ensure that unexpected notices are not present.
          for (const unexpectedNotice of unexpectedNotices) {
            assert.ok(
              !fileContents.includes(MESSAGES[unexpectedNotice]),
              'does not include notice: ' + MESSAGES[unexpectedNotice]
            );
          }

          // Check if the rule has configuration options.
          if (
            (Array.isArray(rule.meta.schema) && rule.meta.schema.length > 0) ||
            (typeof rule.meta.schema === 'object' &&
              Object.keys(rule.meta.schema).length > 0)
          ) {
            // Should have a configuration section header:
            assert.ok(
              fileContents.includes('## Options'),
              'Should have an "## Options" section'
            );

            // Ensure all configuration options are mentioned.
            for (const namedOption of getAllNamedOptions(rule.meta.schema)) {
              assert.ok(
                fileContents.includes(namedOption),
                'Should mention the `' + namedOption + '` option'
              );
            }
          } else {
            // Should NOT have any options/config section headers:
            assert.notOk(
              fileContents.includes('# Options'),
              'Should not have an "Options" section'
            );
            assert.notOk(
              fileContents.includes('# Config'),
              'Should not have a "Config" section'
            );
          }
        });
      });
    }
  });
});
