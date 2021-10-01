// the hackiest solution I could find
{
    var icon = '<i style=\'font-size: inherit; line-height: unset; vertical-align: bottom;\' class="material-icons">verified</i>'
    // var icon = '<i class="bi bi-patch-check"></i>'

    function zip(arrays) {
        return arrays[0].map(function(_, i) {
            return arrays.map(function(array) { return array[i] })
        });
    }

    function last(array) {
        // returns the last element of the given array
        return array[array.length - 1];
    }


    function regexCount(str, pattern) {
        // returns the number of marches of a pattern in a string
        let re = RegExp(pattern, 'g')
        return ((str || '').match(re) || []).length
    }

    function prepPathname(pathname) { return [pathname.split('/')[1], pathname.split('/')[2]] }

    async function fetchPage(...paths) {
        // given a course name will return 
        // the parsed doc of the review page for the course
        let url = 'https://www.coursera.org/' + [...paths].join('/');
        let response;
        try {
            response = await fetch(url);
        } catch (error) {
            console.error(error);
            return null;
        }

        let parser = new DOMParser();
        let doc = parser.parseFromString(await response.text(), 'text/html');

        return doc;
    }

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
    // ------------------------------------- class Course
    class Course {

        constructor(name) {
            this.name = name
            this.type = 'learn'
            this.score = null
            this.hasReviews = true
            this.peerPower = 2;
            this.timedecay = 0.3;
            this.baseReviewValue = 2;
        }

        async Score() {
            this.score = this.getCourseScore(this.name);
            return this.score;
        }

        async prettylog() {
            this.score.then(x => console.log(this.name, x))
        }

        displayResult() {
            this.score.then(x => {
                if (x >= 0) { document.getElementsByClassName('rating-text')[0].innerHTML += ` (${x}${icon})` }
            })
        }

        countStars(review) {
            // returns the number of stars given by the reviewer
            let fullStars = regexCount(review.innerHTML, '<title .*?>Filled Star</title>');
            let halfStars = regexCount(review.innerHTML, '<title .*?>Half Star</title>');

            return fullStars + (halfStars / 2);
        }

        getAgeOfReview(review) {
            // returns (currently) the age of the review in days since the Unix Epoch
            let daysFactor = 1000 * 3600 * 24;

            let date = Date.parse(review.getElementsByClassName('dateOfReview')[0].innerText);

            return date / daysFactor;
        }

        countLikes(review) {
            // returns the number of thumbs up (this was helpful) of a given review
            let likes = review.innerHTML.match(/<span>This is helpful \((.*)\)<\/span>/);
            return this.baseReviewValue + (likes ? parseInt(likes[1]) : 0);
        }


        peerScore(doc) {
            // returns the weighted average of the peer review valuation model

            // an array so that is easier to iterate over later on
            let reviews = Array.from(doc.getElementsByClassName('review'));

            let score = 0;
            let totalWeight = 0;

            reviews.forEach(review => {
                // calculate the score

                let peers = this.countLikes(review) ** this.peerPower
                let time = this.getAgeOfReview(review) ** this.timedecay;

                score += this.countStars(review) * peers * time;
                totalWeight += peers * time;
                console.log(totalWeight)
            });

            // calculate the definitive score of the course
            score = score / totalWeight;

            return score;
        }

        getCourseraScore(doc) {
            // returns the official coursera valuation
            let score = doc.getElementsByClassName('rating-text')[0].innerText;
            // return parseFloat(score);
            // for security we match the number in regex before parsing it
            return parseFloat(score.match(/[\d\.]+/));
        }

        getNumberRatings(doc) {
            // returns the total number of reviews of the course in coursera
            let total = doc.querySelector('[data-test="ratings-count-without-asterisks"]').innerText;
            // we must remove the thousend comma separator
            return parseInt(total.replace(/,/g, ''));
        }

        async fetchReviewPage(course) {
            // given a course name will return 
            // the parsed doc of the review page for the course
            let response;
            try {
                response = await fetch('https://www.coursera.org/learn/' + course + '/reviews');
            } catch (error) {
                console.error(error);
                return null;
            }

            let parser = new DOMParser();
            let doc = parser.parseFromString(await response.text(), 'text/html');

            return doc;
        }

        checkIfReviewed(doc) {
            this.hasReviews = !(doc.getElementsByClassName('review').length == 0 ||
                doc.getElementsByClassName('dateOfReview').length == 0 ||
                doc.getElementsByClassName('rating-text').length == 0)
            console.log('this.hasReviews', this.name, this.hasReviews)
            return this.hasReviews
        }

        async getCourseScore() {
            let doc = await fetchPage(this.type, this.name, 'reviews');

            if (!this.checkIfReviewed(doc)) { return -1 }

            // the peer reviewed reviews get to decide 4 stars
            let peerStars = 4 / 5;
            // the rest depends on the agregate from coursera
            let voxPopuliStars = 1 - peerStars;

            let score = peerStars * this.peerScore(doc) + voxPopuliStars * this.getCourseraScore(doc);

            // round to one decimal place
            score = score.toFixed(1);

            return score;
        }
    }

    // ------------------------------------- class Project
    class Project extends Course {
        constructor(name) {
            super(name);
            this.type = 'projects'
        }
    }

    // ------------------------------------- class Specialization
    class Specialization {
        constructor(type, name) {
            this.doc = fetchPage(this.type, this.name);
            this.name = name
            this.names = [];
            this.type = type
            this.courses = [];
        }

        async Score() {
            this.names = this.getCoursesPathnames(await this.doc);
            // TODO: add a structure similar to discriminator, or use the same function
            this.courses = this.names.map(x => new Course(x))
            // await Promise.all(inputArray.map(async (i) => someAsyncFunction(i)));
            this.courses.forEach(x => x.Score())
        }

        async prettylog() {
            // await this.Score()
            await sleep(4000)
            Promise.all(this.courses.map(x => x.score)).then((scores) => {

                for (let i = 0; i < this.names.length; i++) {
                    console.log(this.names[i], scores[i])
                }
            })
        }

        async displayResult() {
            // await this.Score()
            // we have to force the wait so that courses can get their own promises
            // to actually block the execution with their own promises
            await sleep(4000)

            Promise.all(this.courses.map(x => x.score)).then((scores) => {

                let cards = Array.from(document.getElementsByClassName('rating-text'))
                let spec = cards.shift();

                let avg = 0
                for (var i = 0; i < scores.length; i++) {
                    if (scores[i] >= 0) {
                        // add the style
                        cards[i].innerHTML += ` (${scores[i]}${icon})`;

                        avg += parseFloat(scores[i])
                    }
                }

                // give final rating
                avg = (avg / scores.length).toFixed(1);
                spec.innerHTML += ` (${avg}${icon})`;
            })
        }

        getCoursesPathnames(doc) {
            // display all courses, inly works when we are in the window
            let results = Array.from(doc.querySelectorAll('[data-e2e="course-link"]'));


            if (window.location.pathname == `/${this.type}/${this.name}`) {

                if (document.querySelector('button.d-block').innerText == 'Show More') {
                    document.querySelector('button.d-block').click();
                }

                // await new Promise(r => setTimeout(r, 2000));
                results = Array.from(document.querySelectorAll('[data-e2e="course-link"]'));
            }

            // turn array of a tags to their pathnames
            let pathnames = results.map(x => x.pathname);
            // console.log(pathnames)

            // prepare path names
            return pathnames.map(x => prepPathname(x)[1]);
        }
    }

    // ------------------------------------- class Search
    class Search {

        constructor(doc) {
            this.names = this.getSearchPageCourses(doc);
            this.courses = []
        }

        async Score() {
            this.courses = this.names.map(x => new Course(x))
            // await Promise.all(inputArray.map(async (i) => someAsyncFunction(i)));
            this.courses.forEach(x => x.Score())
        }

        getSearchPageCourses(doc) {
            let results = Array.from(doc.getElementsByClassName('result-title-link'));

            // turn array of a tags to their pathnames
            let pathnames = results.map(x => x.pathname);
            // console.log(pathnames)

            // prepare path names
            return pathnames.map(x => prepPathname(x)[1]);
        }

        prettylog() {
            Promise.all(this.courses.map(x => x.score)).then((scores) => {

                for (let i = 0; i < this.names.length; i++) {
                    console.log(this.names[i], scores[i])
                }
            })
        }

        displayResult() {
            Promise.all(this.courses.map(x => x.score)).then((scores) => {

                let cards = document.getElementsByClassName('ratings-text');
                // let containers = document.getElementsByClassName('rc-Ratings')
                let containers = document.getElementsByClassName('ratings-icon')

                for (let i = 0; i < this.names.length; i++) {
                    if (scores[i] >= 0) {
                        cards[i].innerHTML += ` (${scores[i]}${icon})`;
                        containers[i].style.width = 'unset';
                    }
                }
            })
        }
    }

    function discriminator(pathname) {
        [type, name] = prepPathname(pathname);

        switch (type) {
            case 'search':
            case 'courses':
                return new Search(document);
                break;
            case 'learn':
                return new Course(name);
                break;
            case 'professional-certificates':
            case 'specializations':
                return new Specialization(type, name);
                break;
            case 'projects':
                return new Project(name);
                break;
            case 'instructor':
                return new Instructor();
                break;
            default:
                console.error(`Unknown type: ${type} is not registered.`)
                return null;
        }
    }

    // The body of this function will be execuetd as a content script inside the
    // current page
    async function main() {
        // let url = window.location.toString()
        console.log('\n---------\n');

        // add google material icons
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
        // link.href = "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";
        document.head.appendChild(link);


        // START entry point to the algorithm
        let X = discriminator(window.location.pathname);

        X.Score();
        X.prettylog();
        X.displayResult();
    }

    main();

}