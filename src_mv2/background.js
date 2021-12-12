chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    chrome.browserAction.setBadgeText({text: msg.text, tabId: sender.tab.id});
    chrome.browserAction.setBadgeBackgroundColor({ color: '#4688F1' });
    sendResponse(msg.text);
});

chrome.browserAction.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['script.js']
    });
});