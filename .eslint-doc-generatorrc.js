'use strict';

/** @type {import('eslint-doc-generator').GenerateOptions} */
module.exports = {
  configEmoji: [['recommended-type-checked', '☑️']],
  ignoreConfig: [
    'all',
    'rules',
    'rules-recommended',
    'tests',
    'tests-recommended',
  ],
  ruleDocSectionInclude: ['Rule Details'],
  ruleListSplit: 'meta.docs.category',
  urlConfigs:
    'https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets',
};
