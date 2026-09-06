/**
 * @author Brad Zacher <https://github.com/bradzacher>
 */
import type { Rule, SourceCode } from 'eslint';
import type { AssignmentExpression, Expression, Node, Program } from 'estree';

import { getRuleInfo } from '../utils.ts';

const META_PROPERTIES_TO_PORT = new Set(['schema', 'deprecated']);

type MetaAssignment = {
  key: string;
  statement: Node;
  memberObject: Node;
  valueNode: Expression;
};

type MetaFix = {
  inline: MetaAssignment[];
  remove: Node[];
  rewrite: MetaAssignment[];
};

// Only static values are safe to inline into `meta`. Non-static ones are rewritten in place.
function isStaticExpression(node: Node): boolean {
  switch (node.type) {
    case 'Literal': {
      return true;
    }
    case 'UnaryExpression': {
      return (
        (node.operator === '-' || node.operator === '+') &&
        isStaticExpression(node.argument)
      );
    }
    case 'ArrayExpression': {
      return node.elements.every(
        (element) => element !== null && isStaticExpression(element),
      );
    }
    case 'ObjectExpression': {
      return node.properties.every(
        (property) =>
          property.type === 'Property' &&
          !property.computed &&
          isStaticExpression(property.value),
      );
    }
    default: {
      return false;
    }
  }
}

function getModuleExportsAssignment(
  statement: Node,
): AssignmentExpression | undefined {
  if (statement.type !== 'ExpressionStatement') {
    return undefined;
  }
  const expression = statement.expression;
  if (
    expression.type !== 'AssignmentExpression' ||
    expression.operator !== '='
  ) {
    return undefined;
  }
  const left = expression.left;
  if (
    left.type === 'MemberExpression' &&
    !left.computed &&
    left.object.type === 'Identifier' &&
    left.object.name === 'module' &&
    left.property.type === 'Identifier' &&
    left.property.name === 'exports'
  ) {
    return expression;
  }
  return undefined;
}

function collectMetaAssignments(program: Program, createNode: Node): MetaFix {
  const empty: MetaFix = { inline: [], remove: [], rewrite: [] };

  const exportIndex = program.body.findIndex((statement) => {
    const assignment = getModuleExportsAssignment(statement);
    return assignment !== undefined && assignment.right === createNode;
  });
  if (exportIndex === -1) {
    return empty;
  }

  const collectedByKey = new Map<string, MetaAssignment[]>();
  let hasExistingMetaAssignment = false;

  for (let index = exportIndex + 1; index < program.body.length; index++) {
    const statement = program.body[index];
    // Stop at the next `module.exports =`. `getRuleInfo` resolves the last one,
    // so this should not be reachable, but it keeps the scan bounded if that changes.
    /* istanbul ignore if */
    if (getModuleExportsAssignment(statement)) {
      break;
    }
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
    const left = expression.left;
    if (
      left.type !== 'MemberExpression' ||
      left.computed ||
      left.object.type !== 'MemberExpression' ||
      left.object.computed ||
      left.object.object.type !== 'Identifier' ||
      left.object.object.name !== 'module' ||
      left.object.property.type !== 'Identifier' ||
      left.object.property.name !== 'exports' ||
      left.property.type !== 'Identifier'
    ) {
      continue;
    }

    const key = left.property.name;
    if (key === 'meta') {
      hasExistingMetaAssignment = true;
    } else if (META_PROPERTIES_TO_PORT.has(key)) {
      const entry: MetaAssignment = {
        key,
        statement,
        memberObject: left.object,
        valueNode: expression.right,
      };
      const existing = collectedByKey.get(key);
      if (existing) {
        existing.push(entry);
      } else {
        collectedByKey.set(key, [entry]);
      }
    }
  }

  if (hasExistingMetaAssignment) {
    return empty;
  }

  const fix: MetaFix = { inline: [], remove: [], rewrite: [] };
  for (const entries of collectedByKey.values()) {
    if (entries.every((entry) => isStaticExpression(entry.valueNode))) {
      fix.inline.push(entries.at(-1)!);
      for (const entry of entries) {
        fix.remove.push(entry.statement);
      }
    } else {
      fix.rewrite.push(...entries);
    }
  }
  return fix;
}

function buildMetaPrefix(fix: MetaFix, sourceCode: SourceCode): string {
  if (fix.inline.length > 0) {
    const text = fix.inline
      .map(
        (assignment) =>
          `${assignment.key}: ${sourceCode.getText(assignment.valueNode)}`,
      )
      .join(', ');
    return `meta: {${text}}, `;
  }
  if (fix.rewrite.length > 0) {
    return 'meta: {}, ';
  }
  return '';
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow function-style rules',
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

        const metaFix = collectMetaAssignments(sourceCode.ast, ruleInfo.create);
        const metaPrefix = buildMetaPrefix(metaFix, sourceCode);

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

            for (const statement of metaFix.remove) {
              yield fixer.remove(statement);
            }
            for (const assignment of metaFix.rewrite) {
              yield fixer.insertTextAfter(assignment.memberObject, '.meta');
            }
          },
        });
      },
    };
  },
};

export default rule;
