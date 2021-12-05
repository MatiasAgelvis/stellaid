// Wraps the whole script in a closure in case the extension is called more than once
{
    function extensionBadge(msg) {
        chrome.runtime.sendMessage({ text: msg }, function(response) {
            console.log("Badge Text: ", response)
        })
    }

    extensionBadge('Wait')

    var icon = '<i style=\'font-size: inherit; line-height: unset; vertical-align: bottom;\' class="material-icons">verified</i>'

    function makeID(type, name) { return `coursera-advisor-score-${type}-${name}` }

    function makeBadge(score) { return `(${score}${icon})` }

    // var icon = '<i class="bi bi-patch-check"></i>'
    function makeScoreNode(type, name, message='') {
        return `&nbsp;<span id='${makeID(type, name)}' style='display: inline-block; white-space: nowrap;'>${message}</span>`
    }

    var scoreRegex = /\((\d\.?\d)verified\)/

    function searchCSSmod() {
        // prevents the making the flex container of the original rating stars 
        // from becoming too wide when text is added
        var styles = `.ratings-icon, .ratings-text { white-space: nowrap; }`
        var styleSheet = document.createElement("style")
        styleSheet.type = "text/css"
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)
    }

    function zip(arrays) {
        return arrays[0].map(function(_, i) {
            return arrays.map(function(array) { return array[i] })
        })
    }

    function last(array) {
        // returns the last element of the given array
        return array[array.length - 1]
    }

    function regexCount(str, pattern) {
        // returns the number of marches of a pattern in a string
        let re = RegExp(pattern, 'g')
        return ((str || '').match(re) || []).length
    }

    const promisify = f => (...args) => new Promise((res, rej) => f(...args, (err, data) => err ? rej(err) : res(data)))

    function prepPathname(pathname) { return [pathname.split('/')[1], pathname.split('/')[2]] }

    function joinPaths(...paths) { return '/' + [...paths].join('/') }

    function isCurrentFile(pathname) {
        return pathname == document.location.pathname
    }

    async function fetchPage(...paths) {
        // given a course name will return 
        // the parsed doc of the review page for the course

        let pathname = joinPaths(...paths)
        let url = 'https://www.coursera.org' + pathname

        // prevents fetching of the current document
        if (isCurrentFile(pathname)) { return document }

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

    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

    // ------------------------------------- class Course
    class Course {

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
            let alreadyVerified = Boolean(scoreNode) && scoreRegex.test(scoreNode.innerText)
            // if the score was already written just read it from the document            
            return alreadyVerified ? 
                              parseFloat(scoreRegex.exec(scoreNode.innerText)[1]).toFixed(1) 
                            : this.getCourseScore()
        }

        async prettylog() {
            let score = await this.score
            console.log(this.name, score)
        }

        async displayResult() {
            let score = await this.score
            // if span for score doesn't exist make it
            if (this.target) {
                if(!document.getElementById(this.ID)){
                    this.target.innerHTML += makeScoreNode(this.type, this.name)
                }

                if (score >= 0) { document.getElementById(this.ID).innerHTML = makeBadge(score) }
            }
        }

        countStars(review) {
            // returns the number of stars given by the reviewer
            let fullStars = regexCount(review.innerHTML, '<title .*?>Filled Star</title>')
            let halfStars = regexCount(review.innerHTML, '<title .*?>Half Star</title>')

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
            console.log('this.hasReviews', this.name, this.hasReviews)
            return this.hasReviews
        }

        async getCourseScore() {
            let doc = await fetchPage(this.type, this.name, 'reviews')

            if (!this.checkIfReviewed(doc)) { return -1 }

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

    // ------------------------------------- class Project
    class Project extends Course {
        constructor(name) {
            super(name)
            this.type = 'projects'
            this.ID = makeID(this.type, this.name)
        }
    }

    // ------------------------------------- class Specialization
    class Specialization {
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
            this.names = await this.getCoursesPathnames(await fetchPage(this.type, this.name))
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
            this.score.then((score) => {
                console.log(this.type, this.name, score)

                this.courses.forEach(course => {
                    course.score.then(x => {
                        console.log(course.name, x)
                    })
                })
            })
        }

        async displayResult() {
            await this.Score()
            let cards = Array.from(document.getElementsByClassName(this.printTo))
            let spec = cards.shift()

            // setup the scoreNodes for the specialization
            if(!document.getElementById(this.ID)){
                this.target.innerHTML += makeScoreNode(this.type, this.name)
            }

            // setup the scoreNodes for the courses
            this.courses.forEach( (course, i) => { course.target = cards[i] })

            let score = await this.score
            // score the specialization
            if (score >= 0) { document.getElementById(this.ID).innerHTML = makeBadge(score) }
            
            // score the courses
            this.courses.forEach( (course) => { course.displayResult() })
        }

        async getCoursesPathnames(doc) {
            searchCSSmod()
            // displays all courses, has issues with the lag of the load of some scripts
            let results = Array.from(doc.querySelectorAll('[data-e2e="course-link"]'))
            let showButton = doc.querySelector('button.d-block')

            // to improve speed in search pages the whole list of courses
            // will only be taken into account at the specialization page
            // either way the script that reveals the whole list was not loading in time
            if (showButton && showButton.innerText == 'Show More' &&
                isCurrentFile(joinPaths(this.type, this.name))) {
                await sleep(100)
                showButton.click()
            }

            // await new Promise(r => setTimeout(r, 2000))
            results = Array.from(doc.querySelectorAll('[data-e2e="course-link"]'))

            // turn array of a tags to their pathnames
            let pathnames = results.map(x => x.pathname)
            // console.log(pathnames)

            // prepare path names
            return pathnames.map(x => prepPathname(x)[1])
        }
    }

    // ------------------------------------- class Search
    class Search {
        constructor() {
            this.results = Array.from(document.getElementsByClassName('result-title-link'))
            this.names = this.results.map(x => x.pathname)
            this.courses = this.names.map(discriminator)
            this.printTo = 'ratings-text'
            let cards = Array.from(document.getElementsByClassName(this.printTo))
            // setup the scoreNodes for the courses
            this.courses.forEach( (course, i) => { course.target = cards[i] })
        }

        async Score() {
            this.courses.forEach(x => x.Score())
            await Promise.all(this.courses.map(x => x.score))
        }

        async prettylog() {
            await Promise.all(this.courses.map(x => x.score)).then((scores) => {

                for (let i = 0; i < this.names.length; i++) {
                    console.log(this.names[i], scores[i])
                }
            })
        }

        async displayResult() {
            this.courses.forEach( (course) => { course.displayResult() })
        }
    }

    function discriminator(pathname) {
        [type, name] = prepPathname(pathname)

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

    // The body of this function will be executed as a content script inside the
    // current page
    async function main() {
        // let url = window.location.toString()
        console.log('\n---------\n')

        // add google material icons
        let link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = "https://fonts.googleapis.com/icon?family=Material+Icons"
        // link.href = "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
        document.head.appendChild(link)

        // prevents the added text from breaking the row of stars
        var styles = `._1mzojlvw { white-space: nowrap; }`
        var styleSheet = document.createElement("style")
        styleSheet.type = "text/css"
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)


        // START entry point to the algorithm
        let X = discriminator(document.location.pathname)

        // await X.Score()
        X.displayResult()
        await X.prettylog()
        extensionBadge('Done')

    }

    main()
}