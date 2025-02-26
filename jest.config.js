module.exports = {
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
    '!lambda/**/*.d.ts'
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
};
