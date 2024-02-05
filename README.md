# eslint-plugin-eslint-plugin ![CI](https://github.com/eslint-community/eslint-plugin-eslint-plugin/workflows/CI/badge.svg) [![NPM version](https://img.shields.io/npm/v/eslint-plugin-eslint-plugin.svg?style=flat)](https://npmjs.org/package/eslint-plugin-eslint-plugin) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

An ESLint plugin for linting ESLint plugins. Rules written in CJS, ESM, and TypeScript are all supported.

<!-- vscode-markdown-toc -->

* [Installation](#Installation)
* [Usage](#Usage)
* [Rules](#Rules)
* [Presets](#Presets)
  * [Semantic versioning policy](#Semanticversioningpolicy)
  * [Preset usage](#Presetusage)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='Installation'></a>Installation

You'll first need to install [ESLint](https://eslint.org):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-eslint-plugin`:

```sh
npm install eslint-plugin-eslint-plugin --save-dev
```

## <a name='Usage'></a>Usage

Here's an example ESLint configuration that:

* Sets `sourceType` to `script` for CJS plugins (most users) (use `module` for ESM/TypeScript)
* Enables the `recommended` configuration
* Enables an optional/non-recommended rule

### <a name='eslintrc'></a>**[.eslintrc.json](https://eslint.org/docs/latest/use/configure/configuration-files)**

```json
{
    "parserOptions": {
        "sourceType": "script"
    },
    "extends": [
        "plugin:eslint-plugin/recommended"
    ],
    "rules": {
        "eslint-plugin/require-meta-docs-description": "error"
    }
}
```

### <a name='flat'></a>[`eslint.config.js`](https://eslint.org/docs/latest/use/configure/configuration-files-new) (requires eslint>=v8.23.0)

```js
const eslintPluginRecommended = require("eslint-plugin-eslint-plugin/configs/recommended");
module.exports = [
    eslintPluginRecommended,
    {
        languageOptions: {sourceType: "commonjs"},
        rules: {
            "eslint-plugin/require-meta-docs-description": "error",
        },
    },
];
```

### <a name='Type Checked Rules'></a>Type Checked Rules

Rules marked with _💭 Requires type information_ require enabling [linting with type information](https://typescript-eslint.io/linting/typed-linting).
These rules are omitted from the `recommended` config, and instead are enabled in the `recommended-type-checked` superset config.

If your plugin is authored in TypeScript, we recommend replacing `recommended` with `recommended-type-checked` and enabling typed linting:

```js
module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
    },
    extends: ['plugin:eslint-plugin/recommended-type-checked'],
};
```

## <a name='Rules'></a>Rules

<!-- begin auto-generated rules list -->

💼 [Configurations](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets) enabled in.\
✅ Set in the `recommended` [configuration](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).\
☑️ Set in the `recommended-type-checked` [configuration](https://github.com/eslint-community/eslint-plugin-eslint-plugin#presets).\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).\
💭 Requires type information.

### Rules

| Name                                                                         | Description                                                                                | 💼   | 🔧 | 💡 | 💭 |
| :--------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- | :--- | :- | :- | :- |
| [fixer-return](docs/rules/fixer-return.md)                                   | require fixer functions to return a fix                                                    | ✅ ☑️ |    |    |    |
| [meta-property-ordering](docs/rules/meta-property-ordering.md)               | enforce the order of meta properties                                                       |      | 🔧 |    |    |
| [no-deprecated-context-methods](docs/rules/no-deprecated-context-methods.md) | disallow usage of deprecated methods on rule context objects                               | ✅ ☑️ | 🔧 |    |    |
| [no-deprecated-report-api](docs/rules/no-deprecated-report-api.md)           | disallow the version of `context.report()` with multiple arguments                         | ✅ ☑️ | 🔧 |    |    |
| [no-missing-message-ids](docs/rules/no-missing-message-ids.md)               | disallow `messageId`s that are missing from `meta.messages`                                | ✅ ☑️ |    |    |    |
| [no-missing-placeholders](docs/rules/no-missing-placeholders.md)             | disallow missing placeholders in rule report messages                                      | ✅ ☑️ |    |    |    |
| [no-property-in-node](docs/rules/no-property-in-node.md)                     | disallow using `in` to narrow node types instead of looking at properties                  | ☑️   |    |    | 💭 |
| [no-unused-message-ids](docs/rules/no-unused-message-ids.md)                 | disallow unused `messageId`s in `meta.messages`                                            | ✅ ☑️ |    |    |    |
| [no-unused-placeholders](docs/rules/no-unused-placeholders.md)               | disallow unused placeholders in rule report messages                                       | ✅ ☑️ |    |    |    |
| [no-useless-token-range](docs/rules/no-useless-token-range.md)               | disallow unnecessary calls to `sourceCode.getFirstToken()` and `sourceCode.getLastToken()` | ✅ ☑️ | 🔧 |    |    |
| [prefer-message-ids](docs/rules/prefer-message-ids.md)                       | require using `messageId` instead of `message` or `desc` to report rule violations         | ✅ ☑️ |    |    |    |
| [prefer-object-rule](docs/rules/prefer-object-rule.md)                       | disallow function-style rules                                                              | ✅ ☑️ | 🔧 |    |    |
| [prefer-placeholders](docs/rules/prefer-placeholders.md)                     | require using placeholders for dynamic report messages                                     |      |    |    |    |
| [prefer-replace-text](docs/rules/prefer-replace-text.md)                     | require using `replaceText()` instead of `replaceTextRange()`                              |      |    |    |    |
| [report-message-format](docs/rules/report-message-format.md)                 | enforce a consistent format for rule report messages                                       |      |    |    |    |
| [require-meta-docs-description](docs/rules/require-meta-docs-description.md) | require rules to implement a `meta.docs.description` property with the correct format      |      |    |    |    |
| [require-meta-docs-url](docs/rules/require-meta-docs-url.md)                 | require rules to implement a `meta.docs.url` property                                      |      | 🔧 |    |    |
| [require-meta-fixable](docs/rules/require-meta-fixable.md)                   | require rules to implement a `meta.fixable` property                                       | ✅ ☑️ |    |    |    |
| [require-meta-has-suggestions](docs/rules/require-meta-has-suggestions.md)   | require suggestable rules to implement a `meta.hasSuggestions` property                    | ✅ ☑️ | 🔧 |    |    |
| [require-meta-schema](docs/rules/require-meta-schema.md)                     | require rules to implement a `meta.schema` property                                        | ✅ ☑️ |    | 💡 |    |
| [require-meta-type](docs/rules/require-meta-type.md)                         | require rules to implement a `meta.type` property                                          | ✅ ☑️ |    |    |    |

### Tests

| Name                                                                     | Description                                                                  | 💼   | 🔧 | 💡 | 💭 |
| :----------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :--- | :- | :- | :- |
| [consistent-output](docs/rules/consistent-output.md)                     | enforce consistent use of `output` assertions in rule tests                  | ✅ ☑️ |    |    |    |
| [no-identical-tests](docs/rules/no-identical-tests.md)                   | disallow identical tests                                                     | ✅ ☑️ | 🔧 |    |    |
| [no-only-tests](docs/rules/no-only-tests.md)                             | disallow the test case property `only`                                       | ✅ ☑️ |    | 💡 |    |
| [prefer-output-null](docs/rules/prefer-output-null.md)                   | disallow invalid RuleTester test cases where the `output` matches the `code` | ✅ ☑️ | 🔧 |    |    |
| [test-case-property-ordering](docs/rules/test-case-property-ordering.md) | require the properties of a test case to be placed in a consistent order     |      | 🔧 |    |    |
| [test-case-shorthand-strings](docs/rules/test-case-shorthand-strings.md) | enforce consistent usage of shorthand strings for test cases with no options |      | 🔧 |    |    |

<!-- end auto-generated rules list -->

## <a name='Presets'></a>Presets

|         | Name                                             | Description                                                                                                                                                            |
| :-- | :------------------------- | :--------------------------------------------------------------------------------------- |
| ✅    | `recommended`                            | enables all recommended rules in this plugin, excluding those requiring type information |
|         | `recommended-type-checked` | enables all recommended rules in this plugin, including those requiring type information |
|         | `rules-recommended`                | enables all recommended rules that are aimed at linting ESLint rule files                                |
|         | `tests-recommended`                | enables all recommended rules that are aimed at linting ESLint test files                                |
|         | `all`                                            | enables all rules in this plugin                                                                                                                 |
|         | `rules`                                        | enables all rules that are aimed at linting ESLint rule files                                                        |
|         | `tests`                                        | enables all rules that are aimed at linting ESLint test files                                                        |

### <a name='Semanticversioningpolicy'></a>Semantic versioning policy

The list of recommended rules will only change in a major release of this plugin. However, new non-recommended rules might be added in a minor release of this plugin. Therefore, using the `all`, `rules`, and `tests` presets is **not recommended for production use**, because the addition of new rules in a minor release could break your build.

### <a name='Presetusage'></a>Preset usage

Presets are enabled by adding a line to the `extends` list in your config file. For example, to enable the `recommended` preset, use:

```json
{
    "extends": ["plugin:eslint-plugin/recommended"]
}
```

Or to apply linting only to the appropriate rule or test files:

```json
{
    "overrides": [
        {
            "files": ["lib/rules/*.{js,ts}"],
            "extends": ["plugin:eslint-plugin/rules-recommended"]
        },
        {
            "files": ["tests/lib/rules/*.{js,ts}"],
            "extends": ["plugin:eslint-plugin/tests-recommended"]
        }
    ]
}
```
