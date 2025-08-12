/* eslint-disable no-console -- node script */
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

/**
 * Run All Tests: This script executes the lint command on all subfolders under `fixtures`, in order
 * to validate the correctness of our plugin.  Each fixture installs the *built* package.  So this should
 * only be run after a build has been done.
 *
 * For each directory under fixtures, the script runs `npm install` and `npm run lint`.
 */

const TEST_COMMAND = 'npm run lint';

const getRoot = () => {
  return execSync('git rev-parse --show-toplevel', {
    encoding: 'utf8',
  }).trim();
};

const executeAllE2eTests = async () => {
  const e2eDir = path.resolve(getRoot(), './e2e');
  const fixturesDir = path.resolve(e2eDir, './fixtures');
  const failedTests = [];

  // First install all dependencies in the fixtures workspace
  // Run install and the test command
  execSync('npm install', {
    cwd: e2eDir,
    stdio: ['ignore', 'ignore', 'pipe'],
  });

  // Get all directories in the e2e dir
  const allFixtureFiles = await fs.readdir(fixturesDir, { withFileTypes: true });
  const testDirs = allFixtureFiles
    .filter((dirEnt) => dirEnt.isDirectory())
    .map((dirEnt) => path.join(dirEnt.parentPath, dirEnt.name));

  if (testDirs.length > 0) {
    console.log(`Running ${testDirs.length} end to end tests.`)
    console.log(`\n${'-'.repeat(50)}\n`);
  } else {
    console.log('No end-to-end tests found...');
  }

  for (const testDir of testDirs) {
    const dirName = path.basename(testDir);
    console.log(`🧪 Executing test: ${dirName}`);

    try {
      execSync(TEST_COMMAND, {
        cwd: testDir,
        stdio: 'inherit',
      });
      console.log(`✅ Test passed`);
    } catch {
      console.log(`❌ Test failed`);
      failedTests.push(dirName);
    }
    console.log(`\n${'-'.repeat(50)}\n`);
  }

  if (failedTests.length > 0) {
    console.log(
      `Testing complete. ${failedTests.length} of ${testDirs.length} tests failed!`,
    );
    process.exitCode = 1;
  } else {
    console.log(`Testing complete.  All ${testDirs.length} tests passed!`);
  }
};
/* eslint-enable no-console -- node script */

executeAllE2eTests();
