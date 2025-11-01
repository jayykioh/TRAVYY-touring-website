module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: [
    '**/test/unit/**/*.test.js',
    '**/test/integration/**/*.test.js',
    '**/test/api/**/*.test.js',
    '**/test/ui/**/*.test.js',
    '**/test/ai-prompt/**/*.test.js'
  ],
  collectCoverage: true,  // Enable coverage by default
  collectCoverageFrom: [
    'controller/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    'routes/**/*.js',
    'services/**/*.js',
    'middlewares/**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!test/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 40,
      lines: 45,
      statements: 45
    }
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/test/ui/',  // Skip UI tests if not implemented
    '<rootDir>/test/ai-prompt/'  // Skip AI prompt tests if not implemented
  ],
  verbose: true
};