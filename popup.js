// Initialize butotn with users's prefered color
let execute = document.getElementById("execute");

// When the button is clicked, inject setPageBackgroundColor into current page
execute.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['script.js']
    });
});

