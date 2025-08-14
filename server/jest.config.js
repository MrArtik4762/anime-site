module.exports = {
  // Корневая директория для поиска тестов
  rootDir: '.',

  // Директория, в которой Jest должен хранить свои файлы кэша
  cacheDirectory: './node_modules/.cache/jest',

  // Модули, которые необходимо имитировать
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^\\.(svg|png|jpg|jpeg|gif|eot|otf|ttf|woff|woff2)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Префикс для имен тестовых файлов
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],

  // Пропускать тестовые файлы в определенных директориях
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],

  // Модуль, который запускается до выполнения тестов
  setupFiles: ['./src/setupTests.js'],

  // Окружение для тестов
  testEnvironment: 'node',

  // Покрытие кода
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/setupTests.js',
    '!src/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'text-summary',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Таймауты
  testTimeout: 30000,

  // Вывод результатов тестов
  verbose: true,

  // Поддержка ES modules
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // Поддержка ES modules
  extensionsToTreatAsEsm: ['.js'],

  // Настройка для ES modules
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },

  // Отключение автоматического mocks для тестов
  automock: false,

  // Включение mocks для тестов
  testTimeout: 10000,
};