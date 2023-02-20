const reporters = [
  'default',
  [
    './node_modules/jest-html-reporter',
    {
      pageTitle: 'Test Report',
      outputPath: './reports/jest/index.html',
      includeFailureMsg: true,
    },
  ],
];

if (process.env.CI === 'true') {
  reporters.push('summary');
  reporters.push(['github-actions', { silent: false }]);
} else {
  reporters.push('default');
}

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['out'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['src/extension.ts'],
  coverageReporters: ['clover', 'json', 'lcov', ['text', { skipFull: true }]],
  coverageDirectory: './reports/coverage',
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  reporters: reporters,
};

module.exports = config;
