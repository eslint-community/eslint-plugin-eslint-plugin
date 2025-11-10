/**
 * @fileoverview An ESLint plugin for linting ESLint plugins
 * @author Teddy Katz
 */
import { createRequire } from 'node:module';

import type { ESLint, Linter, Rule } from 'eslint';

import consistentOutput from './rules/consistent-output.ts';
import fixerReturn from './rules/fixer-return.ts';
import metaPropertyOrdering from './rules/meta-property-ordering.ts';
import noDeprecatedContextMethods from './rules/no-deprecated-context-methods.ts';
import noDeprecatedReportApi from './rules/no-deprecated-report-api.ts';
import noIdenticalTests from './rules/no-identical-tests.ts';
import noMatchingViolationSuggestMessageIds from './rules/no-matching-violation-suggest-message-ids.ts';
import noMetaReplacedBy from './rules/no-meta-replaced-by.ts';
import noMetaSchemaDefault from './rules/no-meta-schema-default.ts';
import noMissingMessageIds from './rules/no-missing-message-ids.ts';
import noMissingPlaceholders from './rules/no-missing-placeholders.ts';
import noOnlyTests from './rules/no-only-tests.ts';
import noPropertyInNode from './rules/no-property-in-node.ts';
import noUnusedMessageIds from './rules/no-unused-message-ids.ts';
import noUnusedPlaceholders from './rules/no-unused-placeholders.ts';
import noUselessTokenRange from './rules/no-useless-token-range.ts';
import preferMessageIds from './rules/prefer-message-ids.ts';
import preferObjectRule from './rules/prefer-object-rule.ts';
import preferOutputNull from './rules/prefer-output-null.ts';
import preferPlaceholders from './rules/prefer-placeholders.ts';
import preferReplaceText from './rules/prefer-replace-text.ts';
import reportMessageFormat from './rules/report-message-format.ts';
import requireMetaDefaultOptions from './rules/require-meta-default-options.ts';
import requireMetaDocsDescription from './rules/require-meta-docs-description.ts';
import requireMetaDocsRecommended from './rules/require-meta-docs-recommended.ts';
import requireMetaDocsUrl from './rules/require-meta-docs-url.ts';
import requireMetaFixable from './rules/require-meta-fixable.ts';
import requireMetaHasSuggestions from './rules/require-meta-has-suggestions.ts';
import requireMetaSchemaDescription from './rules/require-meta-schema-description.ts';
import requireMetaSchema from './rules/require-meta-schema.ts';
import requireMetaType from './rules/require-meta-type.ts';
import requireTestCaseName from './rules/require-test-case-name.ts';
import testCasePropertyOrdering from './rules/test-case-property-ordering.ts';
import testCaseShorthandStrings from './rules/test-case-shorthand-strings.ts';
import uniqueTestCaseNames from './rules/unique-test-case-names.ts';
const require = createRequire(import.meta.url);

const packageMetadata = require('../package.json') as {
  name: string;
  version: string;
};

const PLUGIN_NAME = packageMetadata.name.replace(/^eslint-plugin-/, '');

const configFilters: Record<string, (rule: Rule.RuleModule) => boolean> = {
  all: (rule: Rule.RuleModule) =>
    !(
      rule.meta?.docs &&
      'requiresTypeChecking' in rule.meta.docs &&
      rule.meta.docs.requiresTypeChecking
    ),
  'all-type-checked': () => true,
  recommended: (rule: Rule.RuleModule) => !!rule.meta?.docs?.recommended,
  rules: (rule: Rule.RuleModule) => rule.meta?.docs?.category === 'Rules',
  tests: (rule: Rule.RuleModule) => rule.meta?.docs?.category === 'Tests',
  'rules-recommended': (rule: Rule.RuleModule) =>
    configFilters.recommended(rule) && configFilters.rules(rule),
  'tests-recommended': (rule: Rule.RuleModule) =>
    configFilters.recommended(rule) && configFilters.tests(rule),
};

const createConfig = (configName: string): Linter.Config => ({
  name: `${PLUGIN_NAME}/${configName}`,
  plugins: {
    get [PLUGIN_NAME](): ESLint.Plugin {
      return plugin;
    },
  },
  rules: Object.fromEntries(
    (Object.keys(allRules) as (keyof typeof allRules)[])
      .filter((ruleName) => configFilters[configName](allRules[ruleName]))
      .map((ruleName) => [`${PLUGIN_NAME}/${ruleName}`, 'error']),
  ),
});

// ------------------------------------------------------------------------------
// Plugin Definition
// ------------------------------------------------------------------------------

// import all rules in lib/rules
const allRules = {
  'consistent-output': consistentOutput,
  'fixer-return': fixerReturn,
  'meta-property-ordering': metaPropertyOrdering,
  'no-deprecated-context-methods': noDeprecatedContextMethods,
  'no-deprecated-report-api': noDeprecatedReportApi,
  'no-identical-tests': noIdenticalTests,
  'no-matching-violation-suggest-message-ids':
    noMatchingViolationSuggestMessageIds,
  'no-meta-replaced-by': noMetaReplacedBy,
  'no-meta-schema-default': noMetaSchemaDefault,
  'no-missing-message-ids': noMissingMessageIds,
  'no-missing-placeholders': noMissingPlaceholders,
  'no-only-tests': noOnlyTests,
  'no-property-in-node': noPropertyInNode,
  'no-unused-message-ids': noUnusedMessageIds,
  'no-unused-placeholders': noUnusedPlaceholders,
  'no-useless-token-range': noUselessTokenRange,
  'prefer-message-ids': preferMessageIds,
  'prefer-object-rule': preferObjectRule,
  'prefer-output-null': preferOutputNull,
  'prefer-placeholders': preferPlaceholders,
  'prefer-replace-text': preferReplaceText,
  'report-message-format': reportMessageFormat,
  'require-meta-default-options': requireMetaDefaultOptions,
  'require-meta-docs-description': requireMetaDocsDescription,
  'require-meta-docs-recommended': requireMetaDocsRecommended,
  'require-meta-docs-url': requireMetaDocsUrl,
  'require-meta-fixable': requireMetaFixable,
  'require-meta-has-suggestions': requireMetaHasSuggestions,
  'require-meta-schema-description': requireMetaSchemaDescription,
  'require-meta-schema': requireMetaSchema,
  'require-meta-type': requireMetaType,
  'require-test-case-name': requireTestCaseName,
  'test-case-property-ordering': testCasePropertyOrdering,
  'test-case-shorthand-strings': testCaseShorthandStrings,
  'unique-test-case-names': uniqueTestCaseNames,
} satisfies Record<string, Rule.RuleModule>;

const plugin = {
  meta: {
    name: packageMetadata.name,
    version: packageMetadata.version,
  },
  rules: allRules,
  configs: {
    all: createConfig('all'),
    'all-type-checked': createConfig('all-type-checked'),
    recommended: createConfig('recommended'),
    rules: createConfig('rules'),
    tests: createConfig('tests'),
    'rules-recommended': createConfig('rules-recommended'),
    'tests-recommended': createConfig('tests-recommended'),
  },
} satisfies ESLint.Plugin;

export default plugin;
