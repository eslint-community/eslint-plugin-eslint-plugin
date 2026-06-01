import type { Rule } from 'eslint';
import type { ObjectExpression } from 'estree';

import { getKeyName, getTestInfo, getTestInfoProperty } from '../utils.ts';

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
        const key = getKeyName(property);

        if (key === null) {
          return;
        }

        if (locationProperties.has(key)) {
          existingLocationProperties.add(key);
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
              const errorsProperty = getTestInfoProperty(test, 'errors');

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
                  (element) =>
                    !!element &&
                    (element.type === 'ObjectExpression' ||
                      element.type === 'Literal'),
                )
                .forEach((element) => {
                  if (element.type === 'Literal') {
                    context.report({
                      node: element,
                      messageId: 'locationsMissing',
                    });
                    return;
                  }

                  verifyErrorLocations(element);
                });
            });
        });
      },
    };
  },
};

export default rule;
