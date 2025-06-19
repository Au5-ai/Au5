chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: "sidepanel.html",
    enabled: true
  });
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  var _a;
  if ((message == null ? void 0 : message.type) === "OPEN_SIDEPANEL") {
    if ((_a = sender.tab) == null ? void 0 : _a.id) {
      chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: "sidepanel.html",
        enabled: true
      });
      chrome.sidePanel.open({ tabId: sender.tab.id });
    }
  }
});
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: "http://localhost:5500/"
    });
  }
});
