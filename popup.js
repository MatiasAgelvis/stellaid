// Initialize butotn with users's prefered color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
    changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: setPageBackgroundColor,
    });
});


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
    AntonEgo(...prepPathname(window.location.pathname));


    // console.log(url);
    function last(array) {
        // returns the last element of the given array
        return array[array.length - 1];
    }

    function count(str, pattern) {
        // returns the number of marches of a pattern in a string
        let re = RegExp(pattern, 'g')
        return ((str || '').match(re) || []).length
    }

    function countStars(review) {
        // returns the number of stars given by the reviewer
        let fullStars = count(review.innerHTML, '<title .*?>Filled Star</title>');
        let halfStars = count(review.innerHTML, '<title .*?>Half Star</title>');

        return fullStars + (halfStars / 2);
    }

    function getAgeOfReview(review) {
        // returns (currently) the age of the review in days since the Unix Epoch
        let daysFactor = 1000 * 3600 * 24;

        let date = Date.parse(review.getElementsByClassName('dateOfReview')[0].innerText);

        return date / daysFactor;
    }

    function countLikes(review) {
        // returns the number of thumbs up (this was helpful) of a given review
        let baseReviewValue = 0;
        let likes = review.innerHTML.match(/<span>This is helpful \((.*)\)<\/span>/);
        return baseReviewValue + (likes ? parseInt(likes[1]) : 0);
    }

    function peerScore(reviews) {
        // returns the weighted average of the peer review valuation model
        let score = 0;
        let totalWeight = 0;
        let peerPower = 2;
        let timedecay = 0.3;

        reviews.forEach(review => {
            // console.log(countStars(review))
            // console.log(countLikes(review))
            // calculate the score

            let peers = countLikes(review) ** peerPower
            let time = getAgeOfReview(review) ** timedecay;

            score += countStars(review) * peers * time;
            totalWeight += peers * time;
        });

        // calculate the definitive score of the course
        score = score / totalWeight;

        return score;
    }

    function getCourseraScore() {
        // returns the official coursera valuation
        let score = document.getElementsByClassName('rating-text')[0].innerText;
        // return parseFloat(score);
        // for security we match the number in regex before parsing it
        return parseFloat(score.match(/[\d\.]+/));
    }

    function getNumberRatings() {
        // returns the total number of reviews of the course in coursera
        let count = document.querySelector('[data-test="ratings-count-without-asterisks"]').innerText;
        // we must remove the thousend comma separator
        return parseInt(count.replace(/,/g, ''));
    }

    function courseraScore() {
        // debug func
        console.log(getCourseraScore());
        console.log(getNumberRatings());
    }


    async function fetchReviewPage(course) {
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
    }


    async function getCourseReviews(course) {
        // we are strict with the url to simplify cases where the request
        // is made from the very reviews page of the course

        let doc = await fetchReviewPage(course);

        // an array so that is easier to iterate over later on
        let reviews = Array.from(doc.getElementsByClassName('review'));

        // the peer reviewed reviews get to decide 4 stars
        let peerStars = 4 / 5;
        // the rest depends on the agregate from coursera
        let voxPopuliStars = 1 - peerStars;

        let score = peerStars * peerScore(reviews) + voxPopuliStars * getCourseraScore();

        // round to one decimal place
        score = score.toFixed(1);

        return score;
    }

    function prepPathname(pathname){
        return [pathname.split('/')[1], pathname.split('/')[2]]
    }

    async function AntonEgo(type, name) {

        // check if we are in a search or in the page of a course
        switch (type) {
            case 'search':
                // SEARCH PAGE, must call this function for each element
                // No visual modifications should be made at this level

                console.log('this is a search page, implementation comming soon');
                // if we are in a search page we then document has all the data we need
                let results = Array.from(document.getElementsByClassName('result-title-link'));
                
                // turn array of a tags to their pathnames
                let pathnames = results.map(x => x.pathname);
                // prepare path names
                pathnames = pathnames.map(prepPathname);

                let scores = pathnames.map(x => AntonEgo(...x))
                console.log(scores)

                break;
            case 'learn':
                // COURSE, base case
                console.log(name);
                let score = await getCourseReviews(name);
                console.log('Adjusted score of the course:', score);
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