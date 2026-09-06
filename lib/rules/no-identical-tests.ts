/**
 * @fileoverview disallow identical tests
 * @author 薛定谔的猫<hh_2013@foxmail.com>
 */
import type { Rule } from 'eslint';
import type { Expression, SpreadElement } from 'estree';

import { getTestInfo } from '../utils.ts';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow identical tests',
      category: 'Tests',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-identical-tests.md',
    },
    fixable: 'code',
    schema: [],
    messages: {
      identical: 'This test case is identical to another case.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;

    /**
     * Create a unique cache key
     */
    function toKey(test: Expression | SpreadElement): string {
      if (test.type !== 'ObjectExpression') {
        return JSON.stringify([test.type, sourceCode.getText(test)]);
      }
      return JSON.stringify([
        test.type,
        ...test.properties.map((p) => sourceCode.getText(p)).toSorted(),
      ]);
    }

    return {
      Program(ast) {
        getTestInfo(context, ast).forEach((testRun) => {
          [testRun.valid, testRun.invalid].forEach((tests) => {
            const cache = new Set();
            tests
              .filter((test) => !!test)
              .forEach((test) => {
                const key = toKey(test);
                if (cache.has(key)) {
                  context.report({
                    node: test,
                    messageId: 'identical',
                    fix(fixer) {
                      const start = sourceCode.getTokenBefore(test)!;
                      const end = sourceCode.getTokenAfter(test)!;
                      return fixer.removeRange(
                        // should remove test's trailing comma
                        [
                          start.range[1],
                          end.value === ',' ? end.range[1] : test.range![1],
                        ],
                      );
                    },
                  });
                } else {
                  cache.add(key);
                }
              });
          });
        });
      },
    };
  },
};

export default rule;
