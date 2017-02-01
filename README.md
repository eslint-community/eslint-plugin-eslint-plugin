# eslint-plugin-eslint-plugin

An ESLint plugin for linting ESLint plugins

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-eslint-plugin`:

```
$ npm install eslint-plugin-eslint-plugin --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-eslint-plugin` globally.

## Usage

Add `eslint-plugin` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "eslint-plugin"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "eslint-plugin/no-deprecated-report-api": "error"
    }
}
```

Additionally, you can enable all recommended rules from this plugin:

```json
{
    "extends": [
        "plugin:eslint-plugin/recommended"
    ]
}
```

## Supported Rules

✔️ indicates that a rule is recommended.
🛠 indicates that a rule is fixable.

Name | ✔️ | 🛠 | Description
----- | ----- | ----- | -----
[no-deprecated-report-api](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/no-deprecated-report-api.md) | ✔️ | 🛠 | Prohibits the deprecated `context.report(node, message)` API
[report-message-format](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/report-message-format.md) | | | Enforces a consistent format for report messages
[require-meta-fixable](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/require-meta-fixable.md) | ✔️ | | Requires a `meta.fixable` property for fixable rules
[no-missing-placeholders](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/no-missing-placeholders.md) | ✔️ | | Disallows missing placeholders in rule report messages
[test-case-shorthand-strings](https://github.com/not-an-aardvark/eslint-plugin-eslint-plugin/blob/master/docs/rules/test-case-shorthand-strings.md) | | | Enforces consistent usage of shorthand strings for test cases with no options
