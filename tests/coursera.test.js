// const sum = require('../source/coursera.js');
const fs = require('fs').promises
// const coursera = a

// test('Template', async () => {  })

// function readFile()
async function loadFile(file) {
    return await fs.readFile(file, 'utf8');
}

test('Load HTML to document', async () => {
    file = 'tests/pages/coursera/course.html'
    document.body.innerHTML = await loadFile(file)
    // console.log(document.body.innerHTML)
    expect(document.body.innerHTML).toBeTruthy()
})

test('Value a course on the its review page', async () => {
    file = 'tests/pages/coursera/review.html'
    document.body.innerHTML = await loadFile(file)


})