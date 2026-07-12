const sharedConfig = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup-env.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30000,
  transform: {
    '^.+\\.ts$': '@swc/jest',
  },
};

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      ...sharedConfig,
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
    },
    {
      ...sharedConfig,
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-integration.ts'],
      maxWorkers: 1,
    },
  ],
};
