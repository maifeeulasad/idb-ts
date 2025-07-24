export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['reflect-metadata', './jest.setup.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
