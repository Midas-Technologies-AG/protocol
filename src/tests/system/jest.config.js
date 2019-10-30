module.exports = {
  rootDir: process.cwd(),
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '((\\giveth.|/)(systest))\\.(js|ts)$', //To test single files change here.
  moduleFileExtensions: ['ts', 'js', 'json', 'node', 'bin'],
  setupTestFrameworkScriptFile: `${__dirname}/jest.setup.js`,
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
      diagnostics: false,
    },
  },
};
