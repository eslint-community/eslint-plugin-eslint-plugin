import prettier from 'prettier';

/** @type {import('eslint-doc-generator').GenerateOptions} */
const config = {
  ignoreConfig: [
    'all',
    'all-type-checked',
    'rules',
    'rules-recommended',
    'tests',
    'tests-recommended',
  ],
  postprocess: async (content, path) =>
    prettier.format(content, {
      ...(await prettier.resolveConfig(path)),
      parser: 'markdown',
    }),
  ruleDocSectionInclude: ['Rule Details'],
  ruleListSplit: 'meta.docs.category',
  urlConfigs:
    'https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets',
};

export default config;
