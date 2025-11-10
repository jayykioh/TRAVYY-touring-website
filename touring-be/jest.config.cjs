module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // Only run tests placed under __tests__ folders to avoid executing project scripts like `test.js`
  testMatch: ['**/__tests__/**/*.js?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/test.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Leave node_modules untransformed (default). If you need to transform specific packages, add transformIgnorePatterns.
  verbose: true,
};
