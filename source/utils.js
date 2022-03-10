/*////////////////////////////
//
//    STYLES
//
*/////////////////////////////

// appends google materia icons, specially the verified icon
exports.addIcons = function() {
    // add google material icons
    let link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons"
    document.head.appendChild(link)
}





/*////////////////////////////
//
//  BADGE
//
*/////////////////////////////

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
    return `(${score}${icon})`
}


/*////////////////////////////
//
//  ARRAYS
//
*/////////////////////////////


exports.zip = function(arrays) {
    return arrays[0].map(function(_, i) {
        return arrays.map(function(array) {
            return array[i]
        })
    })
}

// returns the last element of the given array
exports.last = function(array) {
    return array[array.length - 1]
}


/*////////////////////////////
//
//  REQUESTS
//
*/////////////////////////////

exports.isCurrentFile = function(pathname) {
    return pathname == document.location.pathname
}
var isCurrentFile = exports.isCurrentFile

exports.fetchPage = async function(domain, ...paths) {
    // given a course name will return 
    // the parsed doc of the review page for the course

    let pathname = joinPaths(...paths)
    let url = domain + pathname

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
*/////////////////////////////

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
*/////////////////////////////

exports.splitPathname = function(pathname) {
    return [pathname.split('/')[1], pathname.split('/')[2]]
}

exports.joinPaths = function(...paths) {
    return '/' + [...paths].join('/')
}

var joinPaths = exports.joinPaths

exports.isCurrentFile = function(pathname) {
    return pathname == document.location.pathname
}

/*////////////////////////////
//
//  PROMISES
//
*/////////////////////////////


exports.sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


exports.promisify = f => (...args) => new Promise((res, rej) => f(...args, (err, data) => err ? rej(err) : res(data)))
