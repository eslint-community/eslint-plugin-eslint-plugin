/**
 * @fileoverview Helpers for tests.
 * @author 唯然<weiran.zsd@outlook.com>
 */

import { RuleTester as ESLintRuleTester } from 'eslint';
import * as unsupportedApi from 'eslint/use-at-your-own-risk';
import packageConfig from 'eslint/package.json' with { type: 'json' };

const { version: eslintVersion } = packageConfig;

const FlatRuleTester = unsupportedApi.FlatRuleTester;

// greater than or equal to ESLint v9
export const gteEslintV9 = +eslintVersion.split('.')[0] >= 9;

export const RuleTester = gteEslintV9 ? ESLintRuleTester : FlatRuleTester;
