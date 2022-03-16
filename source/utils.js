const fetch = require('cross-fetch');

/*////////////////////////////
//
//    STYLES
//
*/ ////////////////////////////

// appends google materia icons, specially the verified icon
// substitute with the svg of the only icon that is used
exports.addIcons = function() {
    let link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons"
    document.head.appendChild(link)
}

/*////////////////////////////
//
//  BADGE
//
*/ ////////////////////////////

// make the ID of the span what will eventually contain the score
exports.makeID = function(page, type, name) {
    return `stellaid-${page}-${type}-${name}`
}
var makeID = exports.makeID

exports.makeScoreNode = function(page, type, name, message = '') {
    return `&nbsp;<span id='${makeID(page, type, name)}' style='display: inline-block; white-space: nowrap;'>${message}</span>`
}

// inline styles for the verified icon
var icon = '<i style=\'font-size: inherit; line-height: unset; vertical-align: bottom;\' class="material-icons">verified</i>'

// returns the HTML of the score badge
exports.makeBadge = function(score) {
    return `(${score.toFixed(1)}${icon})`
}


/*////////////////////////////
//
//  REQUESTS
//
*/ ////////////////////////////

exports.isCurrentFile = function(pathname) {
    return pathname == document.location.pathname
}
var isCurrentFile = exports.isCurrentFile

exports.fetchPage = async function(domain, ...paths) {
    // given a course name will return 
    // the parsed doc of the review page for the course

    let pathname = joinPaths(...paths)
    let url = new URL(pathname, domain)

    // prevents fetching of the current document
    if (isCurrentFile(pathname)) {
        return document
    }

    let response
    try {
        response = await fetch(url)
    } catch (error) {
        console.error(error)
        return null
    }

    let parser = new DOMParser()
    let doc = parser.parseFromString(await response.text(), 'text/html')

    return doc
}

/*////////////////////////////
//
//  REGEX
//
*/ ////////////////////////////

exports.scoreRegex = /\((\d\.?\d)verified\)/


exports.regexCount = function(str, pattern) {
    // returns the number of marches of a pattern in a string
    let re = RegExp(pattern, 'g')
    return ((str || '').match(re) || []).length
}


/*////////////////////////////
//
//  PATHS
//
*/ ////////////////////////////

exports.splitSelect = function(string, index = [1, 2], delimiter = '/') {
    let splited = string.split(delimiter)
    return index.map(i => splited[i])
}

exports.joinPaths = function(...paths) {
    return '/' + [...paths].join('/')
}
var joinPaths = exports.joinPaths

/*////////////////////////////
//
//  PROMISES
//
*/ ////////////////////////////


exports.sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// exports.promisify = f => (...args) => new Promise((res, rej) => f(...args, (err, data) => err ? rej(err) : res(data)))
