const path = require('path');


// Path to the actual extension we want to be testing
const pathToExtension = path.join(__dirname, 'distribution')

// Tell puppeteer we want to load the web extension
const puppeteerArgs = [
  `--disable-extensions-except=${pathToExtension}`,
  `--load-extension=${pathToExtension}`,
  '--show-component-extension-options',
]

module.exports = {
  launch: {
    headless: true,
    args: puppeteerArgs
  }
}