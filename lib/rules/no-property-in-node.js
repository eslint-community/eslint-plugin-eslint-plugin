'use strict';

const { ESLintUtils } = require('@typescript-eslint/utils');
const tsutils = require('ts-api-utils');

const typedNodeSourceFileTesters = [
  /@types[/\\]estree[/\\]index\.d\.ts/,
  /@typescript-eslint[/\\]types[/\\]dist[/\\]generated[/\\]ast-spec\.d\.ts/,
];

/**
 * @param {import('typescript').Type} type
 * @returns Whether the type seems to include a known ESTree or TSESTree AST node.
 */
function isAstNodeType(type) {
  return tsutils
    .typeParts(type)
    .filter((type) => type.getProperty('type'))
    .flatMap((typePart) => typePart.symbol?.declarations ?? [])
    .some((declaration) => {
      const fileName = declaration.getSourceFile().fileName;
      return (
        fileName &&
        typedNodeSourceFileTesters.some((tester) => tester.test(fileName))
      );
    });
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'disallow using `in` to narrow node types instead of looking at properties',
      category: 'Rules',
      recommended: true,
      requiresTypeChecking: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-property-in-node.md',
    },
    schema: [],
    messages: {
      in: 'Prefer checking specific node properties instead of a broad `in`.',
    },
  },

  create(context) {
    return {
      'BinaryExpression[operator=in]'(node) {
        const services = ESLintUtils.getParserServices(context);
        const type = services.getTypeAtLocation(node.right);

        if (isAstNodeType(type)) {
          context.report({ messageId: 'in', node });
        }
      },
    };
  },
};
