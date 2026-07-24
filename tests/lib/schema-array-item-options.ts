import { Linter, type Rule } from 'eslint';
import { describe, it, expect } from 'vitest';
import metaPropertyOrdering from '../../lib/rules/meta-property-ordering.ts';
import testCasePropertyOrdering from '../../lib/rules/test-case-property-ordering.ts';

const linter = new Linter();

function invalidOptionConfig(
  ruleName: string,
  rule: Rule.RuleModule,
  option: unknown,
): Linter.Config {
  return {
    plugins: { test: { rules: { [ruleName]: rule } } },
    rules: { [`test/${ruleName}`]: ['error', option] as Linter.RuleEntry },
  };
}

describe('array option schemas reject non-string items', () => {
  it('meta-property-ordering', () => {
    expect(() =>
      linter.verify(
        'foo;',
        invalidOptionConfig(
          'meta-property-ordering',
          metaPropertyOrdering,
          [1, 2, 3],
        ),
      ),
    ).toThrow(/should be string/i);
  });

  it('test-case-property-ordering', () => {
    expect(() =>
      linter.verify(
        'foo;',
        invalidOptionConfig(
          'test-case-property-ordering',
          testCasePropertyOrdering,
          [1, 2, 3],
        ),
      ),
    ).toThrow(/should be string/i);
  });
});
