'use strict';

const { readdirSync, readFileSync } = require('fs');
const path = require('path');
const assert = require('chai').assert;
const plugin = require('../..');

const RULE_NAMES = Object.keys(plugin.rules);

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
});
