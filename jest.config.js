module.exports = {
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },

  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@helpers/excel-export.helper$': '<rootDir>/src/__mocks__/excel-export.helper.ts',
    '^../../helpers/excel-export.helper$': '<rootDir>/src/__mocks__/excel-export.helper.ts', // старий варіант щоб теж зловити
  },
};
