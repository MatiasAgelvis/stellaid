const path = require('path');

module.exports = {
  name: 'e2e',
  displayName: 'E2E Tests',

  // A list of paths to directories that 
  // Jest should use to search for files in
  roots: ['.'],

  // globalSetup: path.join(__dirname, 'jest.setup.js'),

  preset: 'jest-puppeteer',
  
  collectCoverage: false
};