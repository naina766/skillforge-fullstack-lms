import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
  verbose: true,
};

export default config;
