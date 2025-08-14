module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^(?!.*\\.(js|jsx|css|json)$)': 'identity-obj-proxy'
  },
  
  // Module name mapper
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'cobertura'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/serviceWorker.js',
    '!src/setupTests.js',
    '!src/__tests__/**',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 10000,
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
    '/coverage/',
    '/src/__tests__/setup/',
    '/src/__tests__/fixtures/'
  ],
  
  // Snapshot serializa
  snapshotSerializers: ['rootDir>/node_modules/enzyme-to-json/serializer'],
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Global setup
  globalSetup: '<rootDir>/src/__tests__/setup/globalSetup.js',
  
  // Global teardown
  globalTeardown: '<rootDir>/src/__tests__/setup/globalTeardown.js',
  
  // Force coverage collection from ignored files
  forceCoverageMatch: ['**/*.{js,jsx}'],
  
  // Max workers
  maxWorkers: '50%',
  
  // Test name pattern
  testNamePattern: '^((?!skip).)*$',
  
  // Test regex
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|js)$',
  
  // Unmocked module regex (for node_modules)
  unmockedModulePathPatterns: [
    '<rootDir>/node_modules/react/',
    '<rootDir>/node_modules/react-dom/',
    '<rootDir>/node_modules/react-router-dom/'
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Test results processor
  testResultsProcessor: 'jest-junit',
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'clover',
    'cobertura'
  ]
};