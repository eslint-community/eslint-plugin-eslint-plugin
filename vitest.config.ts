import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/lib/**/*.ts'],
    exclude: ['tests/lib/fixtures/**'],
    setupFiles: ['tests/utils/test-setup.ts'],
    clearMocks: true,
    coverage: {
      all: true,
      include: ['lib'],
      reporter: ['html', 'lcov', 'text'],
      provider: 'istanbul',
      thresholds: {
        statements: 95,
        branches: 93,
        functions: 95,
        lines: 95,
      },
    },
  },
});
