chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    chrome.action.setBadgeText({text: msg.text, tabId: sender.tab.id});
    chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
    sendResponse(msg.text);
});

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['script.js']
    });
});