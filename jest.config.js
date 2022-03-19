module.exports = {
  projects: [{
      displayName: 'Unit',
      name: 'unit',
      testMatch: ['<rootDir>/test/unit/**/*.test.js'],
      roots: ['<rootDir>'],
      testEnvironment: "node",
      collectCoverage: true,
      setupFiles: ['./dom-mock.js']
    },
    {
      displayName: 'End to End',
      name: 'e2e',
      roots: ['<rootDir>'],
      preset: 'jest-puppeteer',
      collectCoverage: false,
      setupFiles: ['./jest-puppeteer.config.js'],
      testMatch: ['<rootDir>/test/e2e/**/*.test.js']
    }
  ]
};
