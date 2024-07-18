module.exports = {
  transform: { '^.+\\.ts?$': 'ts-jest' },
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.multy.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
