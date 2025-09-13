module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: { 
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '^axios$': '<rootDir>/src/__mocks__/axios.js',
    '^socket\\.io-client$': '<rootDir>/src/__mocks__/socket.io-client.js',
    '^@tanstack/react-query$': '<rootDir>/src/__mocks__/@tanstack/react-query.js',
    '^../utils/pwaService$': '<rootDir>/src/__mocks__/pwaService.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/setupTests.ts'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { modules: 'auto' }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|@tanstack/react-query|socket.io-client)/)'
  ],
  extensionsToTreatAsEsm: [],
  globals: {
    'ts-jest': {
      useESM: false
    }
  }
};
