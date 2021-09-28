var reviewer = {
    // console.log(url);
    last: function(array) {
        // returns the last element of the given array
        return array[array.length - 1];
    },

    count: function(str, pattern) {
        // returns the number of marches of a pattern in a string
        let re = RegExp(pattern, 'g')
        return ((str || '').match(re) || []).length
    },

    countStars: function(review) {
        // returns the number of stars given by the reviewer
        let fullStars = reviewer.count(review.innerHTML, '<title .*?>Filled Star</title>');
        let halfStars = reviewer.count(review.innerHTML, '<title .*?>Half Star</title>');

        return fullStars + (halfStars / 2);
    },

    getAgeOfReview: function(review) {
        // returns (currently) the age of the review in days since the Unix Epoch
        let daysFactor = 1000 * 3600 * 24;

        let date = Date.parse(review.getElementsByClassName('dateOfReview')[0].innerText);

        return date / daysFactor;
    },

    countLikes: function(review) {
        // returns the number of thumbs up (this was helpful) of a given review
        let baseReviewValue = 0;
        let likes = review.innerHTML.match(/<span>This is helpful \((.*)\)<\/span>/);
        return baseReviewValue + (likes ? parseInt(likes[1]) : 0);
    },

    peerScore: function(doc) {
        // returns the weighted average of the peer review valuation model

        // an array so that is easier to iterate over later on
        let reviews = Array.from(doc.getElementsByClassName('review'));

        let score = 0;
        let totalWeight = 0;
        let peerPower = 2;
        let timedecay = 0.3;

        reviews.forEach(review => {
            // console.log(countStars(review))
            // console.log(countLikes(review))
            // calculate the score

            let peers = reviewer.countLikes(review) ** peerPower
            let time = reviewer.getAgeOfReview(review) ** timedecay;

            score += reviewer.countStars(review) * peers * time;
            totalWeight += peers * time;
        });

        // calculate the definitive score of the course
        score = score / totalWeight;

        return score;
    },


    getCourseraScore: function(doc) {
        // returns the official coursera valuation
        let score = doc.getElementsByClassName('rating-text')[0].innerText;
        // return parseFloat(score);
        // for security we match the number in regex before parsing it
        return parseFloat(score.match(/[\d\.]+/));
    },

    getNumberRatings: function(doc) {
        // returns the total number of reviews of the course in coursera
        let count = doc.querySelector('[data-test="ratings-count-without-asterisks"]').innerText;
        // we must remove the thousend comma separator
        return parseInt(count.replace(/,/g, ''));
    },

    courseraScore: function(doc) {
        // debug func
        console.log(getCourseraScore(doc));
        console.log(getNumberRatings(doc));
    },


    fetchReviewPage: async function(course) {
        // given a course name will return 
        // the parsed doc of the review page for the course

        let response;

        try {
            response = await fetch('https://www.coursera.org/learn/' + course + '/reviews');
        } catch (error) {
            console.error(error);
        }

        let parser = new DOMParser();
        let doc = parser.parseFromString(await response.text(), 'text/html');

        return doc;
    },


    getCourseReviews: async function(course) {
        // we are strict with the url to simplify cases where the request
        // is made from the very reviews page of the course

        let doc = await reviewer.fetchReviewPage(course);

        // the peer reviewed reviews get to decide 4 stars
        let peerStars = 4 / 5;
        // the rest depends on the agregate from coursera
        let voxPopuliStars = 1 - peerStars;

        let score = peerStars * reviewer.peerScore(doc) + voxPopuliStars * reviewer.getCourseraScore(doc);

        // round to one decimal place
        score = score.toFixed(1);

        return score;
    },

    prepPathname: function(pathname) {
        return [pathname.split('/')[1], pathname.split('/')[2]]
    },
}


// The body of this function will be execuetd as a content script inside the
// current page
async function setPageBackgroundColor() {
    // let url = window.location.toString()
    console.log('\n---------\n');

    // add google material icons
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    document.head.appendChild(link);


    // START entry point to the algorithm
    AntonEgo(...reviewer.prepPathname(window.location.pathname));

    async function AntonEgo(type, name) {

        // check if we are in a search or in the page of a course
        switch (type) {
            case 'search':
                // SEARCH PAGE, must call this function for each element
                // No visual modifications should be made at this level

                console.log('this is a search page');
                // if we are in a search page we then document has all the data we need
                let results = Array.from(document.getElementsByClassName('result-title-link'));

                // turn array of a tags to their pathnames
                let pathnames = results.map(x => x.pathname);
                // prepare path names
                pathnames = pathnames.map(reviewer.prepPathname);

                let scores = await Promise.all(pathnames.map(async (x) => AntonEgo(...x)));
                console.log(scores)

                for (let i = 0; i < scores.length; i++) {
                    console.log(pathnames[i][1], scores[i])
                }

                break;
            case 'learn':
                // COURSE, base case
                console.log(name);
                let score = await reviewer.getCourseReviews(name);
                console.log('Adjusted score of the course:', score);
                return await score;
                break;

            case 'professional-certificates':
            case 'specializations':
                console.log('this is a specialization or professional-certificate page, implementation comming soon');
                // professional certificates consist of several courses
                // must score them all and average
                break;

            default:
                console.log('Deafult case');
        }
    }
}

setPageBackgroundColor();