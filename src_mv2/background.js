//chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
//    chrome.browserAction.setBadgeText({text: msg.text, tabId: sender.tab.id});
//    chrome.browserAction.setBadgeBackgroundColor({ color: '#4688F1' });
//    sendResponse(msg.text);
//});

browser.browserAction.onClicked.addListener(function (tab) {
    // for the current tab, inject the "inject.js" file & execute it
    browser.tabs.executeScript(tab.id, {
        file: 'script.js'
    });
});
