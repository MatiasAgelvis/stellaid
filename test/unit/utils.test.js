const utils = require('../../source/utils.js');
const path = require('path');
const { DOMParser, parseHTML } = require('linkedom');

beforeAll(() => {
    html = '<!DOCTYPE html><html><body><h1>FOO BAR</h1><p>pizza</p></body></html>'

    doc = (new DOMParser).parseFromString(html, 'text/html')
    doc.location = {
        host: "example.com",
        hostname: "example.com",
        href: "https://example.com/page",
        origin: "https://example.com",
        pathname: "/page",
        protocol: "https:"
    }

    global.document = doc

})


describe('Utilities', () => {

    test('regexCount: Count number of occurrences of a pattern', () => {
        expect(utils.regexCount('aa', 'a')).toEqual(2)
        expect(utils.regexCount('aa', 'aa')).toEqual(1)
        expect(utils.regexCount('abc', 'a')).toEqual(1)
        expect(utils.regexCount('abc', 'd')).toEqual(0)
    })

    test('makeID:  Write correct ID tags', () => {
        expect(utils.makeID('page', 'type', 'name')).toEqual('stellaid-page-type-name')
    })

    test('makeScoreNode: Create a <span> with an ID', () => {
        let page = 'page'
        let type = 'type'
        let name = 'name'
        let message = 'message'
        scoreNode = utils.makeScoreNode(page, type, name, message)
        expect(scoreNode).toMatch(/<span.*?>/)
        expect(scoreNode).toMatch(`id='${utils.makeID(page, type, name)}'`)
        expect(scoreNode).toMatch(message)
        expect(scoreNode).toMatch('</span>')
    })

    test('splitSelect: Split a string by a given delimiter and filter it', () => {
        let string = 'a/b/c/d'
        expect(utils.splitSelect(string, [0])).toEqual(['a'])
        expect(utils.splitSelect(string, [0, 1])).toEqual(['a', 'b'])
        expect(utils.splitSelect(string, 4)).toEqual([])
    })

    test('makeBagde: return a score and an <i> element', () => {
        score = 5.0
        expect(utils.makeBadge(score)).toMatch(/<i.*class="material-icons".*>verified<\/i>/)
        expect(utils.makeBadge(score)).toMatch('5.0')
        expect(utils.makeBadge(score)).toMatch(/(.*)/)
    })

    test('sleep: return a promise', () => {
        expect(utils.sleep(100)).resolves.toBeUndefined()
    })

    test('fetchFile: fetches the current document HTML', async () => {
        expect(await utils.fetchPage('example.com/page')).toMatchObject(doc)

        doc = await utils.fetchPage('example.com')
        expect(doc.querySelector('h1').innerText).toMatch('Example Domain')




    })
});