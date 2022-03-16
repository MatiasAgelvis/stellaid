const utils = require('../../source/utils.js');
// const puppeteer = require('puppeteer');
// const fs = require('fs').promises;
const path = require('path');
jest.setTimeout(60000)

describe('Utilities', () => {
    beforeAll(async () => {
        // await page.goto(`file:${path.join(__dirname, 'pages/coursera/course.html')}`)
        const headlessUserAgent = await page.evaluate(() => navigator.userAgent)
        const chromeUserAgent = headlessUserAgent.replace('HeadlessChrome', 'Chrome')
        await page.setUserAgent(chromeUserAgent)
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8' })

        await page.goto('http://coursera.org/learn/sustainable-finance')
    })

    test('addIcons: Load Google\'s Material Icons', async () => {

        const styleSheets = await page.evaluate(() => Array.from(document.styleSheets).map(x => x.href))

        let matIcons = Array.from(styleSheets).filter(
            x => x == "https://fonts.googleapis.com/icon?family=Material+Icons")

        expect(matIcons).not.toBeUndefined()
    })
});
