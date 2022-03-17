const utils = require('../../source/utils.js');
const path = require('path');

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
        expect(utils.splitSelect(string, [4])).toBeUndefined
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
});
