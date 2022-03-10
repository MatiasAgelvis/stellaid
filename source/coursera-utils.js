var utils = require('./utils.js')

makeID = function(type, name){
    return utils.makeID('coursera', type, name)
}
// var makeID = exports.makeID

makeScoreNode = function(type, name, message = '') {
    return utils.makeScoreNode('coursera', type, name, message)
}
// var makeScoreNode = exports.makeScoreNode


// ------------------------------------- class Course
exports.Course = class {

    constructor(name) {
        this.name = name
        this.type = 'learn'
        this.ID = makeID(this.type, this.name)
        this.target = document.getElementsByClassName('rating-text')[0]
        this.hasReviews = true
        this.peerPower = 2
        this.timedecay = 0.3
        this.baseReviewValue = 2
        this.score = this.Score()
    }

    async Score() {
        let scoreNode = document.getElementById(this.ID)
        let alreadyVerified = Boolean(scoreNode) && utils.scoreRegex.test(scoreNode.innerText)
        // if the score was already written just read it from the document            
        return alreadyVerified ?
            parseFloat(utils.scoreRegex.exec(scoreNode.innerText)[1]).toFixed(1) :
            this.getCourseScore()
    }

    async prettylog() {
        let score = await this.score
        if (!document.getElementById(this.ID)) {
            console.log(this.name, score)
        }
    }

    async displayResult() {
        let score = await this.score
        // if span for score doesn't exist make it
        if (this.target) {
            if (!document.getElementById(this.ID)) {
                this.target.innerHTML += makeScoreNode(this.type, this.name)
            }

            if (score >= 0) {
                document.getElementById(this.ID).innerHTML = utils.makeBadge(score)
            }
        }
    }

    countStars(review) {
        // returns the number of stars given by the reviewer
        let fullStars = utils.regexCount(review.innerHTML, '<title .*?>Filled Star</title>')
        let halfStars = utils.regexCount(review.innerHTML, '<title .*?>Half Star</title>')

        return fullStars + (halfStars / 2)
    }

    getAgeOfReview(review) {
        // returns (currently) the age of the review in days since the Unix Epoch
        let daysFactor = 1000 * 3600 * 24

        let date = Date.parse(review.getElementsByClassName('dateOfReview')[0].innerText)

        return date / daysFactor
    }

    countLikes(review) {
        // returns the number of thumbs up (this was helpful) of a given review
        let likes = review.innerHTML.match(/<span>This is helpful \((.*)\)<\/span>/)
        return this.baseReviewValue + (likes ? parseInt(likes[1]) : 0)
    }

    peerScore(doc) {
        // returns the weighted average of the peer review valuation model

        // an array so that is easier to iterate over later on
        let reviews = Array.from(doc.getElementsByClassName('review'))

        let score = 0
        let totalWeight = 0

        reviews.forEach(review => {
            // calculate the score

            let peers = this.countLikes(review) ** this.peerPower
            let time = this.getAgeOfReview(review) ** this.timedecay

            score += this.countStars(review) * peers * time
            totalWeight += peers * time
            // console.log(totalWeight)
        })

        // calculate the definitive score of the course
        score = score / totalWeight

        return score
    }

    getCourseraScore(doc) {
        // returns the official coursera valuation
        let score = doc.getElementsByClassName('rating-text')[0].innerText
        // return parseFloat(score)
        // for security we match the number in regex before parsing it
        return parseFloat(score.match(/[\d\.]+/))
    }

    getNumberRatings(doc) {
        // returns the total number of reviews of the course in coursera
        let total = doc.querySelector('[data-test="ratings-count-without-asterisks"]').innerText
        // we must remove the thousand comma separator
        return parseInt(total.replace(/,/g, ''))
    }

    checkIfReviewed(doc) {
        this.hasReviews = !(doc.getElementsByClassName('review').length == 0 ||
            doc.getElementsByClassName('dateOfReview').length == 0 ||
            doc.getElementsByClassName('rating-text').length == 0)
        // console.log('this.hasReviews', this.name, this.hasReviews)
        return this.hasReviews
    }

    async getCourseScore() {
        let doc = await utils.fetchPage(this.type, this.name, 'reviews')

        if (!this.checkIfReviewed(doc)) {
            return -1
        }

        // the peer reviewed reviews get to decide 4 stars
        let peerStars = 4 / 5
        // the rest depends on the aggregate from coursera
        let voxPopuliStars = 1 - peerStars

        let score = peerStars * this.peerScore(doc) + voxPopuliStars * this.getCourseraScore(doc)

        // round to one decimal place
        score = score.toFixed(1)

        return score
    }
}
var Course = exports.Course

// ------------------------------------- class Project
exports.Project = class extends Course {
    constructor(name) {
        super(name)
        this.type = 'projects'
        this.ID = makeID(this.type, this.name)
    }
}
var Project = exports.Project
// ------------------------------------- class Specialization
exports.Specialization = class {
    constructor(type, name) {
        this.name = name
        this.type = type
        this.ID = makeID(this.type, this.name)
        this.scoreNode = document.getElementById(this.ID)
        this.names = null
        this.courses = null
        this.printTo = 'rating-text'
        this.target = document.getElementsByClassName(this.printTo)[0]
        this.score = this.Score()
    }

    async initializer() {
        // this async function finishes the construction
        this.names = await this.getCoursesPathnames(await utils.fetchPage(this.type, this.name))
        this.courses = this.names.map(x => new Course(x))
    }

    async Score() {
        await this.initializer()

        let sum_reduce = (prev, curr) => prev + curr
        let scores = await Promise.all(this.courses.map(x => x.score))
        scores = scores.map(parseFloat)

        let filtered = scores.filter(x => x > 0)

        let sum = filtered.length > 0 ? filtered.reduce(sum_reduce) : 0
        let count = filtered.length

        return sum > 0 ? (sum / count).toFixed(1) : -1
    }

    async prettylog() {
        let score = await this.score
        let print = !document.getElementById(this.ID)
        if (print) {
            console.log(this.name, score)
        }

        await Promise.all(this.courses.map(x => x.score)).then((scores) => {
            for (let i = 0; i < this.names.length; i++) {
                if (print) {
                    console.log(this.names[i], scores[i])
                }
            }
        })
    }

    async displayResult() {
        let cards = Array.from(document.getElementsByClassName(this.printTo))
        let spec = cards.shift()
        let score = await this.score

        // setup the scoreNodes for the specialization
        if (this.target) {
            if (!document.getElementById(this.ID)) {
                this.target.innerHTML += makeScoreNode(this.type, this.name)
            }
        }

        // setup the scoreNodes for the courses
        this.courses.forEach((course, i) => {
            course.target = cards[i]
        })

        // score the specialization
        if (score >= 0) {
            document.getElementById(this.ID).innerHTML = utils.makeBadge(score)
        }

        // score the courses
        this.courses.forEach((course) => {
            course.displayResult()
        })
    }

    async getCoursesPathnames(doc) {
        // displays all courses, has issues with the lag of the load of some scripts
        let results = Array.from(doc.querySelectorAll('[data-e2e="course-link"]'))
        let showButton = doc.querySelector('button.d-block')

        // to improve speed in search pages the whole list of courses
        // will only be taken into account at the specialization page
        // either way the script that reveals the whole list was not loading in time
        if (showButton && showButton.innerText == 'Show More' &&
            utils.isCurrentFile(utils.joinPaths(this.type, this.name))) {
            await utils.sleep(500)
            showButton.click()
        }

        // await new Promise(r => setTimeout(r, 2000))
        results = Array.from(doc.querySelectorAll('[data-e2e="course-link"]'))

        // turn array of a tags to their pathnames
        let pathnames = results.map(x => x.pathname)
        // console.log(pathnames)

        // prepare path names
        return pathnames.map(x => utils.splitPathname(x)[1])
    }
}
var Specialization = exports.Specialization

// ------------------------------------- class Search
exports.Search = class {
    constructor() {
        return (async () => {
            this.results = await this.pageResults()
            console.debug(this.results)
            this.names = this.results.map(x => x.pathname)
            this.courses = this.names.map(discriminator)
            let cards = Array.from(document.getElementsByClassName('ratings-text'))
            // setup the scoreNodes for the courses
            this.courses.forEach((course, i) => {
                course.target = cards[i]
            })

            return this;
        })();
    }

    async pageResults() {
        let results = Array.from(document.getElementsByClassName('result-title-link'))
        while (results === undefined || results.length == 0) {
            await utils.sleep(1500)
            // without this it would pick up the name of the placeholders
            if (document.readyState === 'complete') {
                results = Array.from(document.getElementsByClassName('result-title-link'))
            }
        }
        return results
    }

    async Score() {
        this.courses.forEach(x => x.Score())
        await Promise.all(this.courses.map(x => x.score))
    }

    async prettylog() {
        await Promise.all(this.courses.map(x => x.score)).then((scores) => {

            for (let i = 0; i < this.names.length; i++) {
                if (!document.getElementById(this.courses.ID)) {
                    console.log(this.names[i], scores[i])
                }
            }
        })
    }

    async displayResult() {
        this.courses.forEach((course) => {
            course.displayResult()
        })
    }
}
var Search = exports.Search

exports.discriminator = function (pathname) {
    [type, name] = utils.splitPathname(pathname)

    switch (type) {
        case 'search':
        case 'courses':
            return new Search()
            break
        case 'learn':
            return new Course(name)
            break
        case 'professional-certificates':
        case 'specializations':
            return new Specialization(type, name)
            break
        case 'projects':
            return new Project(name)
            break
        case 'instructor':
            return new Instructor()
            break
        default:
            console.error(`Unknown type: ${type} is not registered.`)
            return null
    }
}
var discriminator = exports.discriminator