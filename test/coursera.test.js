// const fs = require('fs').promises
// var utils = require('../source/utils.js')
// var coursera = require('../source/coursera-utils.js')

// // test('Template', async () => {  })

// // function readFile()
// async function loadFile(file) {
//     return await fs.readFile(file, 'utf8');
// }

// test('Load HTML to document', async () => {
//     file = 'tests/pages/coursera/course.html'
//     document.body.innerHTML = await loadFile(file)
//     // console.log(document.body.innerHTML)
//     expect(document.body.innerHTML).toBeTruthy()
// })

// test('Value a course on its review page', async () => {
//     file = 'tests/pages/coursera/review.html'
//     document.body.innerHTML = await loadFile(file)
//     document.location = 'https://www.coursera.org/learn/python-project/reviews'
//     var X = await coursera.discriminator(document.location.pathname)
//     console.log(X)
//     X.displayResult()
//     X.prettylog()
// })