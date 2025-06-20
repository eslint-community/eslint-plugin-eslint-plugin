/**
 * @fileoverview Helpers for tests.
 * @author 唯然<weiran.zsd@outlook.com>
 */

import { RuleTester } from 'eslint';
import * as vitest from 'vitest';

RuleTester.describe = vitest.describe;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;

export { RuleTester } from 'eslint';
