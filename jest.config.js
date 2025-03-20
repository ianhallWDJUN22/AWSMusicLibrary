module.exports = {
  setupFiles: ["./jest.setup.js"],
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/test/**/*.[jt]s?(x)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'lambda/**/*.ts',       
    '!lambda/**/*.d.ts'  // Ensure .d.ts files are ignored from coverage
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  
  // Add this to ignore .d.ts files in test execution
  testPathIgnorePatterns: ['\\.d\\.ts$']
};

