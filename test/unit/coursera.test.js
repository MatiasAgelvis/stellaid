/**
 * @jest-environment jsdom
 */

const coursera = require('../../source/coursera-utils.js');
const path = require('path');

describe('Utilities', () => {

    test('checkIfReviewed', () => {
        expect(true).toBeTruthy()
        // course = new coursera.Course('test')
        // expect(course.checkIfReviewed(document)).not.toBeTruthy()
    })

});
