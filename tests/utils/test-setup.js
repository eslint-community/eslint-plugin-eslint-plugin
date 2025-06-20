import { RuleTester } from 'eslint';
import * as vitest from 'vitest';

RuleTester.describe = vitest.describe;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
