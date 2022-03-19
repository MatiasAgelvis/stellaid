/**
 * @jest-environment jsdom
 */

const utils = require('../../source/utils.js');
const path = require('path');
const { DOMParser, parseHTML } = require('linkedom');

// beforeAll(() => {
//   Object.defineProperty(global, 'document', {});
// })

describe('Utilities', () => {

	test.skip('fetchFile: fetches the current document HTML', async () => {
		// beforeEach(() => {})

		let doc
		doc = await utils.fetchPage('example.com')
		expect(doc.querySelector('body').innerText).toBeTruthy()


		html = '<!DOCTYPE html><html><body><h1>FOO BAR</h1><p>pizza</p></body></html>'
		doc = (new DOMParser).parseFromString(html)
		doc.location = {
			host: "www.example.com",
			hostname: "www.example.com",
			href: "https://www.example.com/page",
			origin: "https://www.example.com",
			pathname: "/page",
			protocol: "https:"
		}

		document = doc


		// expect(await utils.fetchPage('example.com/page')).toMatch(doc)



	})
});
