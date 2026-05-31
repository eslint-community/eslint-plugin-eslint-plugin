import type { Rule } from 'eslint';
import type { ObjectExpression, Property } from 'estree';

import { getTestInfo } from '../utils.ts';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'requires the position of errors to be explicitly stated for all expected errors',
      category: 'Tests',
      recommended: false,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-error-positions.md',
    },
    fixable: undefined,
    schema: [],
    messages: {
      locationsMissing:
        'The full location of the error must be specified using the properties `column`, `endColumn`, `endLine`, and `line`',
    },
  },

  create(context) {
    const locationProperties = new Set([
      'column',
      'endColumn',
      'endLine',
      'line',
    ]);

    function verifyErrorLocations(error: ObjectExpression) {
      const existingLocationProperties = new Set<string>();
      const properties = error.properties.filter(
        (property) => property.type === 'Property',
      );

      properties.forEach((property) => {
        if (property.key.type !== 'Identifier') {
          return;
        }

        if (locationProperties.has(property.key.name)) {
          existingLocationProperties.add(property.key.name);
        }
      });

      if (existingLocationProperties.size !== 4) {
        context.report({
          node: error,
          messageId: 'locationsMissing',
        });
      }
    }

    return {
      Program(ast) {
        getTestInfo(context, ast).forEach((testRun) => {
          testRun.invalid
            .filter((test) => !!test)
            .forEach((test) => {
              /**
               * Get a test case's given key name node.
               * @param key the keyname to find.
               * @returns found node; if not found, return null;
               */
              function getTestInfoProperty(key: string): Property | null {
                if (test.type === 'ObjectExpression') {
                  return (
                    test.properties
                      .filter((item) => item.type === 'Property')
                      .find(
                        (item) =>
                          item.key.type === 'Identifier' &&
                          item.key.name === key,
                      ) ?? null
                  );
                }
                return null;
              }

              const errorsProperty = getTestInfoProperty('errors');

              if (errorsProperty === null) {
                return;
              }

              const errors = errorsProperty.value;

              // Only verify the errors that are ArrayExpression
              if (errors.type !== 'ArrayExpression') {
                return;
              }

              errors.elements
                .filter(
                  (element) => !!element && element.type === 'ObjectExpression',
                )
                .forEach((element) => {
                  verifyErrorLocations(element);
                });
            });
        });
      },
    };
  },
};

export default rule;
