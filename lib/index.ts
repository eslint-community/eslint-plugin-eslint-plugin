/**
 * @fileoverview An ESLint plugin for linting ESLint plugins
 * @author Teddy Katz
 */
import packageMetadata from '../package.json' with { type: 'json' };
import consistentOutput from './rules/consistent-output';
import fixerReturn from './rules/fixer-return';
import metaPropertyOrdering from './rules/meta-property-ordering';
import noDeprecatedContextMethods from './rules/no-deprecated-context-methods';
import noDeprecatedReportApi from './rules/no-deprecated-report-api';
import noIdenticalTests from './rules/no-identical-tests';
import noMetaReplacedBy from './rules/no-meta-replaced-by';
import noMetaSchemaDefault from './rules/no-meta-schema-default';
import noMissingMessageIds from './rules/no-missing-message-ids';
import noMissingPlaceholders from './rules/no-missing-placeholders';
import noOnlyTests from './rules/no-only-tests';
import noPropertyInNode from './rules/no-property-in-node';
import noUnusedMessageIds from './rules/no-unused-message-ids';
import noUnusedPlaceholders from './rules/no-unused-placeholders';
import noUselessTokenRange from './rules/no-useless-token-range';
import preferMessageIds from './rules/prefer-message-ids';
import preferObjectRule from './rules/prefer-object-rule';
import preferOutputNull from './rules/prefer-output-null';
import preferPlaceholders from './rules/prefer-placeholders';
import preferReplaceText from './rules/prefer-replace-text';
import reportMessageFormat from './rules/report-message-format';
import requireMetaDefaultOptions from './rules/require-meta-default-options';
import requireMetaDocsDescription from './rules/require-meta-docs-description';
import requireMetaDocsRecommended from './rules/require-meta-docs-recommended';
import requireMetaDocsUrl from './rules/require-meta-docs-url';
import requireMetaFixable from './rules/require-meta-fixable';
import requireMetaHasSuggestions from './rules/require-meta-has-suggestions';
import requireMetaSchemaDescription from './rules/require-meta-schema-description';
import requireMetaSchema from './rules/require-meta-schema';
import requireMetaType from './rules/require-meta-type';
import testCasePropertyOrdering from './rules/test-case-property-ordering';
import testCaseShorthandStrings from './rules/test-case-shorthand-strings';
import type { ESLint, Rule } from 'eslint';

const PLUGIN_NAME = packageMetadata.name.replace(/^eslint-plugin-/, '');
const CONFIG_NAMES = ['all', 'all-type-checked', 'recommended', 'rules', 'tests', 'rules-recommended', 'tests-recommended'] as const;
type ConfigName = (typeof CONFIG_NAMES)[number];

const configFilters: Record<ConfigName, (rule: Rule.RuleModule) => boolean> = {
  all: (rule: Rule.RuleModule) => !(rule.meta?.docs && 'requiresTypeChecking' in rule.meta.docs && rule.meta.docs.requiresTypeChecking),
  'all-type-checked': () => true,
  recommended: (rule: Rule.RuleModule) => !!rule.meta?.docs?.recommended,
  rules: (rule: Rule.RuleModule) => rule.meta?.docs?.category === 'Rules',
  tests: (rule: Rule.RuleModule) => rule.meta?.docs?.category === 'Tests',
  'rules-recommended': (rule: Rule.RuleModule) =>
    configFilters.recommended(rule) && configFilters.rules(rule),
  'tests-recommended': (rule: Rule.RuleModule) =>
    configFilters.recommended(rule) && configFilters.tests(rule),
};

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
  'test-case-property-ordering': testCasePropertyOrdering,
  'test-case-shorthand-strings': testCaseShorthandStrings,
} satisfies Record<string, Rule.RuleModule>;

const plugin = {
  meta: {
    name: packageMetadata.name,
    version: packageMetadata.version,
  },
  rules: allRules,
  configs: CONFIG_NAMES.reduce((configs, configName) => {
    return Object.assign(configs, {
      [configName]: {
        name: `${PLUGIN_NAME}/${configName}`,
        plugins: {
          get PLUGIN_NAME() {
            return plugin;
          }
        },
        rules: Object.fromEntries(
          (Object.keys(allRules) as (keyof typeof allRules)[])
            .filter((ruleName) => configFilters[configName](allRules[ruleName]))
            .map((ruleName) => [`${PLUGIN_NAME}/${ruleName}`, 'error']),
        ),
      },
    });
  }, {})
} satisfies ESLint.Plugin;


export default plugin;
