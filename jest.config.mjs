export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/.*\\.compile\\.ts$',
    '<rootDir>/.*\\performance\\.ts$',
    '<rootDir>/examples/.*',
  ],
  setupFiles: ['reflect-metadata', './jest.setup.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
