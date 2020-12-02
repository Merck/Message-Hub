/*
 * EPCIS MESSAGING HUB - QUERY BFF

 */

// jest.config.js
const {defaults} = require('jest-config');

module.exports = {
    verbose: true,
    roots: ["<rootDir>/test","<rootDir>/src"],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    testMatch: ["**/?(*.)+(spec|test).+(ts|tsx|js)"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!<rootDir>/node_modules/",
        "!src/server.ts",
        "!src/interfaces/routing-controller.ts",
        "!src/controller/router-controller.ts"
    ],
    coverageThreshold: {
        global: {
            branches: 75,
            functions: 75,
            lines: 75,
            statements: 75
        }
    },
    coverageReporters: ['json', 'lcov']
}