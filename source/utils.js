const fetch = require('cross-fetch');
const urljoin = require('url-join');
const { DOMParser, parseHTML } = require('linkedom');
// const cheerio = require('cheerio');

/*////////////////////////////
//
//    STYLES
//
*/ ///////////////////////////

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
*/ ///////////////////////////

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
*/ ///////////////////////////

exports.fetchPage = async function(domain, ...paths) {

    if (!domain.startsWith('https://') && !domain.startsWith('http://')) {
        domain = `https://${domain}`
    }

    let url = new URL(urljoin(...paths), domain)
    // console.debug(url)

    // prevents fetching of the current document
    console.debug(document.location.href)
    console.debug(url.href)
    if (typeof document !== "undefined" &&
        url.href == document.location.href) {
        // return cheerio.load(document.documentElement.outerHTML)
        return document
    }

    let parser = new DOMParser
    let response
    try {
        response = await fetch(url)
    } catch (error) {
        console.error(error)
        return parser.parseFromString('', 'text/html');
    }

    // console.debug(response.status)
    return parser.parseFromString(await response.text(), 'text/html');
}

/*////////////////////////////
//
//  REGEX
//
*/ ///////////////////////////

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
*/ ///////////////////////////

exports.splitSelect = function(string, indexes = [1, 2], delimiter = '/') {
    let index = Array.from(indexes)
    let splited = string.split(delimiter)
    return index.map(i => splited[i])
}

/*////////////////////////////
//
//  PROMISES
//
*/ ///////////////////////////


exports.sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
