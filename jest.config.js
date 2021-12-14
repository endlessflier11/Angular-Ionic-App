const esModules = ['@ionic', 'br-mask', '@aaa-mobile/cordova-plugin-aaa-mobile'].join('|');
const snapshotSerializers = require('jest-preset-angular/build/serializers/index');
require('jest-preset-angular/ngcc-jest-processor');
process.env.TZ = 'UTC';
module.exports = {
  preset: 'jest-preset-angular',
  globals: {
    'ts-jest': {
      babelConfig: {
        // Commenting fixes error: Duplicate plugin/preset detected
        // plugins: ['@babel/plugin-syntax-dynamic-import'],
        // presets: [['@babel/preset-env', { targets: { node: true }, modules: 'commonjs' }]],
      },

      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
    },
  },
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  coverageReporters: ['text-summary', 'html'],
  collectCoverageFrom: [
    '<rootDir>/src/app/micro-apps/csaa-mobile/**/*.ts',
    '!<rootDir>/src/app/micro-apps/csaa-mobile/**/*.spec.ts',
  ],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@app/testing$': '<rootDir>/src/testing',
    '^@csaadigital/mobile-mypolicy': '<rootDir>/src/app/micro-apps/csaa-mobile/index',
  },
  snapshotSerializers,
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!${esModules})`],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/plugins/'],
};
