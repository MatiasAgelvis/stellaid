module.exports = {
  name: 'unit',
  displayName: 'Unit Tests',

  // A list of paths to directories that 
  // Jest should use to search for files in
  roots: ['.'],
  testEnvironment: "node",
  collectCoverage: true,
  setupFiles: ['./dom.mock.js']
};
