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
function setPageBackgroundColor() {
    // let url = window.location.toString()

    // console.log(url);
    function last(array) {
        // returns the last element of the given array
        return array[array.length - 1];
    }

    function count(str, pattern) {
        // returns the number of marches of a pattern in a string
        const re = RegExp(pattern, 'g')
        return ((str || '').match(re) || []).length
    }

    function countStars(review) {
        // returns the number of stars given by the reviewer
        let fullStars = count(review.innerHTML, '<title .*?>Filled Star</title>');
        let halfStars = count(review.innerHTML, '<title .*?>Half Star</title>');

        return fullStars + (halfStars / 2);
    }

    function getAgeOfReview(review){
        // returns (currently) the age of the review in days since the Unix Epoch
        let daysFactor = 1000 * 3600 * 24;

        var date = Date.parse(review.getElementsByClassName('dateOfReview')[0].innerText);

        return date / daysFactor;
    }

    function countLikes(review) {
        // returns the number of thumbs up (this was helpful) of a given review
        let baseReviewValue = 0;
        var likes = review.innerHTML.match(/<span>This is helpful \((.*)\)<\/span>/);
        return baseReviewValue + (likes ? parseInt(likes[1]) : 0);
    }

    function peerScore(reviews) {
        // returns the weighted average of the peer review valuation model
        var score = 0;
        var totalWeight = 0;
        let peerPower = 2;
        let timedecay = 0.3;

        reviews.forEach(review => {
            // console.log(countStars(review))
            // console.log(countLikes(review))
            // calculate the weighted average

            let peers = countLikes(review) ** peerPower
            let time = getAgeOfReview(review) ** timedecay;

            score += countStars(review) * peers * time;
            totalWeight += peers * time;
        });

        // calculate the definitive score of the course
        score = score / totalWeight;

        return score;
    }

    function getReviews(html) {
        // returns the top 25 reviews in an array
        // Convert the HTML string into a document object
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        var reviews = doc.getElementsByClassName('review');

        // returns an array so that is easier to iterate over later on
        return Array.from(reviews);
    }

    function getCourseraScore(){
        // returns the official coursera valuation
        var score = document.getElementsByClassName('rating-text')[0].innerText;
        // return parseFloat(score);
        // for security we match the number in regex before parsing it
        return parseFloat(score.match(/[\d\.]+/));
    }

    function getNumberRatings(){
        // returns the total number of reviews of the course in coursera
        var count = document.querySelector('[data-test="ratings-count-without-asterisks"]').innerText;
        // we must remove the thousend comma separator
        return parseInt(count.replace(/,/g, ''));
    }

    function courseraScore(){
        // debug func
        console.log(getCourseraScore());
        console.log(getNumberRatings());
    }


    function getCourseReviews(course) {
        // we are strict with the url to simplify cases where the request
        // is made from the very reviews page of the course
        fetch('https://www.coursera.org/learn/' + course + '/reviews').then(function(response) {
            // The API call was successful!
            return response.text();
        }).then(function(html) {

            // the peer reviewed reviews get to decide 4 stars
            let peerStars = 4/5;
            // the rest depends on the agregate from coursera
            let voxPopuliStars = 1 - peerStars;


            var reviews = getReviews(html);
            var score = peerStars * peerScore(reviews) + voxPopuliStars * getCourseraScore();

            // round to one decimal place
            score = score.toFixed(1);


            console.log('Real adjusted score of the course:', score);
            
            // here will go the style modification
            // we will make to the course valuation


        }).catch(function(err) {
            // There was an error
            console.warn('Something went wrong.', err);
        });

    }


    let url = window.location.pathname.split('/')

    // check if we are in a search or in the page of a course
    switch (url[1]) {
        case 'search':
            console.log('this is a search page, implementation comming soon');
            break;
        case 'learn':
            console.log(url[2]);
            getCourseReviews(url[2]);
            break;
        default:
            console.log('Deafult case');
    }


}