export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/__tests__/.*\\.compile\\.ts$', '<rootDir>/__tests__/.*\\performance\\.ts$'],
  setupFiles: ['reflect-metadata', './jest.setup.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
