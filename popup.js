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

    function count (str, pattern) {
        const re = RegExp(pattern, 'g')
        return ((str || '').match(re) || []).length
    }

    function countStars(review) {

        let fullStars = count(review.innerHTML, '<title .*?>Filled Star</title>');
        let halfStars = count(review.innerHTML, '<title .*?>Half Star</title>');

        return fullStars + (halfStars / 2);
    }

    function countLikes(review) {
        return parseInt(review.innerHTML.match(/<span>This is helpful \((.*)\)<\/span>/)[1])
    }


    function getCourseReviews(course) {

        fetch('https://www.coursera.org/learn/' + course + '/reviews').then(function(response) {
            // The API call was successful!
            return response.text();
        }).then(function(html) {

            // Convert the HTML string into a document object
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, 'text/html');

            var reviews = doc.getElementsByClassName('review');
            var reviews = Array.from(reviews);

            var score = 0;
            var totalWeight = 0;

            reviews.forEach(review => {
                console.log(countStars(review))
                console.log(countLikes(review))
                // calculate the weighted average
                score += countStars(review) * countLikes(review);
                totalWeight += countLikes(review);
            });

            // calculate the definitive score of the course
            score = score / totalWeight;

            console.log('Real adjusted score of the course:', score.toFixed(1));


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