import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { assert, describe, it } from 'vitest';

import plugin from '../../lib/index.ts';

const RULE_NAMES = Object.keys(plugin.rules) as Array<
  keyof typeof plugin.rules
>;

// eslint-disable-next-line n/no-unsupported-features/node-builtins -- used in tests
const dirname = import.meta.dirname;

describe('rule setup is correct', () => {
  it('should have a list of exported rules and rules directory that match', () => {
    const filePath = path.join(dirname, '..', 'lib', 'rules');
    const files = readdirSync(filePath);

    assert.deepStrictEqual(
      RULE_NAMES,
      files
        .filter((file) => !file.startsWith('.'))
        .map((file) => file.replace('.ts', '')),
    );
  });

  describe('rule files', () => {
    for (const ruleName of RULE_NAMES) {
      const rule = plugin.rules[ruleName];
      describe(ruleName, () => {
        it('has the right properties', () => {
          const ALLOWED_CATEGORIES = ['Rules', 'Tests'];
          assert.ok(
            !rule.meta?.docs?.category ||
              ALLOWED_CATEGORIES.includes(rule.meta.docs.category),
            'has an allowed category',
          );
        });

        it('should have the right contents', () => {
          const filePath = path.join(
            dirname,
            '..',
            '..',
            'lib',
            'rules',
            `${ruleName}.ts`,
          );
          const file = readFileSync(filePath, 'utf8');

          assert.ok(
            file.includes('const rule: Rule.RuleModule'),
            'is defined as type RuleModule',
          );
        });
      });
    }
  });

  it('should have tests for all rules', () => {
    const filePath = path.join(dirname, 'rules');
    const files = readdirSync(filePath);

    assert.deepStrictEqual(
      RULE_NAMES,
      files
        .filter((file) => !file.startsWith('.'))
        .map((file) => file.replace('.ts', '')),
    );
  });

  it('should have documentation for all rules', () => {
    const filePath = path.join(dirname, '..', '..', 'docs', 'rules');
    const files = readdirSync(filePath);

    assert.deepStrictEqual(
      RULE_NAMES,
      files
        .filter((file) => !file.startsWith('.'))
        .map((file) => file.replace('.md', '')),
    );
  });
});
