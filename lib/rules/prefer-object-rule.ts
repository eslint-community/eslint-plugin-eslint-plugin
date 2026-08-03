/**
 * @author Brad Zacher <https://github.com/bradzacher>
 */
import type { Rule, SourceCode } from 'eslint';
import type { Expression, Node, Program } from 'estree';

import { getRuleInfo } from '../utils.ts';

const META_PROPERTIES_TO_PORT = new Set(['schema', 'deprecated']);

type PortableMetaAssignment = {
  key: string;
  valueNode: Expression;
  statement: Node;
};

function getPortableMetaAssignments(
  program: Program,
): PortableMetaAssignment[] {
  const results: PortableMetaAssignment[] = [];
  let hasExistingMetaAssignment = false;

  for (const statement of program.body) {
    if (statement.type !== 'ExpressionStatement') {
      continue;
    }
    const expression = statement.expression;
    if (
      expression.type !== 'AssignmentExpression' ||
      expression.operator !== '='
    ) {
      continue;
    }
    const leftExpression = expression.left;
    if (
      leftExpression.type !== 'MemberExpression' ||
      leftExpression.computed ||
      leftExpression.object.type !== 'MemberExpression' ||
      leftExpression.object.computed ||
      leftExpression.object.object.type !== 'Identifier' ||
      leftExpression.object.object.name !== 'module' ||
      leftExpression.object.property.type !== 'Identifier' ||
      leftExpression.object.property.name !== 'exports' ||
      leftExpression.property.type !== 'Identifier'
    ) {
      continue;
    }

    const key = leftExpression.property.name;
    if (key === 'meta') {
      hasExistingMetaAssignment = true;
    } else if (META_PROPERTIES_TO_PORT.has(key)) {
      results.push({ key, valueNode: expression.right, statement });
    }
  }

  return hasExistingMetaAssignment ? [] : results;
}

function buildMetaPrefix(
  assignments: PortableMetaAssignment[],
  sourceCode: SourceCode,
): string {
  if (assignments.length === 0) {
    return '';
  }
  const properties = assignments
    .map(
      (assignment) =>
        `${assignment.key}: ${sourceCode.getText(assignment.valueNode)}`,
    )
    .join(', ');
  return `meta: {${properties}}, `;
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow function-style rules',
      category: 'Rules',
      recommended: true,
      url: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/prefer-object-rule.md',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferObject: 'Rules should be declared using the object style.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const ruleInfo = getRuleInfo(sourceCode);
    if (!ruleInfo) {
      return {};
    }

    return {
      Program() {
        if (ruleInfo.isNewStyle) {
          return;
        }

        const metaAssignments = getPortableMetaAssignments(sourceCode.ast);
        const metaPrefix = buildMetaPrefix(metaAssignments, sourceCode);

        context.report({
          node: ruleInfo.create,
          messageId: 'preferObject',
          *fix(fixer) {
            // note - we intentionally don't worry about formatting here, as otherwise we have
            //        to indent the function correctly
            if (
              ruleInfo.create.type === 'FunctionExpression' ||
              ruleInfo.create.type === 'FunctionDeclaration'
            ) {
              const openParenToken = sourceCode.getFirstToken(
                ruleInfo.create,
                (token) => token.type === 'Punctuator' && token.value === '(',
              );

              /* istanbul ignore if */
              if (!openParenToken || !ruleInfo.create.range) {
                // this shouldn't happen, but guarding against crashes just in case
                return null;
              }

              yield fixer.replaceTextRange(
                [ruleInfo.create.range[0], openParenToken.range[0]],
                `{${metaPrefix}create`,
              );
              yield fixer.insertTextAfter(ruleInfo.create, '}');
            } else if (ruleInfo.create.type === 'ArrowFunctionExpression') {
              yield fixer.insertTextBefore(
                ruleInfo.create,
                `{${metaPrefix}create: `,
              );
              yield fixer.insertTextAfter(ruleInfo.create, '}');
            }

            for (const assignment of metaAssignments) {
              yield fixer.remove(assignment.statement);
            }
          },
        });
      },
    };
  },
};

export default rule;
