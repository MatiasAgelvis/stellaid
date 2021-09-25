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
        return array[array.length - 1];
    }

    function count(str, pattern) {
        const re = RegExp(pattern, 'g')
        return ((str || '').match(re) || []).length
    }

    function countStars(review) {

        let fullStars = count(review.innerHTML, '<title .*?>Filled Star</title>');
        let halfStars = count(review.innerHTML, '<title .*?>Half Star</title>');

        return fullStars + (halfStars / 2);
    }

    function getAgeOfReview(review){
        // currently returns the age of the review in days since the Unix Epoch
        let daysFactor = 1000 * 3600 * 24;

        var date = Date.parse(review.getElementsByClassName('dateOfReview')[0].innerText);

        return date / daysFactor;
    }

    function countLikes(review) {
        let baseReviewValue = 0;

        var likes = review.innerHTML.match(/<span>This is helpful \((.*)\)<\/span>/);

        return baseReviewValue + (likes ? parseInt(likes[1]) : 0);
    }

    function peerScore(reviews) {
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

        return score.toFixed(1);
    }

    function getReviews(html) {
        // Convert the HTML string into a document object
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        var reviews = doc.getElementsByClassName('review');

        // returns an array so that is easier to iterate over later on
        return Array.from(reviews);
    }

    function getCourseraScore(){
        var score = document.getElementsByClassName('rating-text')[0].innerText;
        // return parseFloat(score);
        // for security we match the number in regex before parsing it
        return parseFloat(score.match(/[\d\.]+/));
    }

    function getNumberRatings(){
        var count = document.querySelector('[data-test="ratings-count-without-asterisks"]').innerText;
        // we must remove the thousend comma separator
        return parseInt(count.replace(/,/g, ''));
    }

    function courseraScore(){
        console.log(getCourseraScore());
        console.log(getNumberRatings());
    }


    function getCourseReviews(course) {

        fetch('https://www.coursera.org/learn/' + course + '/reviews').then(function(response) {
            // The API call was successful!
            return response.text();
        }).then(function(html) {

            var reviews = getReviews(html);
            var score = peerScore(reviews);


            console.log('Real adjusted score of the course:', score);
            


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