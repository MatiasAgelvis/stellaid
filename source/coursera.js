var utils = require('./utils.js')
var coursera = require('./coursera-utils.js')
// let url = window.location.toString()
console.log('--------------------------\n')
console.log('--- Stellaid: Coursera ---\n')
console.log('--------------------------\n')

utils.addIcons()

// prevents the added text from breaking the row of stars
var styles = `._1mzojlvw { white-space: nowrap; }
.ratings-text { display: flex; flex-direction: row;}
.ratings-icon, .ratings-text { white-space: nowrap; }`
var styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet)

// ----- START HERE ------
async function main() {

    var X = await coursera.discriminator(document.location.pathname)
    console.debug(X)
    X.displayResult()
    X.prettylog()
}

main()

var observer = new MutationObserver(async function(mutations, observer) {
    observer.disconnect()
    console.debug('DOM modifications detected')
    main()
    // X.displayResult()
    await utils.sleep(2000)
    observer.observe(document.body, {
        childList: true,
        subtree: true
    })
})

observer.observe(document.body, {
    childList: true,
    subtree: true
})