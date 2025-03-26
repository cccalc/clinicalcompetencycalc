import { config } from 'dotenv';
config({ path: '.env.local' });

/** @type {import('jest').Config} */
const jestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest"
},

  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
};

export default jestConfig;
