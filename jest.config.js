module.exports = {
  testEnvironment: 'jsdom',
  
  // Handle ES modules and path mapping
  moduleNameMapper: { 
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '^axios$': '<rootDir>/src/__mocks__/axios.js',
    '^socket\\.io-client$': '<rootDir>/src/__mocks__/socket.io-client.js',
    '^@tanstack/react-query$': '<rootDir>/src/__mocks__/@tanstack/react-query.js',
    '^../utils/pwaService$': '<rootDir>/src/__mocks__/pwaService.js',
    // Add path mappings from tsconfig for tests
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/setupTests.ts',
    '!src/reportWebVitals.ts'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Clear mocks automatically between tests
  clearMocks: true,
  
  // Reset modules between tests for better isolation
  resetMods: false,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Timeout for tests
  testTimeout: 10000,
};
