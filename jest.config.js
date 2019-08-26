module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  setupFilesAfterEnv: [
    'jest-mock-console/dist/setupTestFramework.js',
    './jestSetup.js'
  ]
};
