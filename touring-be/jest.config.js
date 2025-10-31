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
  collectCoverageFrom: [
    'controller/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    'routes/**/*.js',
    '!node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/test/ui/',  // Skip UI tests if not implemented
    '<rootDir>/test/ai-prompt/'  // Skip AI prompt tests if not implemented
  ]
};